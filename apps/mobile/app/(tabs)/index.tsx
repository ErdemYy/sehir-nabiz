import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  CloudOff,
  AlertCircle,
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
import { useRealtimeEvents, ConnectionStatusBadge } from '../../src/features/realtime';
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
  const insets = useSafeAreaInsets();
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
    events,
    geoJson,
    totalCount,
    refetch: refetchEvents,
    isRefetching,
    isError: isEventsError,
    isDemoData,
    isOfflineCache,
    lastUpdatedAt,
  } = useEventsBbox({
    bbox: currentBBox,
    category: selectedCategory === 'ALL' ? null : selectedCategory,
    searchQuery,
  });

  // Gerçek Zamanlı WebSocket ve Canlı Harita Güncellemeleri (Phase 9)
  const { status: realtimeStatus, reconnect: reconnectRealtime } = useRealtimeEvents({
    bbox: currentBBox,
  });

  // Kamera hareketi sonrasında BBox güncellemesi (Debounced - 350ms)
  const bboxDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleBBoxChange = useCallback((bbox: BBoxCoordinates) => {
    if (bboxDebounceTimer.current) {
      clearTimeout(bboxDebounceTimer.current);
    }
    bboxDebounceTimer.current = setTimeout(() => {
      setCurrentBBox(bbox);
    }, 350);
  }, []);

  useEffect(() => {
    return () => {
      if (bboxDebounceTimer.current) {
        clearTimeout(bboxDebounceTimer.current);
      }
    };
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

  // Bildirim banner'larının dikey konumu (Kategori çiplerinin hemen altı)
  const bannerTop = useMemo(() => {
    return Math.max(insets.top + 120, 134);
  }, [insets.top]);

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
        // 2. Üst Floating Arama Çubuğu ve Canlı Bağlantı Rozeti
        searchBarSlot={
          <View style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ConnectionStatusBadge
                status={realtimeStatus}
                onPress={reconnectRealtime}
              />
            </View>
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
          </View>
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

      {/* 5. Geliştirici Demo Modu Bilgilendirme Banner'ı */}
      {isDemoData ? (
        <View
          style={{
            position: 'absolute',
            top: bannerTop,
            left: spacing.lg,
            right: spacing.lg,
            zIndex: 14,
            backgroundColor: '#FFFBEB',
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            borderRadius: radii.medium,
            borderWidth: 1,
            borderColor: '#F59E0B',
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <AlertTriangle size={16} color="#D97706" />
          <AppText variant="caption" weight="semibold" color="#B45309" style={{ flex: 1 }}>
            DEMO MODU: API bağlantısı yok. Yalnızca test amaçlı sentetik olaylar gösterilmektedir (Resmî değildir).
          </AppText>
        </View>
      ) : null}

      {/* 6. Çevrimdışı Önbellek Durumu Bildirimi */}
      {isOfflineCache ? (
        <View
          style={{
            position: 'absolute',
            top: bannerTop,
            left: spacing.lg,
            right: spacing.lg,
            zIndex: 13,
            backgroundColor: theme.surface,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            borderRadius: radii.medium,
            borderWidth: 1,
            borderColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
            <CloudOff size={16} color={theme.textSecondary} />
            <AppText variant="caption" color={theme.textSecondary} style={{ flex: 1 }}>
              Çevrimdışı mod — Gösterilen veriler önbellekten (Son güncelleme:{' '}
              {lastUpdatedAt
                ? lastUpdatedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                : 'Bilinmiyor'}
              )
            </AppText>
          </View>
          <TouchableOpacity onPress={() => refetchEvents()}>
            <AppText variant="caption" weight="bold" color={theme.primary}>
              Tekrar Dene
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* 7. API Bağlantı Hatası Bildirimi (Önbellekte hiç veri yoksa) */}
      {isEventsError && events.length === 0 ? (
        <View
          style={{
            position: 'absolute',
            top: bannerTop,
            left: spacing.lg,
            right: spacing.lg,
            zIndex: 12,
            backgroundColor: theme.errorLight,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radii.medium,
            borderWidth: 1,
            borderColor: theme.error,
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <AlertCircle size={18} color={theme.error} />
            <AppText variant="caption" weight="semibold" color={theme.error}>
              Olay verileri yüklenemedi. Lütfen internet bağlantınızı kontrol edin.
            </AppText>
          </View>
          <TouchableOpacity onPress={() => refetchEvents()}>
            <AppText variant="caption" weight="bold" color={theme.primary}>
              Yeniden Bağlan
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* 8. Konum Hatası Bildirimi */}
      {locationError ? (
        <View
          style={{
            position: 'absolute',
            top: bannerTop + (isDemoData || isOfflineCache || (isEventsError && events.length === 0) ? 44 : 0),
            left: spacing.lg,
            right: spacing.lg,
            zIndex: 11,
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
                  <AppBadge label="DEMO TEST" variant="warning" size="sm" />
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
            {selectedEvent.isDemo ? (
              <AppCard style={{ marginBottom: spacing.lg, padding: spacing.md, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <AlertTriangle size={18} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" weight="bold" color="#B45309">
                      Doğrulanmamış Test Verisi
                    </AppText>
                    <AppText variant="caption" color="#92400E">
                      Bu kayıt geliştirme/test amaçlıdır. Resmî veya doğrulanmış olay niteliği taşımaz.
                    </AppText>
                  </View>
                </View>
              </AppCard>
            ) : (
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
                        Topluluk Teyidi
                      </AppText>
                      <AppText variant="bodyM" weight="bold" color={theme.primary}>
                        {selectedEvent.confirmationCount || selectedEvent.upvotesCount || 0} Kişi Gördü
                      </AppText>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <ThumbsUp size={18} color={theme.primary} />
                    <View>
                      <AppText variant="caption" color={theme.textSecondary}>
                        Durum
                      </AppText>
                      <AppText variant="bodyM" weight="bold">
                        {selectedEvent.status === 'ACTIVE' ? 'Yayında' : selectedEvent.status}
                      </AppText>
                    </View>
                  </View>
                </View>
                <AppText variant="caption" color={theme.textSecondary} style={{ marginTop: 6, fontSize: 11 }}>
                  * Topluluk bildirimleri resmî doğrulama niteliği taşımaz.
                </AppText>
              </AppCard>
            )}

            {/* Eylem Butonları */}
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <AppButton
                title="Detayı Gör"
                variant="secondary"
                onPress={() => {
                  const targetId = selectedEvent.id;
                  setSelectedEvent(null);
                  router.push(`/events/${targetId}`);
                }}
                style={{ flex: 1 }}
              />
              {selectedEvent.isDemo ? (
                <AppButton
                  title="Demo Teyit Edilemez"
                  variant="secondary"
                  disabled
                  onPress={() => {}}
                  style={{ flex: 1, opacity: 0.6 }}
                />
              ) : (
                <AppButton
                  title="Teyit Et"
                  variant="primary"
                  onPress={() => {
                    const targetId = selectedEvent.id;
                    setSelectedEvent(null);
                    router.push(`/events/${targetId}`);
                  }}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </View>
        ) : null}
      </BottomSheet>
    </>
  );
}
