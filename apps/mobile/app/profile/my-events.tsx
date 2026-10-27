import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  AlertCircle,
  XCircle,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppCard,
  AppText,
  AppBadge,
  StatusBadge,
  EmptyState,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { useAuthStore, AuthModal } from '../../src/features/auth';
import { useMyEvents } from '../../src/features/users';
import { EventStatus, type MyEventResponseDto } from '@sehir-nabiz/shared';

const STATUS_FILTERS: { label: string; value: EventStatus | 'ALL' }[] = [
  { label: 'Tümü', value: 'ALL' },
  { label: 'İncelemede', value: EventStatus.PENDING_REVIEW },
  { label: 'Yayında', value: EventStatus.ACTIVE },
  { label: 'Çözüldü', value: EventStatus.RESOLVED },
  { label: 'Reddedildi', value: EventStatus.REJECTED },
];

export default function MyEventsScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii } = useAppTheme();
  const { isAuthenticated } = useAuthStore();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [activeStatus, setActiveStatus] = useState<EventStatus | 'ALL'>('ALL');

  const statusParam = activeStatus === 'ALL' ? undefined : activeStatus;
  const { data, isLoading, isError, refetch } = useMyEvents(
    statusParam,
    isAuthenticated,
  );

  const events = data?.items || [];

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Üst Navigasyon */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Geri Dön"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 44,
            minWidth: 44,
            paddingRight: spacing.sm,
          }}
        >
          <ChevronLeft size={24} color={theme.text} />
          <AppText variant="bodyM" weight="semibold">
            Geri
          </AppText>
        </TouchableOpacity>

        <AppBadge label={`${events.length} Olay`} variant="default" size="sm" />
      </View>

      <AppHeader
        title="Bildirdiğim Olaylar"
        subtitle="Şehirde oluşturduğunuz tüm olay kayıtları ve durumları"
      />

      <View style={{ paddingHorizontal: spacing.lg }}>
        {/* Misafir Kullanıcı Durumu */}
        {!isAuthenticated ? (
          <EmptyState
            title="Oturum Açmanız Gerekiyor"
            description="Bildirdiğiniz olayları ve durumlarını görmek için lütfen giriş yapın."
            actionTitle="Giriş Yap / Kayıt Ol"
            onAction={() => setAuthModalVisible(true)}
          />
        ) : (
          <>
            {/* Durum Filtre Çipleri */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: spacing.sm,
                paddingVertical: spacing.xs,
                marginBottom: spacing.md,
              }}
            >
              {STATUS_FILTERS.map(tab => {
                const isSelected = activeStatus === tab.value;
                return (
                  <TouchableOpacity
                    key={tab.value}
                    onPress={() => setActiveStatus(tab.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`${tab.label} filtresi`}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radii.full,
                      backgroundColor: isSelected ? theme.primary : theme.surfaceElevated,
                      borderWidth: 1,
                      borderColor: isSelected ? theme.primary : theme.border,
                      minHeight: 38,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'regular'}
                      color={isSelected ? '#FFFFFF' : theme.text}
                    >
                      {tab.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Yükleniyor Durumu */}
            {isLoading && (
              <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
                <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: spacing.md }}>
                  Bildirimleriniz yükleniyor...
                </AppText>
              </View>
            )}

            {/* Hata Durumu */}
            {isError && (
              <AppCard style={{ alignItems: 'center', padding: spacing.xl, marginBottom: spacing.lg }}>
                <AlertCircle size={32} color={theme.error} />
                <AppText variant="bodyM" weight="semibold" style={{ marginTop: spacing.sm }}>
                  Bildirimler yüklenemedi
                </AppText>
                <TouchableOpacity
                  onPress={() => refetch()}
                  style={{
                    marginTop: spacing.md,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                    backgroundColor: theme.primary,
                    borderRadius: radii.md,
                    minHeight: 44,
                    justifyContent: 'center',
                  }}
                >
                  <AppText variant="caption" weight="bold" color="#FFFFFF">
                    Tekrar Dene
                  </AppText>
                </TouchableOpacity>
              </AppCard>
            )}

            {/* Boş Liste */}
            {!isLoading && !isError && events.length === 0 && (
              <EmptyState
                title="Henüz bir olay bildirmediniz"
                description={
                  activeStatus === 'ALL'
                    ? 'Kentin nabzını tutmak ve komşularınızı bilgilendirmek için ilk olayınızı bildirin.'
                    : 'Seçili durumda bildiriminiz bulunmuyor.'
                }
                actionTitle="Yeni Olay Bildir"
                onAction={() => router.push('/(tabs)/create')}
              />
            )}

            {/* Olay Kartları Listesi */}
            {!isLoading && !isError && events.length > 0 && (
              <View style={{ gap: spacing.md }}>
                {events.map((event: MyEventResponseDto) => {
                  const isRejected = event.status === EventStatus.REJECTED;

                  return (
                    <TouchableOpacity
                      key={event.id}
                      activeOpacity={0.7}
                      onPress={() => router.push(`/events/${event.id}`)}
                      accessibilityRole="button"
                      accessibilityLabel={`${event.title} detayını görüntüle`}
                    >
                      <AppCard
                        style={{
                          padding: spacing.md,
                          borderLeftWidth: 4,
                          borderLeftColor: event.categoryColor || theme.primary,
                        }}
                      >
                        {/* Üst Bilgi Satırı */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: spacing.xs,
                          }}
                        >
                          <AppBadge
                            label={event.categoryName}
                            variant="primary"
                            size="sm"
                          />
                          <StatusBadge status={event.status} size="sm" />
                        </View>

                        {/* Başlık ve Açıklama */}
                        <AppText variant="bodyM" weight="semibold" style={{ marginBottom: 4 }}>
                          {event.title}
                        </AppText>
                        <AppText
                          variant="caption"
                          color={theme.textSecondary}
                          numberOfLines={2}
                          style={{ marginBottom: spacing.sm }}
                        >
                          {event.description}
                        </AppText>

                        {/* Reddedilme Gerekçesi Kalkanı */}
                        {isRejected && (
                          <View
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
                              borderRadius: radii.sm,
                              padding: spacing.sm,
                              borderWidth: 1,
                              borderColor: 'rgba(239, 68, 68, 0.25)',
                              marginBottom: spacing.sm,
                              flexDirection: 'row',
                              alignItems: 'flex-start',
                              gap: spacing.xs,
                            }}
                          >
                            <XCircle size={15} color={theme.error} style={{ marginTop: 2 }} />
                            <View style={{ flex: 1 }}>
                              <AppText variant="caption" weight="bold" color={theme.error}>
                                Moderatör Gerekçesi:
                              </AppText>
                              <AppText variant="caption" color={theme.error} style={{ fontSize: 11 }}>
                                {event.rejectionReason || 'Topluluk kurallarına veya doğrulama kriterlerine uygun bulunmadı.'}
                              </AppText>
                            </View>
                          </View>
                        )}

                        {/* Alt Bilgi & Teyit Sayısı */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: spacing.xs,
                            borderTopWidth: 1,
                            borderTopColor: theme.border,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MapPin size={13} color={theme.textSecondary} />
                            <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                              {event.district || event.city || 'Konum belirtildi'}
                            </AppText>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                            <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                              {event.confirmationCount} teyit
                            </AppText>
                            <ChevronRight size={16} color={theme.textSecondary} />
                          </View>
                        </View>
                      </AppCard>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </AppScreen>
  );
}
