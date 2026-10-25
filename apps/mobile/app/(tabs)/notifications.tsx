import React from 'react';
import { View } from 'react-native';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppCard,
  AppText,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Bildirdiğiniz olay onaylandı',
    message: 'Cumhuriyet Meydanı yol çalışması bildiriminiz 15 topluluk üyesi tarafından teyit edildi. +5 İtibar puanı kazandınız!',
    timeAgo: '10 dk önce',
    type: 'success',
    isUnread: true,
  },
  {
    id: '2',
    title: 'Bölgenizde acil durum bildirimi',
    message: '1.5 km yakınınızda (Sivas Caddesi) yoğun trafik uyarısı paylaşıldı.',
    timeAgo: '45 dk önce',
    type: 'warning',
    isUnread: true,
  },
  {
    id: '3',
    title: 'Haftalık güvenilirlik raporu',
    message: 'Bu hafta 4 olayı doğru teyit ettiniz. Güvenilirlik skorunuz %98 seviyesinde.',
    timeAgo: '2 gün önce',
    type: 'info',
    isUnread: false,
  },
];

export default function NotificationsScreen(): React.ReactElement {
  const { theme, spacing, radii } = useAppTheme();

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 100 }}>
      <AppHeader
        title="Bildirimler"
        subtitle="Olay teyitleri ve yerel uyarılar"
      />

      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        {MOCK_NOTIFICATIONS.map((item) => (
          <AppCard
            key={item.id}
            style={{
              borderColor: item.isUnread ? theme.primary : theme.border,
              borderWidth: item.isUnread ? 1.5 : 1,
            }}
          >
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radii.pill,
                  backgroundColor:
                    item.type === 'success'
                      ? theme.successLight
                      : item.type === 'warning'
                      ? theme.warningLight
                      : theme.infoLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.type === 'success' ? (
                  <CheckCircle2 size={20} color={theme.success} />
                ) : item.type === 'warning' ? (
                  <AlertTriangle size={20} color={theme.warning} />
                ) : (
                  <ShieldCheck size={20} color={theme.info} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}
                >
                  <AppText variant="bodyM" weight="bold">
                    {item.title}
                  </AppText>
                  {item.isUnread ? (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.primary,
                      }}
                    />
                  ) : null}
                </View>

                <AppText
                  variant="bodyS"
                  color={theme.textSecondary}
                  style={{ marginBottom: spacing.xs }}
                >
                  {item.message}
                </AppText>

                <AppText variant="caption" color={theme.textMuted}>
                  {item.timeAgo}
                </AppText>
              </View>
            </View>
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}
