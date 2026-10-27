import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MapPin,
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
  FilterChip,
  EmptyState,
  ErrorState,
  LoadingState,
  IconButton,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { useAuthStore } from '../../src/features/auth';
import {
  fetchModerationEvents,
  updateEventStatus,
} from '../../src/features/events/services/moderationApi';
import { socketService } from '../../src/features/realtime';
import type { ModerationEventItemDto } from '@sehir-nabiz/shared';
import { EventStatus, UserRole, RealtimeEventName } from '@sehir-nabiz/shared';

export default function ModerationScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, spacing, radii } = useAppTheme();

  const { user, isAuthenticated, getValidAccessToken } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'PENDING_REVIEW' | 'DISPUTED' | 'ALL'>('PENDING_REVIEW');
  const [events, setEvents] = useState<ModerationEventItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Yetki Kontrolü
  const isAuthorized =
    isAuthenticated &&
    user &&
    (user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN);

  const loadEvents = useCallback(async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error('Oturum anahtarı alınamadı.');

      const statusFilter =
        activeTab === 'ALL' ? undefined : activeTab;

      const res = await fetchModerationEvents(
        { status: statusFilter, limit: 30 },
        token,
      );
      setEvents(res.items || []);
    } catch (err: any) {
      setError(err.message || 'Moderasyon olayları alınamadı.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, activeTab, getValidAccessToken]);

  useEffect(() => {
    if (!isAuthorized) {
      return undefined;
    }

    loadEvents();

    // Moderatör kuyruğu canlı güncellemeleri (Phase 9)
    socketService.joinModeration().catch(() => {});

    const unsubMod = socketService.on(RealtimeEventName.MODERATION_EVENT_ADDED, () => {
      loadEvents();
    });
    const unsubStatus = socketService.on(RealtimeEventName.EVENT_STATUS_CHANGED, () => {
      loadEvents();
    });

    return () => {
      unsubMod();
      unsubStatus();
    };
  }, [isAuthorized, loadEvents]);

  // Karar Verme Fonksiyonu
  const handleDecision = (
    eventId: string,
    targetStatus: EventStatus,
    actionTitle: string,
  ) => {
    Alert.alert(
      actionTitle,
      `Bu olayın durumunu "${targetStatus}" olarak değiştirmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          style: targetStatus === EventStatus.REJECTED ? 'destructive' : 'default',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const token = await getValidAccessToken();
              if (!token) throw new Error('Oturum süresi dolmuş.');

              await updateEventStatus(
                eventId,
                targetStatus,
                reasonInput.trim() || undefined,
                token,
              );

              Alert.alert('Başarılı', `Olay durumu ${targetStatus} olarak güncellendi.`);
              setReasonInput('');
              setSelectedEventId(null);
              await loadEvents();
            } catch (err: any) {
              Alert.alert('İşlem Başarısız', err.message || 'Durum güncellenemedi.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  };

  // Yetkisiz Kullanıcı Kalkanı
  if (!isAuthorized) {
    return (
      <AppScreen>
        <AppHeader
          title="Yetkisiz Erişim"
          leftAction={
            <IconButton
              icon={<ArrowLeft size={20} color={theme.text} />}
              onPress={() => router.back()}
              variant="ghost"
              accessibilityLabel="Geri Dön"
            />
          }
        />
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl }}>
          <EmptyState
            title="Moderasyon Yetkisi Gerekli"
            description="Bu ekran yalnızca yetkili Moderatör ve Sistem Yöneticisi hesapları tarafından görüntülenebilir. Yetkisiz erişim denemeleri loglanmaktadır."
            actionTitle="Ana Sayfaya Dön"
            onAction={() => router.replace('/(tabs)')}
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
      <AppHeader
        title="Moderatör Paneli"
        subtitle="Topluluk bildirimleri ve inceleme kuyruğu"
        leftAction={
          <IconButton
            icon={<ArrowLeft size={20} color={theme.text} />}
            onPress={() => router.back()}
            variant="ghost"
            accessibilityLabel="Geri Dön"
          />
        }
      />

      {/* Sekmeler */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.xs,
        }}
      >
        <FilterChip
          label="İnceleme Bekleyenler"
          selected={activeTab === 'PENDING_REVIEW'}
          onPress={() => setActiveTab('PENDING_REVIEW')}
        />
        <FilterChip
          label="İtiraz Edilenler"
          selected={activeTab === 'DISPUTED'}
          onPress={() => setActiveTab('DISPUTED')}
        />
        <FilterChip
          label="Tümü"
          selected={activeTab === 'ALL'}
          onPress={() => setActiveTab('ALL')}
        />
      </View>

      {/* Liste / Yükleme / Hata */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.xs }}>
        {isLoading ? (
          <LoadingState message="Kuyruktaki olaylar yükleniyor..." />
        ) : error ? (
          <ErrorState title="Hata" message={error} onRetry={loadEvents} />
        ) : events.length === 0 ? (
          <EmptyState
            title="Kuyruk Boş"
            description="Seçilen kriterde bekleyen veya itirazlı olay bulunmuyor."
            actionTitle="Yenile"
            onAction={loadEvents}
          />
        ) : (
          events.map((event) => {
            const isSelected = selectedEventId === event.id;
            const summary = event.feedbackSummary;

            return (
              <AppCard
                key={event.id}
                style={{
                  marginBottom: spacing.md,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? theme.primary : theme.border,
                }}
              >
                {/* Üst Bilgi */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.xs,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <AppBadge label={event.category.nameTr} variant="primary" size="sm" />
                    <StatusBadge status={event.status} size="sm" />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={theme.textSecondary} />
                    <AppText variant="caption" color={theme.textSecondary}>
                      {new Date(event.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </AppText>
                  </View>
                </View>

                {/* Başlık */}
                <AppText variant="headingM" weight="bold" style={{ marginBottom: spacing.xs }}>
                  {event.title}
                </AppText>

                {/* Açıklama */}
                <AppText
                  variant="bodyS"
                  color={theme.textSecondary}
                  numberOfLines={isSelected ? undefined : 2}
                  style={{ marginBottom: spacing.sm }}
                >
                  {event.description}
                </AppText>

                {/* Konum & Yazar */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} color={theme.primary} />
                    <AppText variant="caption" color={theme.textSecondary}>
                      {event.district || 'Merkez'}, {event.city || 'Kayseri'}
                    </AppText>
                  </View>
                  <AppText variant="caption" color={theme.textSecondary}>
                    Yazar: {event.author.displayName} (İtibar: {event.author.reputationScore})
                  </AppText>
                </View>

                {/* Topluluk Geri Bildirimi Sayaçları */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: theme.surfaceElevated,
                    padding: spacing.xs,
                    borderRadius: radii.sm,
                    justifyContent: 'space-around',
                    marginBottom: spacing.sm,
                  }}
                >
                  <AppText variant="caption" color="#059669" weight="bold">
                    ✓ {summary?.confirmCount || 0} Gördüm
                  </AppText>
                  <AppText variant="caption" color="#DC2626" weight="bold">
                    ✗ {summary?.disputeCount || 0} İtiraz
                  </AppText>
                  <AppText variant="caption" color="#2563EB" weight="bold">
                    ● {summary?.resolvedReportCount || 0} Çözüldü
                  </AppText>
                </View>

                {/* Detay Aç / Kapat & Karar Formu */}
                {isSelected ? (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: theme.border,
                      paddingTop: spacing.sm,
                      marginTop: spacing.xs,
                    }}
                  >
                    <AppText variant="caption" color={theme.textSecondary} style={{ marginBottom: 4 }}>
                      Moderasyon Gerekçesi (Opsiyonel / Audit Trail):
                    </AppText>
                    <TextInput
                      value={reasonInput}
                      onChangeText={setReasonInput}
                      placeholder="Örn: Görsel teyit edildi veya sahte bildirim..."
                      placeholderTextColor={theme.textSecondary}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: radii.sm,
                        padding: spacing.sm,
                        backgroundColor: theme.surface,
                        color: theme.text,
                        fontSize: 13,
                        marginBottom: spacing.sm,
                      }}
                    />

                    {/* Karar Butonları */}
                    <View style={{ gap: spacing.xs }}>
                      {event.status === EventStatus.PENDING_REVIEW ? (
                        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                          <AppButton
                            title="Yayınla (Onayla)"
                            variant="primary"
                            leftIcon={<CheckCircle size={16} color="#FFFFFF" />}
                            loading={isProcessing}
                            onPress={() => handleDecision(event.id, EventStatus.ACTIVE, 'Olayı Yayınla')}
                            style={{ flex: 1 }}
                          />
                          <AppButton
                            title="Reddet (Spam)"
                            variant="secondary"
                            leftIcon={<XCircle size={16} color={theme.error} />}
                            loading={isProcessing}
                            onPress={() => handleDecision(event.id, EventStatus.REJECTED, 'Olayı Reddet')}
                            style={{ flex: 1 }}
                          />
                        </View>
                      ) : null}

                      {event.status === EventStatus.ACTIVE ? (
                        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                          <AppButton
                            title="İhtilaflı Yap"
                            variant="outline"
                            leftIcon={<AlertCircle size={16} color={theme.warning} />}
                            loading={isProcessing}
                            onPress={() => handleDecision(event.id, EventStatus.DISPUTED, 'İhtilaflı Yap')}
                            style={{ flex: 1 }}
                          />
                          <AppButton
                            title="Çözüldü Yap"
                            variant="primary"
                            leftIcon={<CheckCircle size={16} color="#FFFFFF" />}
                            loading={isProcessing}
                            onPress={() => handleDecision(event.id, EventStatus.RESOLVED, 'Çözüldü İşaretle')}
                            style={{ flex: 1 }}
                          />
                        </View>
                      ) : null}

                      {event.status === EventStatus.DISPUTED ? (
                        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                          <AppButton
                            title="Yeniden Yayınla"
                            variant="primary"
                            leftIcon={<CheckCircle size={16} color="#FFFFFF" />}
                            loading={isProcessing}
                            onPress={() => handleDecision(event.id, EventStatus.ACTIVE, 'Yeniden Yayınla')}
                            style={{ flex: 1 }}
                          />
                          <AppButton
                            title="Asılsız Reddet"
                            variant="secondary"
                            leftIcon={<XCircle size={16} color={theme.error} />}
                            loading={isProcessing}
                            onPress={() => handleDecision(event.id, EventStatus.REJECTED, 'Asılsız İlan Et')}
                            style={{ flex: 1 }}
                          />
                        </View>
                      ) : null}

                      <AppButton
                        title="Vazgeç / Kapat"
                        variant="secondary"
                        onPress={() => {
                          setSelectedEventId(null);
                          setReasonInput('');
                        }}
                        style={{ marginTop: spacing.xs }}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                    <AppButton
                      title="Detay & Karar Ver"
                      variant="primary"
                      size="sm"
                      onPress={() => {
                        setSelectedEventId(event.id);
                        setReasonInput('');
                      }}
                      style={{ flex: 1 }}
                    />
                    <AppButton
                      title="Olay Sayfasını Aç"
                      variant="secondary"
                      size="sm"
                      onPress={() => router.push(`/events/${event.id}`)}
                      style={{ flex: 1 }}
                    />
                  </View>
                )}
              </AppCard>
            );
          })
        )}
      </View>
    </AppScreen>
  );
}
