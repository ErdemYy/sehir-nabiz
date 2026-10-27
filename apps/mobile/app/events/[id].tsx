import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  CheckCheck,
  RotateCcw,
  User,
  Share2,
  ArrowLeft,
} from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppText,
  AppButton,
  AppCard,
  AppBadge,
  StatusBadge,
  ErrorState,
  LoadingState,
  IconButton,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { useAuthStore } from '../../src/features/auth';
import { AuthModal } from '../../src/features/auth/components/AuthModal';
import {
  fetchEventDetail,
  fetchFeedbackSummary,
  submitEventFeedback,
  removeEventFeedback,
} from '../../src/features/events/services/feedbackApi';
import type { EventResponseDto, FeedbackSummaryDto } from '@sehir-nabiz/shared';
import { FeedbackType } from '@sehir-nabiz/shared';

export default function EventDetailScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, spacing } = useAppTheme();

  const { isAuthenticated, getValidAccessToken } = useAuthStore();

  const [event, setEvent] = useState<EventResponseDto | null>(null);
  const [summary, setSummary] = useState<FeedbackSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingVote, setPendingVote] = useState<FeedbackType | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Verileri yükle
  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      const [eventData, summaryData] = await Promise.all([
        fetchEventDetail(id, token),
        fetchFeedbackSummary(id, token),
      ]);
      setEvent(eventData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Olay detayları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [id, getValidAccessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Geri Bildirim Gönderme
  const handleFeedbackPress = async (type: FeedbackType) => {
    if (event?.isDemo) {
      Alert.alert('Demo Veri', 'Demo kayıtları üzerinde topluluk geri bildirimi yapılamaz.');
      return;
    }

    if (!isAuthenticated) {
      setPendingVote(type);
      setShowAuthModal(true);
      return;
    }

    setIsSubmittingFeedback(true);
    setSuccessBanner(null);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setShowAuthModal(true);
        return;
      }

      const updatedSummary = await submitEventFeedback(id!, type, null, token);
      setSummary(updatedSummary);
      setSuccessBanner(
        type === FeedbackType.CONFIRM
          ? 'Teyidiniz başarıyla kaydedildi.'
          : type === FeedbackType.DISPUTE
          ? 'İtirazınız kaydedildi, moderasyon ekibine iletildi.'
          : 'Sorunun çözüldüğü bilgisi kaydedildi.',
      );
    } catch (err: any) {
      Alert.alert('İşlem Başarısız', err.message || 'Geri bildirim gönderilemedi.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Geri Bildirimi Geri Çekme
  const handleWithdrawFeedback = async () => {
    if (!summary?.userFeedback) return;

    Alert.alert(
      'Geri Bildirimi Kaldır',
      'Verdiğiniz topluluk geri bildirimini geri çekmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Geri Çek',
          style: 'destructive',
          onPress: async () => {
            setIsSubmittingFeedback(true);
            try {
              const token = await getValidAccessToken();
              if (!token) return;
              const updatedSummary = await removeEventFeedback(id!, token);
              setSummary(updatedSummary);
              setSuccessBanner('Geri bildiriminiz başarıyla kaldırıldı.');
            } catch (err: any) {
              Alert.alert('Hata', err.message || 'Geri çekme işlemi başarısız.');
            } finally {
              setIsSubmittingFeedback(false);
            }
          },
        },
      ],
    );
  };

  // Oturum açıldıktan sonra bekleyen oy varsa uygula
  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    if (pendingVote) {
      const vote = pendingVote;
      setPendingVote(null);
      await handleFeedbackPress(vote);
    } else {
      await loadData();
    }
  };

  if (isLoading) {
    return (
      <AppScreen>
        <AppHeader
          title="Olay Detayı"
          leftAction={
            <IconButton
              icon={<ArrowLeft size={20} color={theme.text} />}
              onPress={() => router.back()}
              variant="ghost"
              accessibilityLabel="Geri Dön"
            />
          }
        />
        <LoadingState message="Olay bilgileri getiriliyor..." />
      </AppScreen>
    );
  }

  if (error || !event) {
    return (
      <AppScreen>
        <AppHeader
          title="Olay Detayı"
          leftAction={
            <IconButton
              icon={<ArrowLeft size={20} color={theme.text} />}
              onPress={() => router.back()}
              variant="ghost"
              accessibilityLabel="Geri Dön"
            />
          }
        />
        <ErrorState
          title="Olay Bulunamadı"
          message={error || 'Aradığınız olay kaldırılmış veya incelemede olabilir.'}
          onRetry={loadData}
        />
      </AppScreen>
    );
  }

  const userVote = summary?.userFeedback?.type;

  return (
    <AppScreen scrollable style={{ paddingBottom: insets.bottom + 40 }}>
      <AppHeader
        title="Olay Detayı"
        leftAction={
          <IconButton
            icon={<ArrowLeft size={20} color={theme.text} />}
            onPress={() => router.back()}
            variant="ghost"
            accessibilityLabel="Geri Dön"
          />
        }
        rightAction={
          <IconButton
            icon={<Share2 size={20} color={theme.text} />}
            onPress={() => {
              Alert.alert('Paylaş', 'Olay bağlantısı panoya kopyalandı.');
            }}
            variant="ghost"
            accessibilityLabel="Paylaş"
          />
        }
      />

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}>
        {/* Başarılı İşlem Bildirimi */}
        {successBanner ? (
          <AppCard
            style={{
              marginBottom: spacing.md,
              backgroundColor: '#ECFDF5',
              borderColor: '#6EE7B7',
              padding: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <CheckCircle2 size={18} color="#059669" />
              <AppText variant="bodyS" color="#065F46" weight="medium" style={{ flex: 1 }}>
                {successBanner}
              </AppText>
            </View>
          </AppCard>
        ) : null}

        {/* Demo Uyarısı */}
        {event.isDemo ? (
          <AppCard
            style={{
              marginBottom: spacing.md,
              backgroundColor: '#FFFBEB',
              borderColor: '#FDE68A',
              padding: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <AlertTriangle size={20} color="#D97706" />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" weight="bold" color="#B45309">
                  Sentetik Demo Kaydı
                </AppText>
                <AppText variant="caption" color="#92400E">
                  Bu olay geliştirme ve test amacıyla oluşturulmuştur. Resmî veya doğrulanmış nitelik taşımaz.
                </AppText>
              </View>
            </View>
          </AppCard>
        ) : null}

        {/* Üst Bilgi Rozetleri */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <AppBadge label={event.category.nameTr} variant="primary" size="md" />
            <StatusBadge status={event.status} size="md" />
            {event.severity ? (
              <AppBadge label={`Önem: ${event.severity}`} type="outline" size="md" />
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={14} color={theme.textSecondary} />
            <AppText variant="caption" color={theme.textSecondary}>
              {new Date(event.createdAt).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </AppText>
          </View>
        </View>

        {/* Başlık */}
        <AppText variant="headingXL" weight="bold" style={{ marginBottom: spacing.sm }}>
          {event.title}
        </AppText>

        {/* Konum Bilgisi */}
        <AppCard style={{ marginBottom: spacing.md, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
            <MapPin size={20} color={theme.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodyM" weight="semibold">
                {event.district ? `${event.district}, ` : ''}
                {event.city || 'Kayseri'}
              </AppText>
              {event.addressText ? (
                <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 2 }}>
                  {event.addressText}
                </AppText>
              ) : null}
              <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 4 }}>
                Koordinat: {event.location.latitude.toFixed(4)}° K, {event.location.longitude.toFixed(4)}° D
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Açıklama */}
        <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
          <AppText variant="caption" color={theme.textSecondary} style={{ marginBottom: spacing.xs }}>
            Olay Açıklaması
          </AppText>
          <AppText variant="bodyM" style={{ lineHeight: 22 }}>
            {event.description}
          </AppText>
        </AppCard>

        {/* Yazar Bilgisi */}
        {event.author ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.lg,
              paddingHorizontal: spacing.xs,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.surfaceElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={16} color={theme.textSecondary} />
            </View>
            <View>
              <AppText variant="caption" weight="medium">
                Bildiren: {event.author.displayName}
              </AppText>
              <AppText variant="caption" color={theme.textSecondary}>
                Güvenilirlik Puanı: {event.author.reputationScore}
              </AppText>
            </View>
          </View>
        ) : null}

        {/* TOPLULUK GÜVENİLİRLİK DEĞERLENDİRMESİ */}
        <AppCard
          style={{
            marginBottom: spacing.lg,
            padding: spacing.md,
            backgroundColor: theme.surfaceElevated,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Shield size={18} color={theme.primary} />
              <AppText variant="bodyM" weight="bold">
                Topluluk Değerlendirmesi
              </AppText>
            </View>
            <AppText variant="caption" color={theme.textSecondary}>
              {summary ? `${summary.totalCount} Bildirim` : '0 Bildirim'}
            </AppText>
          </View>

          {/* Sayısal Göstergeler (Açıklanabilir) */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: spacing.sm,
              paddingVertical: spacing.xs,
            }}
          >
            <View style={{ alignItems: 'center', flex: 1 }}>
              <AppText variant="headingM" weight="bold" color="#059669">
                {summary?.confirmCount || 0}
              </AppText>
              <AppText variant="caption" color={theme.textSecondary} align="center">
                Gördüm
              </AppText>
            </View>

            <View style={{ width: 1, backgroundColor: theme.border, marginHorizontal: spacing.xs }} />

            <View style={{ alignItems: 'center', flex: 1 }}>
              <AppText variant="headingM" weight="bold" color="#DC2626">
                {summary?.disputeCount || 0}
              </AppText>
              <AppText variant="caption" color={theme.textSecondary} align="center">
                İtiraz
              </AppText>
            </View>

            <View style={{ width: 1, backgroundColor: theme.border, marginHorizontal: spacing.xs }} />

            <View style={{ alignItems: 'center', flex: 1 }}>
              <AppText variant="headingM" weight="bold" color="#2563EB">
                {summary?.resolvedReportCount || 0}
              </AppText>
              <AppText variant="caption" color={theme.textSecondary} align="center">
                Çözüldü
              </AppText>
            </View>
          </View>

          {/* Açıklama Metni (Sahte kesinlik içermez) */}
          <AppText
            variant="caption"
            color={theme.textSecondary}
            style={{
              paddingTop: spacing.xs,
              borderTopWidth: 1,
              borderTopColor: theme.border,
            }}
          >
            {summary?.communityAssessment || 'Değerlendirme yükleniyor...'}
          </AppText>

          <AppText
            variant="caption"
            color={theme.textSecondary}
            style={{ marginTop: 4, fontStyle: 'italic', fontSize: 11 }}
          >
            * {summary?.disclaimer || 'Topluluk bildirimleri resmî doğrulama niteliği taşımaz.'}
          </AppText>
        </AppCard>

        {/* GERİ BİLDİRİM BUTONLARI */}
        <AppText variant="headingM" weight="bold" style={{ marginBottom: spacing.sm }}>
          Bu Olay Hakkında Ne Biliyorsunuz?
        </AppText>

        <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
          {/* 1. Ben de Gördüm (CONFIRM) */}
          <AppButton
            title={userVote === FeedbackType.CONFIRM ? '✓ Ben de Gördüm (Seçildi)' : 'Ben de Gördüm'}
            variant={userVote === FeedbackType.CONFIRM ? 'primary' : 'secondary'}
            leftIcon={<CheckCircle2 size={18} color={userVote === FeedbackType.CONFIRM ? '#FFFFFF' : theme.primary} />}
            loading={isSubmittingFeedback && userVote !== FeedbackType.CONFIRM}
            disabled={isSubmittingFeedback || event.isDemo}
            onPress={() => handleFeedbackPress(FeedbackType.CONFIRM)}
          />

          {/* 2. Yanlış Bilgi Bildir (DISPUTE) */}
          <AppButton
            title={userVote === FeedbackType.DISPUTE ? '✓ Yanlış Bilgi Bildirdiniz' : 'Yanlış Bilgi Bildir'}
            variant={userVote === FeedbackType.DISPUTE ? 'primary' : 'outline'}
            leftIcon={<AlertTriangle size={18} color={userVote === FeedbackType.DISPUTE ? '#FFFFFF' : theme.error} />}
            loading={isSubmittingFeedback && userVote !== FeedbackType.DISPUTE}
            disabled={isSubmittingFeedback || event.isDemo}
            onPress={() => handleFeedbackPress(FeedbackType.DISPUTE)}
          />

          {/* 3. Çözüldü Bildir (RESOLVED_REPORT) */}
          <AppButton
            title={userVote === FeedbackType.RESOLVED_REPORT ? '✓ Çözüldü Bildirdiniz' : 'Sorun Çözüldü Bildir'}
            variant={userVote === FeedbackType.RESOLVED_REPORT ? 'primary' : 'secondary'}
            leftIcon={<CheckCheck size={18} color={userVote === FeedbackType.RESOLVED_REPORT ? '#FFFFFF' : theme.primary} />}
            loading={isSubmittingFeedback && userVote !== FeedbackType.RESOLVED_REPORT}
            disabled={isSubmittingFeedback || event.isDemo}
            onPress={() => handleFeedbackPress(FeedbackType.RESOLVED_REPORT)}
          />
        </View>

        {/* Kullanıcının geri bildirimini geri çekme opsiyonu */}
        {userVote ? (
          <TouchableOpacity
            onPress={handleWithdrawFeedback}
            disabled={isSubmittingFeedback}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: spacing.sm,
            }}
          >
            <RotateCcw size={14} color={theme.textSecondary} />
            <AppText variant="caption" color={theme.textSecondary} weight="medium">
              Geri Bildirimimi Kaldır (Geri Çek)
            </AppText>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* Oturum Açma Modalı */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingVote(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </AppScreen>
  );
}
