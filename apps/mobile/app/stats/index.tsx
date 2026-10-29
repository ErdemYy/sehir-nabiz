import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BarChart3,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Info,
  ChevronLeft,
} from 'lucide-react-native';
import {
  AppScreen,
  AppHeader,
  AppCard,
  AppText,
  AppBadge,
  EmptyState,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { useCityOverview } from '../../src/features/stats';
import type { StatsPeriod } from '@sehir-nabiz/shared';

const CITIES = ['Kayseri', 'Ankara', 'İstanbul', 'İzmir'];

const PERIODS: { label: string; value: StatsPeriod }[] = [
  { label: '24 Saat', value: '24h' },
  { label: '7 Gün', value: '7d' },
  { label: '30 Gün', value: '30d' },
  { label: 'Tümü', value: 'all' },
];

export default function StatsScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii } = useAppTheme();
  const [selectedCity, setSelectedCity] = useState<string>('Kayseri');
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>('7d');

  const { data: stats, isLoading, isError, refetch } = useCityOverview(
    selectedCity,
    selectedPeriod,
  );

  const screenWidth = Dimensions.get('window').width;
  const insets = useSafeAreaInsets();

  return (
    <AppScreen scrollable contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 32, 60) }}>
      {/* Özel Başlık ve Geri Dön Butonu */}
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

        <AppBadge label="Canlı Şehir Nabzı" variant="primary" size="sm" />
      </View>

      <AppHeader
        title="Şehir İstatistikleri"
        subtitle={`${selectedCity} genelinde bildirilen kentsel olayların analizi`}
      />

      <View style={{ paddingHorizontal: spacing.lg }}>
        {/* Şehir Seçim Çipleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacing.sm,
            paddingVertical: spacing.xs,
            marginBottom: spacing.sm,
          }}
        >
          {CITIES.map(city => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                onPress={() => setSelectedCity(city)}
                accessibilityRole="button"
                accessibilityLabel={`${city} şehri istatistikleri`}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radii.full,
                  backgroundColor: isSelected ? theme.primary : theme.surfaceElevated,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.primary : theme.border,
                  minHeight: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText
                  variant="caption"
                  weight={isSelected ? 'bold' : 'regular'}
                  color={isSelected ? '#FFFFFF' : theme.text}
                >
                  {city}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Zaman Aralığı Çipleri */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: theme.surfaceElevated,
            borderRadius: radii.md,
            padding: 4,
            borderWidth: 1,
            borderColor: theme.border,
            marginBottom: spacing.lg,
          }}
        >
          {PERIODS.map(p => {
            const isSelected = selectedPeriod === p.value;
            return (
              <TouchableOpacity
                key={p.value}
                onPress={() => setSelectedPeriod(p.value)}
                accessibilityRole="button"
                accessibilityLabel={`${p.label} zaman aralığı`}
                style={{
                  flex: 1,
                  paddingVertical: spacing.xs + 2,
                  borderRadius: radii.sm,
                  backgroundColor: isSelected ? theme.primary : 'transparent',
                  alignItems: 'center',
                  minHeight: 36,
                  justifyContent: 'center',
                }}
              >
                <AppText
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? '#FFFFFF' : theme.textSecondary}
                >
                  {p.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Yükleniyor Durumu */}
        {isLoading && (
          <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: spacing.md }}>
              İstatistikler hesaplanıyor...
            </AppText>
          </View>
        )}

        {/* Hata Durumu */}
        {isError && (
          <AppCard style={{ alignItems: 'center', padding: spacing.xl, marginBottom: spacing.lg }}>
            <AlertCircle size={32} color={theme.error} />
            <AppText variant="bodyM" weight="semibold" style={{ marginTop: spacing.sm }}>
              Veriler yüklenemedi
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

        {/* Veri Gösterimi */}
        {!isLoading && !isError && stats && (
          <>
            {/* 4'lü Özet Metrik Kartları */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
              {/* Toplam Olay */}
              <AppCard style={{ width: (screenWidth - spacing.lg * 2 - spacing.sm) / 2 - 1, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <BarChart3 size={16} color={theme.primary} />
                  <AppText variant="caption" color={theme.textSecondary}>
                    Toplam Olay
                  </AppText>
                </View>
                <AppText variant="headingL" weight="bold" style={{ marginTop: spacing.xs }}>
                  {stats.totalEvents}
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Bildirilen olaylar
                </AppText>
              </AppCard>

              {/* Çözülen Olay */}
              <AppCard style={{ width: (screenWidth - spacing.lg * 2 - spacing.sm) / 2 - 1, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <CheckCircle2 size={16} color={theme.success} />
                  <AppText variant="caption" color={theme.textSecondary}>
                    Çözüldü
                  </AppText>
                </View>
                <AppText variant="headingL" weight="bold" color={theme.success} style={{ marginTop: spacing.xs }}>
                  {stats.resolvedEvents}
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  %{stats.resolutionRate} çözüm oranı
                </AppText>
              </AppCard>

              {/* Aktif Olaylar */}
              <AppCard style={{ width: (screenWidth - spacing.lg * 2 - spacing.sm) / 2 - 1, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <TrendingUp size={16} color={theme.warning} />
                  <AppText variant="caption" color={theme.textSecondary}>
                    Yayında (Aktif)
                  </AppText>
                </View>
                <AppText variant="headingL" weight="bold" color={theme.warning} style={{ marginTop: spacing.xs }}>
                  {stats.activeEvents}
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Güncel gelişmeler
                </AppText>
              </AppCard>

              {/* Ortalama Teyit */}
              <AppCard style={{ width: (screenWidth - spacing.lg * 2 - spacing.sm) / 2 - 1, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <CheckCircle2 size={16} color={theme.accentBlue} />
                  <AppText variant="caption" color={theme.textSecondary}>
                    Ortalama Teyit
                  </AppText>
                </View>
                <AppText variant="headingL" weight="bold" color={theme.accentBlue} style={{ marginTop: spacing.xs }}>
                  {stats.averageConfirmations}
                </AppText>
                <AppText variant="caption" color={theme.textSecondary} style={{ fontSize: 11 }}>
                  Olay başına teyit
                </AppText>
              </AppCard>
            </View>

            {/* Olay Trend Grafiği (Responsive Çubuk Grafik) */}
            <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
                <AppText variant="headingM" weight="bold">
                  Olay Bildirim Eğilimi
                </AppText>
                <AppBadge label={`${stats.timeline.length} Günlük Veri`} variant="default" size="sm" />
              </View>

              {stats.timeline.length === 0 ? (
                <EmptyState
                  title="Trend verisi bulunmuyor"
                  description="Seçilen zaman aralığında kayıtlı olay bulunamadı."
                />
              ) : (
                <View style={{ height: 120, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, paddingTop: spacing.md }}>
                  {stats.timeline.map((point, index) => {
                    const maxVal = Math.max(...stats.timeline.map(t => t.count), 1);
                    const barHeight = Math.max(12, Math.round((point.count / maxVal) * 80));
                    const dayLabel = point.date.split('-').slice(1).join('/');

                    return (
                      <View key={point.date || index} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                        <AppText variant="caption" style={{ fontSize: 9 }} color={theme.textSecondary}>
                          {point.count}
                        </AppText>
                        <View
                          style={{
                            width: '100%',
                            maxWidth: 24,
                            height: barHeight,
                            backgroundColor: theme.primary,
                            borderRadius: radii.xs,
                          }}
                        />
                        <AppText variant="caption" style={{ fontSize: 9 }} color={theme.textSecondary} numberOfLines={1}>
                          {dayLabel}
                        </AppText>
                      </View>
                    );
                  })}
                </View>
              )}
            </AppCard>

            {/* Kategori Dağılımı */}
            <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
              <AppText variant="headingM" weight="bold" style={{ marginBottom: spacing.md }}>
                Kategori Dağılımı
              </AppText>

              {stats.categoryDistribution.length === 0 ? (
                <EmptyState
                  title="Kategori verisi yok"
                  description="Seçilen periyotta bildirilmiş kategori kaydı bulunmuyor."
                />
              ) : (
                <View style={{ gap: spacing.sm }}>
                  {stats.categoryDistribution.map(cat => (
                    <View key={cat.categoryCode}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: cat.colorHex || theme.primary,
                            }}
                          />
                          <AppText variant="bodyS" weight="medium">
                            {cat.categoryName}
                          </AppText>
                        </View>
                        <AppText variant="caption" color={theme.textSecondary}>
                          {cat.count} olay (%{cat.percentage})
                        </AppText>
                      </View>
                      {/* Dağılım Çubuğu */}
                      <View
                        style={{
                          height: 6,
                          backgroundColor: theme.surfaceElevated,
                          borderRadius: radii.full,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            height: '100%',
                            width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                            backgroundColor: cat.colorHex || theme.primary,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </AppCard>

            {/* İlçe Karşılaştırması */}
            <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
              <AppText variant="headingM" weight="bold" style={{ marginBottom: spacing.md }}>
                İlçe Yoğunluğu
              </AppText>

              {stats.districtComparison.length === 0 ? (
                <EmptyState
                  title="İlçe verisi bulunmuyor"
                  description="Kayıtlı olaylarda ilçe ayrımı tespit edilemedi."
                />
              ) : (
                <View style={{ gap: spacing.sm }}>
                  {stats.districtComparison.map((dist, idx) => (
                    <View key={dist.district || idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        <MapPin size={14} color={theme.primary} />
                        <AppText variant="bodyS" weight="medium">
                          {dist.district}
                        </AppText>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <AppBadge label={`${dist.count} olay`} variant="default" size="sm" />
                        <AppText variant="caption" color={theme.success} style={{ fontSize: 11 }}>
                          {dist.resolvedCount} çözüldü
                        </AppText>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </AppCard>

            {/* Yasal / Metodolojik Feragatname Kartı */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: theme.surfaceElevated,
                padding: spacing.md,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: theme.border,
                gap: spacing.sm,
                alignItems: 'flex-start',
              }}
            >
              <Info size={18} color={theme.textSecondary} style={{ marginTop: 2 }} />
              <AppText
                variant="caption"
                color={theme.textSecondary}
                style={{ flex: 1, lineHeight: 18 }}
              >
                {stats.disclaimer}
              </AppText>
            </View>
          </>
        )}
      </View>
    </AppScreen>
  );
}
