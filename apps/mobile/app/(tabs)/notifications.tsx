import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  AlertTriangle,
  CheckCheck,
  XCircle,
  ThumbsUp,
  ShieldAlert,
  Bell,
} from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppCard,
  AppText,
  FilterChip,
  EmptyState,
  ErrorState,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { useNotifications } from '../../src/features/notifications';
import { useAuthStore } from '../../src/features/auth/store/useAuthStore';
import { AuthModal } from '../../src/features/auth/components/AuthModal';
import { NotificationType, type UserNotificationDto } from '@sehir-nabiz/shared';

export default function NotificationsScreen(): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();
  const router = useRouter();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNREAD'>('ALL');

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarkingRead,
  } = useNotifications({
    unreadOnly: filterMode === 'UNREAD',
  });

  // Tarihe Göre Gruplama (Bugün, Dün, Daha Önce)
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const gToday: UserNotificationDto[] = [];
    const gYesterday: UserNotificationDto[] = [];
    const gEarlier: UserNotificationDto[] = [];

    notifications.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        gToday.push(item);
      } else if (itemDate.getTime() === yesterday.getTime()) {
        gYesterday.push(item);
      } else {
        gEarlier.push(item);
      }
    });

    const groups: { title: string; items: UserNotificationDto[] }[] = [];
    if (gToday.length > 0) groups.push({ title: 'Bugün', items: gToday });
    if (gYesterday.length > 0) groups.push({ title: 'Dün', items: gYesterday });
    if (gEarlier.length > 0) groups.push({ title: 'Daha Önce', items: gEarlier });

    return groups;
  }, [notifications]);

  // Bildirim kartına basıldığında
  const handleNotificationPress = useCallback(
    async (item: UserNotificationDto) => {
      if (!item.isRead) {
        await markAsRead(item.id).catch(() => {});
      }
      if (item.eventId) {
        router.push(`/events/${item.eventId}` as any);
      }
    },
    [markAsRead, router],
  );

  // Bildirim türüne göre ikon ve renk
  const getNotificationIcon = useCallback(
    (type: NotificationType) => {
      switch (type) {
        case NotificationType.EVENT_APPROVED:
          return {
            Icon: CheckCircle2,
            color: theme.success,
            bgColor: theme.successLight,
          };
        case NotificationType.EVENT_REJECTED:
          return {
            Icon: XCircle,
            color: theme.error,
            bgColor: theme.errorLight,
          };
        case NotificationType.EVENT_RESOLVED:
          return {
            Icon: CheckCheck,
            color: theme.primary,
            bgColor: theme.primaryLight,
          };
        case NotificationType.EVENT_DISPUTED:
          return {
            Icon: AlertTriangle,
            color: theme.warning,
            bgColor: theme.warningLight,
          };
        case NotificationType.EVENT_FEEDBACK:
          return {
            Icon: ThumbsUp,
            color: theme.primary,
            bgColor: theme.primaryLight,
          };
        case NotificationType.MODERATION_QUEUE:
          return {
            Icon: ShieldAlert,
            color: theme.warning,
            bgColor: theme.warningLight,
          };
        case NotificationType.SYSTEM:
        default:
          return {
            Icon: Bell,
            color: theme.info,
            bgColor: theme.infoLight,
          };
      }
    },
    [theme],
  );

  // Tarih farkı formatlayıcı
  const formatTimeAgo = useCallback((dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} sa önce`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün önce`;
  }, []);

  return (
    <AppScreen
      scrollable
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => {
            refetch();
          }}
          tintColor={theme.primary}
        />
      }
    >
      <AppHeader
        title="Bildirimler"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} yeni okunmamış bildiriminiz var`
            : 'Olay teyitleri ve yerel uyarılar'
        }
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              disabled={isMarkingRead}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              }}
            >
              <CheckCheck size={16} color={theme.primary} />
              <AppText
                variant="caption"
                weight="bold"
                style={{ color: theme.primary }}
              >
                Tümünü Oku
              </AppText>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Oturum Kapalı Durumu */}
      {!isAuthenticated && (
        <View style={{ padding: spacing.lg }}>
          <EmptyState
            title="Giriş Yapmalısınız"
            description="Kişiselleştirilmiş olay teyitleri, çözülme uyarıları ve şehir bildirimlerini takip etmek için oturum açın."
            actionTitle="Giriş Yap veya Kayıt Ol"
            onAction={() => setAuthModalVisible(true)}
          />
        </View>
      )}

      {/* Oturum Açık: Filtre Çipleri */}
      {isAuthenticated && (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
          }}
        >
          <FilterChip
            label="Tümü"
            selected={filterMode === 'ALL'}
            onPress={() => setFilterMode('ALL')}
          />
          <FilterChip
            label={unreadCount > 0 ? `Okunmamış (${unreadCount})` : 'Okunmamış'}
            selected={filterMode === 'UNREAD'}
            onPress={() => setFilterMode('UNREAD')}
          />
        </View>
      )}

      {/* Yükleniyor */}
      {isAuthenticated && isLoading && notifications.length === 0 && (
        <View style={{ padding: spacing.xxl, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <AppText
            variant="bodyS"
            style={{ color: theme.textSecondary, marginTop: spacing.md }}
          >
            Bildirimler yükleniyor...
          </AppText>
        </View>
      )}

      {/* Hata Durumu */}
      {isAuthenticated && isError && (
        <View style={{ padding: spacing.lg }}>
          <ErrorState
            title="Bildirimler Alınamadı"
            message="Sunucu bağlantısı sağlanamadı. Lütfen internetinizi kontrol edin."
            onRetry={() => {
              refetch();
            }}
          />
        </View>
      )}

      {/* Boş Durum */}
      {isAuthenticated && !isLoading && notifications.length === 0 && (
        <View style={{ padding: spacing.xl }}>
          <EmptyState
            title={
              filterMode === 'UNREAD'
                ? 'Okunmamış Bildirim Yok'
                : 'Henüz Bildiriminiz Yok'
            }
            description={
              filterMode === 'UNREAD'
                ? 'Harika! Tüm bildirimleri okudunuz.'
                : 'Olay bildirdiğinizde veya teyit ettiğiniz gelişmelerde burada anlık uyarılar alacaksınız.'
            }
          />
        </View>
      )}

      {/* Bildirim Listesi (Tarihe Göre Gruplanmış) */}
      {isAuthenticated &&
        groupedNotifications.map((group) => (
          <View key={group.title} style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
            <AppText
              variant="caption"
              weight="bold"
              style={{
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: spacing.xs,
              }}
            >
              {group.title}
            </AppText>

            <View style={{ gap: spacing.sm }}>
              {group.items.map((item) => {
                const iconConfig = getNotificationIcon(item.type);
                const { Icon } = iconConfig;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => handleNotificationPress(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.title}, ${formatTimeAgo(item.createdAt)}${item.isRead ? '' : ', okunmamış'}`}
                    accessibilityHint="Bildirim detayına ve ilgili olaya gitmek için dokunun"
                  >
                    <AppCard
                      style={{
                        borderColor: item.isRead ? theme.border : theme.primary,
                        borderWidth: item.isRead ? 1 : 1.5,
                        backgroundColor: item.isRead
                          ? theme.surfaceElevated
                          : theme.surface,
                      }}
                    >
                      <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        {/* İkon */}
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: radii.pill,
                            backgroundColor: iconConfig.bgColor,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={18} color={iconConfig.color} />
                        </View>

                        {/* Metin İçeriği */}
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 2,
                            }}
                          >
                            <AppText
                              variant="bodyM"
                              weight={item.isRead ? 'medium' : 'bold'}
                              style={{
                                color: item.isRead
                                  ? theme.text
                                  : theme.primary,
                                flex: 1,
                              }}
                              numberOfLines={1}
                            >
                              {item.title}
                            </AppText>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <AppText
                                variant="caption"
                                style={{
                                  color: theme.textMuted,
                                  fontSize: 11,
                                }}
                              >
                                {formatTimeAgo(item.createdAt)}
                              </AppText>
                              {!item.isRead && (
                                <View
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 3.5,
                                    backgroundColor: theme.primary,
                                  }}
                                />
                              )}
                            </View>
                          </View>

                          <AppText
                            variant="bodyS"
                            style={{
                              color: theme.textSecondary,
                              lineHeight: 18,
                            }}
                            numberOfLines={2}
                          >
                            {item.body}
                          </AppText>
                        </View>
                      </View>
                    </AppCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </AppScreen>
  );
}
