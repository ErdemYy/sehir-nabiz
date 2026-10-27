import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppInput,
  AppTextArea,
  AppButton,
  AppCard,
  AppText,
  AppBadge,
  FilterChip,
} from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import {
  EventSeverity,
  type CategoryDto,
  type EventResponseDto,
  CreateEventDtoSchema,
} from '@sehir-nabiz/shared';
import { fetchCategories, FALLBACK_CATEGORIES } from '../services/categoriesApi';
import { createEventApi } from '../services/eventsCreateApi';
import { uploadSinglePhoto } from '../services/mediaUploadService';
import { draftService } from '../services/draftService';
import { LocationPickerModal } from './LocationPickerModal';
import { PhotoPickerSection } from './PhotoPickerSection';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { AuthModal } from '../../auth/components/AuthModal';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type {
  CreateEventStep,
  SelectedPhoto,
  SelectedLocation,
  EventDraft,
} from '../types/events.types';

export function CreateEventFlow(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii } = useAppTheme();
  const { getValidAccessToken } = useAuthStore();

  // Akış Durumu
  const [currentStep, setCurrentStep] = useState<CreateEventStep>(1);
  const [categories, setCategories] = useState<CategoryDto[]>(FALLBACK_CATEGORIES);

  // Form Verileri
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<EventSeverity>(EventSeverity.MEDIUM);
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);

  // Modal Durumları
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<EventResponseDto | null>(null);

  // UX & Hata Durumları
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasDraftRestored, setHasDraftRestored] = useState(false);

  // Çift tıklama koruması ref'i
  const submittingLock = useRef(false);

  // 1. Kategorileri Çek
  useEffect(() => {
    let mounted = true;
    fetchCategories().then((cats) => {
      if (mounted) {
        setCategories(cats);
        // Varsayılan olarak ilk kategoriyi seç (eğer seçilmemişse)
        setSelectedCategory((prev) => prev || cats[0] || null);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Taslağı Başlangıçta Yükle
  useEffect(() => {
    draftService.loadDraft().then((savedDraft) => {
      if (savedDraft) {
        setTitle(savedDraft.title || '');
        setDescription(savedDraft.description || '');
        setSeverity(savedDraft.severity || EventSeverity.MEDIUM);
        if (savedDraft.location) setLocation(savedDraft.location);
        if (savedDraft.photos && savedDraft.photos.length > 0) setPhotos(savedDraft.photos);
        if (savedDraft.step) setCurrentStep(savedDraft.step);

        if (savedDraft.categoryId) {
          const match = categories.find((c) => c.id === savedDraft.categoryId);
          if (match) setSelectedCategory(match);
        }
        if (savedDraft.createdEventId) {
          setCreatedEvent({ id: savedDraft.createdEventId } as EventResponseDto);
        }
        setHasDraftRestored(true);
      }
    });
  }, []);

  // 3. Form Değiştikçe Otomatik Taslak Kaydet (Debounced)
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerAutoSave = useCallback(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      const draft: EventDraft = {
        step: currentStep,
        categoryId: selectedCategory?.id || null,
        categoryCode: selectedCategory?.code || null,
        categoryNameTr: selectedCategory?.nameTr || null,
        title,
        description,
        severity,
        location,
        photos,
        createdEventId: createdEvent?.id,
        updatedAt: Date.now(),
      };
      draftService.saveDraft(draft);
    }, 400);
  }, [currentStep, selectedCategory, title, description, severity, location, photos, createdEvent]);

  useEffect(() => {
    if (!isSuccess) {
      triggerAutoSave();
    }
  }, [triggerAutoSave, isSuccess]);

  // Taslağı Temizle
  const handleClearDraft = useCallback(async () => {
    await draftService.clearDraft();
    setTitle('');
    setDescription('');
    setSeverity(EventSeverity.MEDIUM);
    setLocation(null);
    setPhotos([]);
    setCurrentStep(1);
    setHasDraftRestored(false);
  }, []);

  // Adım 1 Doğrulaması (Olay Bilgileri)
  const handleNextStep1 = useCallback(() => {
    setStepError(null);
    if (!selectedCategory) {
      setStepError('Lütfen bir olay kategorisi seçiniz.');
      return;
    }
    if (title.trim().length < 5) {
      setStepError('Olay başlığı en az 5 karakter olmalıdır.');
      return;
    }
    if (description.trim().length < 10) {
      setStepError('Açıklama en az 10 karakter olmalıdır.');
      return;
    }
    setCurrentStep(2);
  }, [selectedCategory, title, description]);

  // Adım 2 Doğrulaması (Konum ve Medya)
  const handleNextStep2 = useCallback(() => {
    setStepError(null);
    if (!location) {
      setStepError('Lütfen harita üzerinden olayın konumunu belirleyiniz.');
      return;
    }
    setCurrentStep(3);
  }, [location]);

  // Nihai Gönderim Akışı
  const handleSubmitEvent = useCallback(async () => {
    if (submittingLock.current || isSubmitting) return;

    // Oturum Kontrolü
    const token = await getValidAccessToken();
    if (!token) {
      setAuthModalOpen(true);
      return;
    }

    if (!selectedCategory || !location) {
      setStepError('Form bilgileri eksik. Lütfen önceki adımları kontrol ediniz.');
      return;
    }

    submittingLock.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Zod ile payload doğrulaması
      const payload = {
        categoryId: selectedCategory.id,
        title: title.trim(),
        description: description.trim(),
        severity,
        latitude: location.latitude,
        longitude: location.longitude,
        addressText: location.addressText,
        city: location.city,
        district: location.district,
      };

      const validation = CreateEventDtoSchema.safeParse(payload);
      if (!validation.success) {
        throw new Error(validation.error.errors[0]?.message || 'Form doğrulama hatası');
      }

      // 2. Olay Oluşturma (Mükerrerlik engeli: Eğer olay zaten oluşturulmuşsa tekrar oluşturma)
      let activeEvent = createdEvent;
      if (!activeEvent || !activeEvent.id) {
        activeEvent = await createEventApi(validation.data, token);
        setCreatedEvent(activeEvent);

        // Mükerrer Bildirim Uyarısı Var mı?
        if (activeEvent.duplicateWarning?.isDuplicateSuspected) {
          setDuplicateModalOpen(true);
        }
      }

      // 3. Medya Yüklemelerini Başlat / Eksik Kalanları Tamamla
      let anyPhotoFailed = false;
      if (photos.length > 0) {
        const updatedPhotos = [...photos];
        for (let i = 0; i < updatedPhotos.length; i++) {
          const photo = updatedPhotos[i];
          if (!photo || photo.uploadStatus === 'completed') continue;

          photo.uploadStatus = 'uploading';
          setPhotos([...updatedPhotos]);

          try {
            const currentToken = (await getValidAccessToken()) || token;
            const mediaRes = await uploadSinglePhoto(activeEvent.id, photo, currentToken);
            photo.uploadStatus = 'completed';
            photo.mediaId = mediaRes.id;
            photo.uploadError = undefined;
          } catch (uploadErr: any) {
            anyPhotoFailed = true;
            photo.uploadStatus = 'failed';
            photo.uploadError = uploadErr.message;
          }
          setPhotos([...updatedPhotos]);
        }
      }

      if (anyPhotoFailed) {
        setSubmitError(
          'Olay bildirimi oluşturuldu ancak bazı fotoğraflar yüklenemedi. Fotoğraf üzerindeki "Tekrar Dene" butonuyla yüklemeyi tamamlayabilirsiniz.'
        );
      } else {
        // 4. Taslağı Temizle ve Başarı Ekranına Geç
        await draftService.clearDraft();
        setIsSuccess(true);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Bildirim gönderilemedi. Lütfen internet bağlantınızı kontrol ediniz.');
    } finally {
      setIsSubmitting(false);
      submittingLock.current = false;
    }
  }, [
    isSubmitting,
    getValidAccessToken,
    selectedCategory,
    location,
    title,
    description,
    severity,
    photos,
    createdEvent,
  ]);

  // Başarısız Fotoğrafı Yeniden Yükle
  const handleRetryPhoto = useCallback(
    async (failedPhoto: SelectedPhoto) => {
      if (!createdEvent?.id) return;
      const token = await getValidAccessToken();
      if (!token) {
        setAuthModalOpen(true);
        return;
      }

      const updated = photos.map((p) =>
        p.id === failedPhoto.id ? { ...p, uploadStatus: 'uploading' as const, uploadError: undefined } : p
      );
      setPhotos(updated);

      try {
        const mediaRes = await uploadSinglePhoto(createdEvent.id, failedPhoto, token);
        const nextPhotos = photos.map((p) =>
          p.id === failedPhoto.id
            ? { ...p, uploadStatus: 'completed' as const, mediaId: mediaRes.id, uploadError: undefined }
            : p
        );
        setPhotos(nextPhotos);

        // Eğer tüm fotoğraflar tamamlandıysa taslağı temizleyip başarıya geç
        const remainingFailed = nextPhotos.some((p) => p.uploadStatus !== 'completed');
        if (!remainingFailed) {
          await draftService.clearDraft();
          setIsSuccess(true);
        }
      } catch (err: any) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === failedPhoto.id
              ? { ...p, uploadStatus: 'failed', uploadError: err.message }
              : p
          )
        );
      }
    },
    [createdEvent, getValidAccessToken, photos]
  );

  // Form Sıfırlama (Yeni Bildirim)
  const handleResetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setSeverity(EventSeverity.MEDIUM);
    setLocation(null);
    setPhotos([]);
    setCurrentStep(1);
    setIsSuccess(false);
    setCreatedEvent(null);
    setSubmitError(null);
    setStepError(null);
  }, []);

  // ==========================================
  // BAŞARI EKRANI
  // ==========================================
  if (isSuccess && createdEvent) {
    const hasFailedMedia = photos.some((p) => p.uploadStatus === 'failed');

    return (
      <AppScreen contentContainerStyle={{ padding: spacing.xl, alignItems: 'center' }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.xl,
            marginBottom: spacing.md,
          }}
        >
          <CheckCircle2 size={36} color={theme.primary} />
        </View>

        <AppText variant="headingL" weight="bold" align="center" style={{ marginBottom: spacing.xs }}>
          Bildirim Alındı!
        </AppText>

        <AppText variant="bodyM" color={theme.textSecondary} align="center" style={{ marginBottom: spacing.lg }}>
          İnceleme tamamlandığında haritada yayınlanabilir.
        </AppText>

        {/* Durum Kartı */}
        <AppCard style={{ width: '100%', marginBottom: spacing.lg, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 8 }}>
            <Clock size={16} color={theme.primary} />
            <AppText variant="caption" weight="bold" color={theme.primary}>
              DURUM: İNCELEME BEKLİYOR (PENDING_REVIEW)
            </AppText>
          </View>
          <AppText variant="caption" color={theme.textSecondary}>
            Bildiriminiz topluluk teyidi ve moderatör güvenlik denetimine iletilmiştir. Doğrulanana kadar resmî olay niteliği taşımaz.
          </AppText>
        </AppCard>

        {/* Kısmi Medya Başarısızlığı Bildirimi */}
        {hasFailedMedia ? (
          <AppCard
            style={{
              width: '100%',
              marginBottom: spacing.lg,
              padding: spacing.md,
              backgroundColor: '#FEF2F2',
              borderColor: '#F87171',
              borderWidth: 1,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 6 }}>
              <AlertCircle size={16} color="#DC2626" />
              <AppText variant="caption" weight="bold" color="#B91C1C">
                Bazı Fotoğraflar Yüklenemedi
              </AppText>
            </View>
            <AppText variant="caption" color="#991B1B" style={{ marginBottom: spacing.sm }}>
              Olay kaydınız oluşturuldu ancak fotoğrafların yüklenmesinde hata oluştu. Aşağıdaki fotoğrafa dokunarak yeniden deneyebilirsiniz.
            </AppText>

            <PhotoPickerSection
              photos={photos}
              onChangePhotos={setPhotos}
              onRetryPhoto={handleRetryPhoto}
              disabled
            />
          </AppCard>
        ) : null}

        <View style={{ width: '100%', gap: spacing.sm, marginTop: spacing.md }}>
          <AppButton
            title="Haritaya Dön"
            variant="primary"
            onPress={() => router.push('/')}
            fullWidth
          />
          <AppButton
            title="Yeni Olay Bildir"
            variant="secondary"
            onPress={handleResetForm}
            fullWidth
          />
        </View>
      </AppScreen>
    );
  }

  // ==========================================
  // ÇOK ADIMLI FORM EKRANI
  // ==========================================
  return (
    <AppScreen scrollable keyboardAvoiding contentContainerStyle={{ paddingBottom: 110 }}>
      <AppHeader
        title="Olay Bildir"
        subtitle="Şehrinizdeki aksaklığı veya gelişmeyi paylaşın"
      />

      <View style={{ paddingHorizontal: spacing.lg }}>
        {/* Üst İlerleme Göstergesi (3 Adım) */}
        <View style={styles.stepperContainer}>
          <View style={[styles.stepItem, currentStep >= 1 && styles.stepItemActive]}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: currentStep >= 1 ? theme.primary : theme.surfaceElevated,
                  borderColor: currentStep >= 1 ? theme.primary : theme.border,
                },
              ]}
            >
              <AppText variant="caption" weight="bold" color={currentStep >= 1 ? '#FFFFFF' : theme.textSecondary}>
                1
              </AppText>
            </View>
            <AppText
              variant="caption"
              weight={currentStep === 1 ? 'bold' : 'medium'}
              color={currentStep === 1 ? theme.primary : theme.textSecondary}
            >
              Olay Bilgileri
            </AppText>
          </View>

          <View style={[styles.stepDivider, { backgroundColor: currentStep >= 2 ? theme.primary : theme.border }]} />

          <View style={[styles.stepItem, currentStep >= 2 && styles.stepItemActive]}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: currentStep >= 2 ? theme.primary : theme.surfaceElevated,
                  borderColor: currentStep >= 2 ? theme.primary : theme.border,
                },
              ]}
            >
              <AppText variant="caption" weight="bold" color={currentStep >= 2 ? '#FFFFFF' : theme.textSecondary}>
                2
              </AppText>
            </View>
            <AppText
              variant="caption"
              weight={currentStep === 2 ? 'bold' : 'medium'}
              color={currentStep === 2 ? theme.primary : theme.textSecondary}
            >
              Konum & Fotoğraf
            </AppText>
          </View>

          <View style={[styles.stepDivider, { backgroundColor: currentStep >= 3 ? theme.primary : theme.border }]} />

          <View style={[styles.stepItem, currentStep >= 3 && styles.stepItemActive]}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: currentStep >= 3 ? theme.primary : theme.surfaceElevated,
                  borderColor: currentStep >= 3 ? theme.primary : theme.border,
                },
              ]}
            >
              <AppText variant="caption" weight="bold" color={currentStep >= 3 ? '#FFFFFF' : theme.textSecondary}>
                3
              </AppText>
            </View>
            <AppText
              variant="caption"
              weight={currentStep === 3 ? 'bold' : 'medium'}
              color={currentStep === 3 ? theme.primary : theme.textSecondary}
            >
              Önizleme
            </AppText>
          </View>
        </View>

        {/* Taslak Geri Yüklendi Uyarısı */}
        {hasDraftRestored ? (
          <View
            style={[
              styles.draftBanner,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
                borderRadius: radii.medium,
                marginBottom: spacing.md,
              },
            ]}
          >
            <AppText variant="caption" color={theme.textSecondary} style={{ flex: 1 }}>
              Kayıtlı taslağınız yüklendi.
            </AppText>
            <TouchableOpacity onPress={handleClearDraft}>
              <AppText variant="caption" weight="bold" color={theme.error}>
                Taslağı Temizle
              </AppText>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Adım Hata Banner'ı */}
        {stepError ? (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: theme.errorLight,
                borderColor: theme.error,
                borderRadius: radii.medium,
                marginBottom: spacing.md,
              },
            ]}
          >
            <AlertCircle size={16} color={theme.error} />
            <AppText variant="caption" color={theme.error} style={{ flex: 1 }}>
              {stepError}
            </AppText>
          </View>
        ) : null}

        {/* ======================================================== */}
        {/* ADIM 1: OLAY BİLGİLERİ                                    */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <View>
            {/* Kategori Seçim Izgarası */}
            <AppText variant="bodyS" weight="semibold" style={{ marginBottom: spacing.xs }}>
              Kategori Seçin
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.xs, marginBottom: spacing.lg }}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory?.code === cat.code;
                return (
                  <TouchableOpacity
                    key={cat.id || cat.code}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryCard,
                      {
                        borderRadius: radii.medium,
                        borderColor: isSelected ? theme.primary : theme.border,
                        backgroundColor: isSelected ? theme.primaryLight : theme.surface,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryColorDot,
                        { backgroundColor: cat.colorHex || theme.primary },
                      ]}
                    />
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? theme.primaryDark : theme.text}
                    >
                      {cat.nameTr}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Olay Başlığı */}
            <AppInput
              label="Olay Başlığı"
              placeholder="Örn: Sivas Caddesi sağ şerit kaza"
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />

            {/* Ayrıntılı Açıklama */}
            <AppTextArea
              label="Açıklama"
              placeholder="Ne olduğunu kısaca anlat... Faydalı detaylar giriniz."
              value={description}
              onChangeText={setDescription}
              maxLength={2000}
            />

            {/* Önem Seviyesi */}
            <AppText variant="bodyS" weight="semibold" style={{ marginBottom: spacing.xs }}>
              Önem Seviyesi
            </AppText>
            <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xl }}>
              <FilterChip
                label="Düşük"
                selected={severity === EventSeverity.LOW}
                onPress={() => setSeverity(EventSeverity.LOW)}
              />
              <FilterChip
                label="Orta"
                selected={severity === EventSeverity.MEDIUM}
                onPress={() => setSeverity(EventSeverity.MEDIUM)}
              />
              <FilterChip
                label="Yüksek"
                selected={severity === EventSeverity.HIGH}
                onPress={() => setSeverity(EventSeverity.HIGH)}
              />
              <FilterChip
                label="Kritik"
                selected={severity === EventSeverity.CRITICAL}
                onPress={() => setSeverity(EventSeverity.CRITICAL)}
              />
            </View>

            {severity === EventSeverity.CRITICAL ? (
              <View
                style={[
                  styles.warningBox,
                  {
                    backgroundColor: '#FFFBEB',
                    borderColor: '#FDE68A',
                    borderRadius: radii.medium,
                    marginBottom: spacing.lg,
                  },
                ]}
              >
                <ShieldAlert size={16} color="#D97706" />
                <AppText variant="caption" color="#92400E" style={{ flex: 1 }}>
                  Kritik seçimi resmî bir afet veya acil durum alarmı üretmez. Acil durumlarda lütfen 112 Acil Çağrı Merkezini arayınız.
                </AppText>
              </View>
            ) : null}

            {/* İleri Butonu */}
            <AppButton
              title="Konum ve Fotoğraflara Geç"
              variant="primary"
              onPress={handleNextStep1}
              fullWidth
            />
          </View>
        )}

        {/* ======================================================== */}
        {/* ADIM 2: KONUM VE FOTOĞRAFLAR                              */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <View>
            {/* Konum Seçim Kartı */}
            <AppText variant="bodyS" weight="semibold" style={{ marginBottom: spacing.xs }}>
              Olay Konumu
            </AppText>
            <AppCard
              style={{
                marginBottom: spacing.lg,
                padding: spacing.md,
                borderColor: location ? theme.primary : theme.border,
                borderWidth: location ? 1.5 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radii.pill,
                    backgroundColor: location ? theme.primaryLight : theme.surfaceElevated,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={20} color={location ? theme.primary : theme.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyS" weight="bold">
                    {location
                      ? `${location.latitude.toFixed(4)}° K, ${location.longitude.toFixed(4)}° D`
                      : 'Konum Henüz Belirlenmedi'}
                  </AppText>
                  <AppText variant="caption" color={theme.textSecondary}>
                    {location
                      ? 'Harita üzerinden seçildi (Doğrulandı)'
                      : 'Lütfen harita üzerinden olayın yerini işaretleyin.'}
                  </AppText>
                </View>
              </View>

              <AppButton
                title={location ? 'Haritada Konumu Değiştir' : 'Haritadan Konum Seç'}
                variant={location ? 'secondary' : 'primary'}
                onPress={() => setLocationModalOpen(true)}
                fullWidth
              />
            </AppCard>

            {/* Fotoğraf Seçim Alanı */}
            <PhotoPickerSection
              photos={photos}
              onChangePhotos={setPhotos}
            />

            {/* Adım Gezinme Butonları */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <AppButton
                title="Geri"
                variant="secondary"
                onPress={() => setCurrentStep(1)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Önizlemeye Geç"
                variant="primary"
                onPress={handleNextStep2}
                disabled={!location}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* ADIM 3: ÖNİZLEME VE GÖNDERİM                             */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <View>
            <AppText variant="bodyS" weight="semibold" style={{ marginBottom: spacing.xs }}>
              Bildirim Özeti
            </AppText>

            <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
              {/* Kategori ve Önem Rozeti */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  {selectedCategory ? (
                    <AppBadge
                      label={selectedCategory.nameTr}
                      variant="primary"
                      size="sm"
                    />
                  ) : null}
                  <AppBadge
                    label={
                      severity === EventSeverity.LOW
                        ? 'Düşük Önem'
                        : severity === EventSeverity.MEDIUM
                        ? 'Orta Önem'
                        : severity === EventSeverity.HIGH
                        ? 'Yüksek Önem'
                        : 'Kritik Önem'
                    }
                    variant={severity === EventSeverity.CRITICAL ? 'warning' : 'default'}
                    size="sm"
                  />
                </View>
              </View>

              {/* Başlık */}
              <AppText variant="headingM" weight="bold" style={{ marginBottom: spacing.xs }}>
                {title}
              </AppText>

              {/* Konum */}
              {location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm }}>
                  <MapPin size={14} color={theme.primary} />
                  <AppText variant="caption" color={theme.textSecondary}>
                    {location.latitude.toFixed(5)}° K, {location.longitude.toFixed(5)}° D
                  </AppText>
                </View>
              ) : null}

              {/* Açıklama */}
              <AppText variant="bodyS" color={theme.textSecondary} style={{ marginBottom: spacing.md }}>
                {description}
              </AppText>

              {/* Eklenen Fotoğraflar */}
              {photos.length > 0 ? (
                <View>
                  <AppText variant="caption" weight="semibold" style={{ marginBottom: 6 }}>
                    Eklenen Fotoğraflar ({photos.length} Adet)
                  </AppText>
                  <PhotoPickerSection photos={photos} onChangePhotos={setPhotos} disabled />
                </View>
              ) : (
                <AppText variant="caption" color={theme.textSecondary}>
                  Fotoğraf eklenmedi.
                </AppText>
              )}
            </AppCard>

            {/* İnceleme Bilgilendirme Kutusu */}
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  borderRadius: radii.medium,
                  marginBottom: spacing.lg,
                },
              ]}
            >
              <Clock size={16} color={theme.primary} />
              <AppText variant="caption" color={theme.textSecondary} style={{ flex: 1 }}>
                Bildiriminiz gönderildiğinde "İnceleme Bekliyor" statüsüne alınacaktır. Topluluk teyidi ve moderasyon sonrasında haritada tüm kullanıcılara açılacaktır.
              </AppText>
            </View>

            {/* Gönderim Hatası Bildirimi */}
            {submitError ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: theme.errorLight,
                    borderColor: theme.error,
                    borderRadius: radii.medium,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                <AlertCircle size={16} color={theme.error} />
                <AppText variant="caption" color={theme.error} style={{ flex: 1 }}>
                  {submitError}
                </AppText>
              </View>
            ) : null}

            {/* Butonlar */}
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <AppButton
                title="Düzenle"
                variant="secondary"
                onPress={() => setCurrentStep(2)}
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Bildirimi Gönder"
                loading={isSubmitting}
                variant="primary"
                onPress={handleSubmitEvent}
                disabled={isSubmitting}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Harita Konum Seçici Modalı */}
      <LocationPickerModal
        visible={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelectLocation={(loc) => setLocation(loc)}
        initialCoords={location}
      />

      {/* Giriş / Kayıt Ol Modalı */}
      <AuthModal
        visible={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          // Giriş başarılı olunca gönderimi otomatik devam ettir
          handleSubmitEvent();
        }}
      />

      {/* Mükerrer Bildirim Uyarısı Modalı */}
      <DuplicateWarningModal
        visible={duplicateModalOpen}
        warning={createdEvent?.duplicateWarning || null}
        onProceed={() => setDuplicateModalOpen(false)}
        onCancel={() => {
          setDuplicateModalOpen(false);
          setCurrentStep(1);
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 4,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepItemActive: {},
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDivider: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderWidth: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  categoryColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
