import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Navigation2, Layers, SlidersHorizontal, Sparkles } from 'lucide-react-native';
import { MapScreenLayout } from '../../src/components/layout/MapScreenLayout';
import {
  SearchBar,
  CategoryChip,
  FloatingIconButton,
  BottomSheet,
  AppText,
  AppButton,
  StatusBadge,
  AppCard,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import { EventStatus, EventCategory } from '@sehir-nabiz/shared';

const SAMPLE_CATEGORIES = [
  { code: EventCategory.TRAFFIC, name: 'Trafik' },
  { code: EventCategory.ACCIDENT, name: 'Kaza' },
  { code: EventCategory.ROAD_WORK, name: 'Yol Çalışması' },
  { code: EventCategory.PUBLIC_TRANSPORT, name: 'Toplu Taşıma' },
  { code: EventCategory.INFRASTRUCTURE, name: 'Altyapı' },
  { code: EventCategory.WEATHER, name: 'Hava Durumu' },
];

export default function MapScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <>
      <MapScreenLayout
        searchBarSlot={
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Olay, cadde veya ilçe ara..."
            rightAction={
              __DEV__ ? (
                <FloatingIconButton
                  icon={<Sparkles size={18} color={theme.primary} />}
                  onPress={() => router.push('/showcase')}
                  accessibilityLabel="UI Showcase Aç"
                />
              ) : null
            }
          />
        }
        categoryFilterSlot={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              gap: spacing.sm,
            }}
          >
            {SAMPLE_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.code}
                categoryCode={cat.code}
                nameTr={cat.name}
                selected={selectedCategory === cat.code}
                onPress={() =>
                  setSelectedCategory((prev) => (prev === cat.code ? null : cat.code))
                }
              />
            ))}
          </ScrollView>
        }
        mapActionControlsSlot={
          <>
            <FloatingIconButton
              icon={<Navigation2 size={20} color={theme.primary} />}
              onPress={() => setSheetVisible(true)}
              accessibilityLabel="Mevcut Konumuma Git"
            />
            <FloatingIconButton
              icon={<Layers size={20} color={theme.text} />}
              onPress={() => {}}
              accessibilityLabel="Harita Katmanları"
            />
            <FloatingIconButton
              icon={<SlidersHorizontal size={20} color={theme.text} />}
              onPress={() => {}}
              accessibilityLabel="Gelişmiş Filtreler"
            />
          </>
        }
      />

      {/* Seçilen Olay Önizleme Bottom Sheet'i */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)}>
        <View style={{ paddingTop: spacing.sm }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <StatusBadge status={EventStatus.ACTIVE} />
            <AppText variant="caption" color={theme.textSecondary}>
              12 dk önce • 350m yakınında
            </AppText>
          </View>

          <AppText variant="headingL" weight="bold" style={{ marginBottom: spacing.xs }}>
            Sivas Caddesi Sol Şerit Kaza
          </AppText>

          <AppText
            variant="bodyM"
            color={theme.textSecondary}
            style={{ marginBottom: spacing.lg }}
          >
            İki aracın karıştığı maddi hasarlı kaza nedeniyle sol şeritte yoğun trafik oluştu. Ekipler olay yerinde.
          </AppText>

          <AppCard style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <AppText variant="caption" color={theme.textSecondary}>
                  Topluluk Teyidi
                </AppText>
                <AppText variant="headingM" weight="bold" color={theme.primary}>
                  %94 Doğrulandı
                </AppText>
              </View>
              <View>
                <AppText variant="caption" color={theme.textSecondary}>
                  Teyit Sayısı
                </AppText>
                <AppText variant="headingM" weight="bold">
                  18 Kişi
                </AppText>
              </View>
            </View>
          </AppCard>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <AppButton
              title="Detayları Gör"
              variant="secondary"
              onPress={() => setSheetVisible(false)}
              style={{ flex: 1 }}
            />
            <AppButton
              title="Teyit Et"
              variant="primary"
              onPress={() => setSheetVisible(false)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
