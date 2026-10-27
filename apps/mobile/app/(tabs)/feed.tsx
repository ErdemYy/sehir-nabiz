import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, MapPin, ThumbsUp, BarChart3, ChevronRight } from 'lucide-react-native';
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
  const router = useRouter();
  const { theme, spacing } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<'all' | 'nearby' | 'critical'>('all');

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: 100 }}>
      <AppHeader
        title="Şehir Akışı"
        subtitle="Çevrenizde gerçekleşen son doğrulanmış olaylar"
      />

      {/* Şehir İstatistikleri Giriş Kartı (Phase 10) */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xs }}>
        <TouchableOpacity
          onPress={() => router.push('/stats')}
          accessibilityRole="button"
          accessibilityLabel="Şehir İstatistikleri Ekranını Aç"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.surfaceElevated,
            borderRadius: 16,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md - 2,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.primary + '18',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyM" weight="semibold">
                Şehir İstatistikleri
              </AppText>
              <AppText variant="caption" color={theme.textSecondary} numberOfLines={1}>
                Olay yoğunluğu ve kategori analizlerini inceleyin
              </AppText>
            </View>
          </View>
          <ChevronRight size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

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
          <TouchableOpacity
            key={event.id}
            activeOpacity={0.85}
            onPress={() => router.push(`/events/${event.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${event.title}, ${event.categoryName}, ${event.district}`}
            accessibilityHint="Olay detayını ve topluluk teyitlerini görüntülemek için dokunun"
          >
            <AppCard>
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
          </TouchableOpacity>
        ))}
      </View>
    </AppScreen>
  );
}
