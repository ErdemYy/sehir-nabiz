import React, { useState, useRef, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Navigation2,
  Layers,
  RotateCw,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';
import { MapScreenLayout } from '../../src/components/layout/MapScreenLayout';
import {
  SearchBar,
  CategoryChip,
  FilterChip,
  FloatingIconButton,
  BottomSheet,
  AppText,
  AppButton,
  StatusBadge,
  AppCard,
  AppBadge,
} from '../../src/components/ui';
import { useAppTheme } from '../../src/theme';
import {
  PulseMapView,
  MapLayerSheet,
  useEventsBbox,
  useUserLocation,
  type BBoxCoordinates,
  type MapStyleMode,
  type MapEventProperties,
} from '../../src/features/map';
import { EventCategory } from '@sehir-nabiz/shared';

const CATEGORIES_LIST: { code: string; name: string }[] = [
  { code: 'ALL', name: 'Tümü' },
  { code: EventCategory.TRAFFIC, name: 'Trafik' },
  { code: EventCategory.ACCIDENT, name: 'Kaza' },
  { code: EventCategory.ROAD_WORK, name: 'Yol Çalışması' },
  { code: EventCategory.WATER_OUTAGE, name: 'Su Kesintisi' },
  { code: EventCategory.POWER_OUTAGE, name: 'Elektrik' },
  { code: EventCategory.INFRASTRUCTURE, name: 'Altyapı' },
  { code: EventCategory.PUBLIC_TRANSPORT, name: 'Toplu Taşıma' },
  { code: EventCategory.WEATHER, name: 'Hava Durumu' },
  { code: EventCategory.DISASTER, name: 'Afet' },
  { code: EventCategory.EVENT, name: 'Etkinlik' },
  { code: EventCategory.OTHER, name: 'Diğer' },
];

export default function MapScreen(): React.ReactElement {
  const router = useRouter();
  const { theme, spacing, radii } = useAppTheme();
  const cameraRef = useRef<CameraRef>(null);

  // Harita Görünüm ve Filtre Durumları
  const [styleMode, setStyleMode] = useState<MapStyleMode>('light');
  const [layerSheetOpen, setLayerSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Bounding Box (Varsayılan Kayseri odak alanı)
  const [currentBBox, setCurrentBBox] = useState<BBoxCoordinates>({
    west: 35.3853,
    south: 38.6225,
    east: 35.5853,
    north: 38.8225,
  });

  // Seçilen Olay Detayı (BottomSheet)
  const [selectedEvent, setSelectedEvent] = useState<MapEventProperties | null>(null);

  // Kullanıcı Konumu Kancası
  const {
    coords: userCoords,
    isLoading: isLocating,
    error: locationError,
    requestLocation,
  } = useUserLocation();

  // BBox Olayları Kancası (Backend Events API + Önbellek + GeoJSON)
  const {
    geoJson,
    totalCount,
    refetch: refetchEvents,
    isRefetching,
  } = useEventsBbox({
    bbox: currentBBox,
    category: selectedCategory === 'ALL' ? null : selectedCategory,
    searchQuery,
  });

  // Kamera hareketi sonrasında BBox güncellemesi (Debounced)
  const handleBBoxChange = useCallback((bbox: BBoxCoordinates) => {
    setCurrentBBox(bbox);
  }, []);

  // Olay seçildiğinde tetiklenir
  const handleSelectEvent = useCallback((event: MapEventProperties) => {
    setSelectedEvent(event);
  }, []);

  // Konumuma Git Eylemi
  const handleLocateMe = useCallback(async () => {
    const coords = await requestLocation();
    if (coords && cameraRef.current) {
      cameraRef.current.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 14.5,
        duration: 1000,
      });
    }
  }, [requestLocation]);

  return (
    <>
      <MapScreenLayout
        // 1. Gerçek MapLibre Vektör Harita Canvas'ı
        mapCanvas={
          <PulseMapView
            cameraRef={cameraRef}
            geoJson={geoJson}
            styleMode={styleMode}
            selectedEventId={selectedEvent?.id}
            onSelectEvent={handleSelectEvent}
            onBBoxChange={handleBBoxChange}
            userCoords={userCoords}
          />
        }
        // 2. Üst Floating Arama Çubuğu
        searchBarSlot={
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Şehirde ara..."
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
        // 3. Yatay 11 Kategori Filtre Çipleri
        categoryFilterSlot={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              gap: spacing.sm,
            }}
          >
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = selectedCategory === cat.code;
              if (cat.code === 'ALL') {
                return (
                  <FilterChip
                    key="ALL"
                    label="Tümü"
                    selected={isSelected}
                    count={totalCount}
                    onPress={() => setSelectedCategory('ALL')}
                  />
                );
              }

              return (
                <CategoryChip
                  key={cat.code}
                  categoryCode={cat.code}
                  nameTr={cat.name}
                  selected={isSelected}
                  onPress={() => setSelectedCategory(cat.code)}
                />
              );
            })}
          </ScrollView>
        }
        // 4. Sağ Taraf Floating Aksiyon Butonları
        mapActionControlsSlot={
          <>
            <FloatingIconButton
              icon={
                isLocating ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Navigation2 size={20} color={theme.primary} />
                )
              }
              onPress={handleLocateMe}
              accessibilityLabel="Mevcut Konumuma Git"
            />
            <FloatingIconButton
              icon={<Layers size={20} color={theme.text} />}
              onPress={() => setLayerSheetOpen(true)}
              accessibilityLabel="Harita Katmanları"
            />
            <FloatingIconButton
              icon={
                isRefetching ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <RotateCw size={20} color={theme.text} />
                )
              }
              onPress={() => refetchEvents()}
              accessibilityLabel="Görünür Alanı Yenile"
            />
          </>
        }
      />

      {/* Konum Hatası Bildirimi */}
      {locationError ? (
        <View
          style={{
            position: 'absolute',
            top: 130,
            left: spacing.lg,
            right: spacing.lg,
            zIndex: 12,
            backgroundColor: theme.errorLight,
            padding: spacing.sm,
            borderRadius: radii.medium,
            borderWidth: 1,
            borderColor: theme.error,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <AlertTriangle size={16} color={theme.error} />
          <AppText variant="caption" color={theme.error} style={{ flex: 1 }}>
            {locationError}
          </AppText>
        </View>
      ) : null}

      {/* Harita Katmanları Seçici Bottom Sheet */}
      <MapLayerSheet
        visible={layerSheetOpen}
        onClose={() => setLayerSheetOpen(false)}
        activeMode={styleMode}
        onSelectMode={setStyleMode}
      />

      {/* Seçilen Olay Detayı Bottom Sheet'i */}
      <BottomSheet
        visible={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      >
        {selectedEvent ? (
          <View style={{ paddingTop: spacing.sm }}>
            {/* Üst Rozet Satırı */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <AppBadge
                  label={selectedEvent.category}
                  variant="primary"
                  size="sm"
                />
                <StatusBadge status={selectedEvent.status} size="sm" />
                {selectedEvent.isDemo ? (
                  <AppBadge label="DEMO" variant="warning" size="sm" />
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Clock size={12} color={theme.textSecondary} />
                <AppText variant="caption" color={theme.textSecondary}>
                  {new Date(selectedEvent.createdAt).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </AppText>
              </View>
            </View>

            {/* Başlık */}
            <AppText
              variant="headingL"
              weight="bold"
              style={{ marginBottom: spacing.xs }}
            >
              {selectedEvent.title}
            </AppText>

            {/* Konum / İlçe */}
            {selectedEvent.district || selectedEvent.addressText ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: spacing.sm,
                }}
              >
                <MapPin size={14} color={theme.primary} />
                <AppText variant="caption" color={theme.textSecondary}>
                  {selectedEvent.district ? `${selectedEvent.district}, ` : ''}
                  {selectedEvent.city || 'Kayseri'}
                  {selectedEvent.addressText ? ` • ${selectedEvent.addressText}` : ''}
                </AppText>
              </View>
            ) : null}

            {/* Açıklama */}
            {selectedEvent.description ? (
              <AppText
                variant="bodyS"
                color={theme.textSecondary}
                style={{ marginBottom: spacing.md }}
              >
                {selectedEvent.description}
              </AppText>
            ) : null}

            {/* Güvenilirlik & Teyit Kartı */}
            <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Shield size={18} color={theme.primary} />
                  <View>
                    <AppText variant="caption" color={theme.textSecondary}>
                      Güvenilirlik Puanı
                    </AppText>
                    <AppText variant="bodyM" weight="bold" color={theme.primary}>
                      %{Math.round(selectedEvent.reliabilityScore * 100)}
                    </AppText>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <ThumbsUp size={18} color={theme.primary} />
                  <View>
                    <AppText variant="caption" color={theme.textSecondary}>
                      Topluluk Teyidi
                    </AppText>
                    <AppText variant="bodyM" weight="bold">
                      {selectedEvent.upvotesCount} Onay
                    </AppText>
                  </View>
                </View>
              </View>
            </AppCard>

            {/* Eylem Butonları */}
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <AppButton
                title="Detayı Gör"
                variant="secondary"
                onPress={() => setSelectedEvent(null)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Teyit Et"
                variant="primary"
                onPress={() => setSelectedEvent(null)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : null}
      </BottomSheet>
    </>
  );
}
