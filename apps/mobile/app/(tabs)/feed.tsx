import React, { useState } from 'react';
import { View } from 'react-native';
import { Clock, MapPin, ThumbsUp } from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppCard,
  AppText,
  StatusBadge,
  FilterChip,
  AppBadge,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { EventStatus, EventSeverity } from '@sehir-nabiz/shared';

const MOCK_FEED_EVENTS = [
  {
    id: '1',
    title: 'Cumhuriyet Meydanı Metro Çıkışı Yol Bakımı',
    description: 'Kaldırım yenileme ve altyapı kablolama çalışması nedeniyle yaya geçişi kontrollü verilmektedir.',
    category: 'ROAD_WORK',
    categoryName: 'Yol Çalışması',
    status: EventStatus.ACTIVE,
    severity: EventSeverity.MEDIUM,
    district: 'Melikgazi',
    timeAgo: '15 dk önce',
    distance: '450 m',
    confirmations: 24,
  },
  {
    id: '2',
    title: 'Erciyes Bulvarı Sol Şerit Arıza',
    description: 'Arızalanan belediye otobüsü nedeniyle trafik tek şeritten kontrollü akmaktadır.',
    category: 'TRAFFIC',
    categoryName: 'Trafik',
    status: EventStatus.ACTIVE,
    severity: EventSeverity.HIGH,
    district: 'Kocasinan',
    timeAgo: '35 dk önce',
    distance: '1.2 km',
    confirmations: 42,
  },
  {
    id: '3',
    title: 'Talas Bulvarı Su Şebekesi Onarımı',
    description: 'KASKİ ekipleri ana boru arızası onarımını tamamladı, yol temizliği yapılmaktadır.',
    category: 'WATER_OUTAGE',
    categoryName: 'Altyapı',
    status: EventStatus.RESOLVED,
    severity: EventSeverity.LOW,
    district: 'Talas',
    timeAgo: '2 saat önce',
    distance: '2.5 km',
    confirmations: 67,
  },
];

export default function FeedScreen(): React.ReactElement {
  const { theme, spacing } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<'all' | 'nearby' | 'critical'>('all');

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 100 }}>
      <AppHeader
        title="Şehir Akışı"
        subtitle="Çevrenizde gerçekleşen son doğrulanmış olaylar"
      />

      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        }}
      >
        <FilterChip
          label="Tümü"
          selected={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        <FilterChip
          label="Yakınımdakiler"
          selected={activeFilter === 'nearby'}
          onPress={() => setActiveFilter('nearby')}
        />
        <FilterChip
          label="Acil Durumlar"
          selected={activeFilter === 'critical'}
          onPress={() => setActiveFilter('critical')}
        />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
        {MOCK_FEED_EVENTS.map((event) => (
          <AppCard key={event.id}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <AppBadge label={event.categoryName} variant="primary" size="sm" />
                <StatusBadge status={event.status} size="sm" />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Clock size={12} color={theme.textSecondary} />
                <AppText variant="caption" color={theme.textSecondary}>
                  {event.timeAgo}
                </AppText>
              </View>
            </View>

            <AppText
              variant="headingM"
              weight="bold"
              style={{ marginBottom: spacing.xs }}
            >
              {event.title}
            </AppText>

            <AppText
              variant="bodyS"
              color={theme.textSecondary}
              style={{ marginBottom: spacing.md }}
            >
              {event.description}
            </AppText>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopWidth: 1,
                borderTopColor: theme.border,
                paddingTop: spacing.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} color={theme.primary} />
                <AppText variant="caption" color={theme.textSecondary}>
                  {event.district} • {event.distance}
                </AppText>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <ThumbsUp size={14} color={theme.primary} />
                <AppText variant="caption" weight="semibold" color={theme.primaryDark}>
                  {event.confirmations} Teyit
                </AppText>
              </View>
            </View>
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}
