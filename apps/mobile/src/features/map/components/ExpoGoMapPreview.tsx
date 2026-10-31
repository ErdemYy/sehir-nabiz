import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  AlertTriangle,
  Car,
  Wrench,
  Droplets,
  Zap,
  Bus,
  Calendar,
  ZoomIn,
  ZoomOut,
  Navigation,
  Info,
  MapPin,
} from 'lucide-react-native';
import { AppText } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import type { PulseMapViewProps } from './PulseMapView';
import type { MapEventProperties } from '../types/map.types';
import { EventCategory, EventSeverity, EventStatus } from '@sehir-nabiz/shared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Expo Go için Örnek Şehir Olayları (Backend çevrimdışıysa UI akışını test edebilmek için)
const FALLBACK_PREVIEW_EVENTS: MapEventProperties[] = [
  {
    id: 'preview-event-1',
    title: 'Sivas Caddesi Şerit Daraltma',
    category: EventCategory.ROAD_WORK,
    categoryColor: '#F59E0B',
    severity: EventSeverity.MEDIUM,
    status: EventStatus.ACTIVE,
    district: 'Melikgazi',
    addressText: 'Sivas Bulvarı No: 142',
    reliabilityScore: 84,
    upvotesCount: 16,
    downvotesCount: 2,
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'preview-event-2',
    title: 'Cumhuriyet Meydanı Trafik Sıkışıklığı',
    category: EventCategory.TRAFFIC,
    categoryColor: '#F97316',
    severity: EventSeverity.HIGH,
    status: EventStatus.ACTIVE,
    district: 'Kocasinan',
    addressText: 'Cumhuriyet Meydanı Kavşağı',
    reliabilityScore: 92,
    upvotesCount: 28,
    downvotesCount: 1,
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'preview-event-3',
    title: 'Talas Bulvarı Su Şebekesi Arızası',
    category: EventCategory.WATER_OUTAGE,
    categoryColor: '#0EA5E9',
    severity: EventSeverity.MEDIUM,
    status: EventStatus.PENDING_REVIEW,
    district: 'Talas',
    addressText: 'Mevlana Mah. Talas Bulvarı',
    reliabilityScore: 78,
    upvotesCount: 12,
    downvotesCount: 0,
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'preview-event-4',
    title: 'Erciyes Üniversitesi Kavşağı Kaza',
    category: EventCategory.ACCIDENT,
    categoryColor: '#EF4444',
    severity: EventSeverity.HIGH,
    status: EventStatus.ACTIVE,
    district: 'Melikgazi',
    addressText: 'Fevzi Çakmak Mah. Erciyes Cad.',
    reliabilityScore: 95,
    upvotesCount: 34,
    downvotesCount: 1,
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    id: 'preview-event-5',
    title: 'Mimarsinan Parkı Açık Hava Etkinliği',
    category: EventCategory.EVENT,
    categoryColor: '#8B5CF6',
    severity: EventSeverity.LOW,
    status: EventStatus.RESOLVED,
    district: 'Kocasinan',
    addressText: 'Mimarsinan Parkı Kültür Alanı',
    reliabilityScore: 88,
    upvotesCount: 22,
    downvotesCount: 1,
    createdAt: new Date().toISOString(),
    isDemo: true,
  },
];

// Olay kategorisine göre ikon seçimi
function getCategoryIcon(category: string, color: string, size = 16) {
  switch (category) {
    case EventCategory.TRAFFIC:
      return <Car size={size} color={color} />;
    case EventCategory.ROAD_WORK:
      return <Wrench size={size} color={color} />;
    case EventCategory.ACCIDENT:
      return <AlertTriangle size={size} color={color} />;
    case EventCategory.WATER_OUTAGE:
      return <Droplets size={size} color={color} />;
    case EventCategory.POWER_OUTAGE:
      return <Zap size={size} color={color} />;
    case EventCategory.PUBLIC_TRANSPORT:
      return <Bus size={size} color={color} />;
    case EventCategory.EVENT:
      return <Calendar size={size} color={color} />;
    default:
      return <MapPin size={size} color={color} />;
  }
}

export function ExpoGoMapPreview({
  geoJson,
  styleMode = 'light',
  selectedEventId,
  onSelectEvent,
  onBBoxChange,
  userCoords,
  showHeatmap = false,
}: PulseMapViewProps): React.ReactElement {
  const { theme, radii, isDark } = useAppTheme();
  const [zoomLevel, setZoomLevel] = useState(13);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });

  // Gerçek geoJson'dan gelen veriler varsa onları kullan; boşsa görsel fallback'leri göster
  const displayEvents: MapEventProperties[] = useMemo(() => {
    if (geoJson?.features && geoJson.features.length > 0) {
      return geoJson.features.map((f: any) => ({
        id: f.properties?.id || String(f.id),
        title: f.properties?.title || 'Olay Bildirimi',
        category: f.properties?.category || EventCategory.OTHER,
        categoryColor: f.properties?.categoryColor || '#14B8A6',
        severity: f.properties?.severity || EventSeverity.MEDIUM,
        status: f.properties?.status || EventStatus.ACTIVE,
        district: f.properties?.district || 'Kayseri',
        addressText: f.properties?.addressText || 'Merkez',
        reliabilityScore: f.properties?.reliabilityScore || 50,
        upvotesCount: f.properties?.upvotesCount || 0,
        downvotesCount: f.properties?.downvotesCount || 0,
        createdAt: f.properties?.createdAt || new Date().toISOString(),
        isDemo: Boolean(f.properties?.isDemo),
      }));
    }
    return FALLBACK_PREVIEW_EVENTS;
  }, [geoJson]);

  // Ekran üzerindeki konumları hesapla (Kayseri merkezli görsel grid)
  const pinPositions = useMemo(() => {
    const centerX = SCREEN_WIDTH / 2 + centerOffset.x;
    const centerY = SCREEN_HEIGHT / 2 + centerOffset.y - 40;
    const spread = (zoomLevel / 13) * 110;

    return [
      { x: centerX - spread * 0.7, y: centerY - spread * 0.9 },
      { x: centerX + spread * 0.6, y: centerY - spread * 0.4 },
      { x: centerX - spread * 0.3, y: centerY + spread * 0.8 },
      { x: centerX + spread * 0.8, y: centerY + spread * 0.6 },
      { x: centerX - spread * 1.1, y: centerY + spread * 0.2 },
      { x: centerX + spread * 0.2, y: centerY - spread * 1.1 },
      { x: centerX - spread * 0.5, y: centerY - spread * 0.2 },
    ];
  }, [centerOffset, zoomLevel]);

  // Zoom In Eylemi
  const handleZoomIn = useCallback(() => {
    setZoomLevel((z) => Math.min(z + 1, 16));
  }, []);

  // Zoom Out Eylemi
  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => Math.max(z - 1, 10));
  }, []);

  // Merkeze Dön (Cumhuriyet Meydanı)
  const handleResetCenter = useCallback(() => {
    setCenterOffset({ x: 0, y: 0 });
    setZoomLevel(13);
    onBBoxChange?.({
      west: 35.3853,
      south: 38.6225,
      east: 35.5853,
      north: 38.8225,
    });
  }, [onBBoxChange]);

  // Harita arka plan teması renkleri
  const mapBgColor =
    styleMode === 'satellite'
      ? '#091524'
      : styleMode === 'dark' || (styleMode === 'light' && isDark)
      ? '#0F172A'
      : '#F1F5F9';

  const gridLineColor =
    styleMode === 'satellite'
      ? 'rgba(45, 212, 191, 0.12)'
      : isDark
      ? 'rgba(255, 255, 255, 0.07)'
      : 'rgba(0, 0, 0, 0.06)';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: mapBgColor }]}>
      {/* 1. Kentsel Harita Izgarası ve Yollar (Vektör Harita Simülasyonu) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Yatay ve Dikey Izgara Çizgileri */}
        {[...Array(12)].map((_, i) => (
          <View
            key={`h-${i}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: i * 70,
              height: 1,
              backgroundColor: gridLineColor,
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <View
            key={`v-${i}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: i * 65,
              width: 1,
              backgroundColor: gridLineColor,
            }}
          />
        ))}

        {/* Ana Arter Bulvar Simülasyonları */}
        <View
          style={{
            position: 'absolute',
            top: SCREEN_HEIGHT * 0.38 + centerOffset.y,
            left: -50,
            right: -50,
            height: 6,
            backgroundColor: isDark ? '#334155' : '#CBD5E1',
            transform: [{ rotate: '-12deg' }],
            opacity: 0.6,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: -50,
            bottom: -50,
            left: SCREEN_WIDTH * 0.52 + centerOffset.x,
            width: 8,
            backgroundColor: isDark ? '#334155' : '#CBD5E1',
            transform: [{ rotate: '18deg' }],
            opacity: 0.5,
          }}
        />

        {/* Şehir Odak Noktası Etiketleri */}
        <View
          style={{
            position: 'absolute',
            top: SCREEN_HEIGHT / 2 - 20 + centerOffset.y,
            left: SCREEN_WIDTH / 2 - 60 + centerOffset.x,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.85)',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: radii.full,
              borderWidth: 1,
              borderColor: isDark ? '#334155' : '#E2E8F0',
            }}
          >
            <AppText variant="caption" weight="bold" color={theme.textSecondary}>
              Cumhuriyet Meydanı
            </AppText>
          </View>
        </View>

        <View
          style={{
            position: 'absolute',
            top: SCREEN_HEIGHT * 0.32 + centerOffset.y,
            left: 30 + centerOffset.x,
          }}
        >
          <AppText variant="caption" color={theme.textMuted} weight="medium">
            Melikgazi
          </AppText>
        </View>

        <View
          style={{
            position: 'absolute',
            top: SCREEN_HEIGHT * 0.62 + centerOffset.y,
            right: 40 - centerOffset.x,
          }}
        >
          <AppText variant="caption" color={theme.textMuted} weight="medium">
            Talas Bulvarı
          </AppText>
        </View>
      </View>

      {/* 2. Isı Haritası (Heatmap) Simülasyonu Katmanı */}
      {showHeatmap ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View
            style={{
              position: 'absolute',
              top: SCREEN_HEIGHT * 0.38 + centerOffset.y,
              left: SCREEN_WIDTH * 0.28 + centerOffset.x,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: 'rgba(239, 68, 68, 0.35)',
              borderWidth: 20,
              borderColor: 'rgba(249, 115, 22, 0.25)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: SCREEN_HEIGHT * 0.48 + centerOffset.y,
              left: SCREEN_WIDTH * 0.55 + centerOffset.x,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(245, 158, 11, 0.35)',
              borderWidth: 15,
              borderColor: 'rgba(45, 212, 191, 0.2)',
            }}
          />
        </View>
      ) : null}

      {/* 3. Kullanıcı Konumu Noktası */}
      {userCoords ? (
        <View
          style={{
            position: 'absolute',
            top: SCREEN_HEIGHT / 2 + 30 + centerOffset.y,
            left: SCREEN_WIDTH / 2 - 12 + centerOffset.x,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: 'rgba(14, 165, 233, 0.25)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#0EA5E9',
              borderWidth: 2,
              borderColor: '#FFFFFF',
            }}
          />
        </View>
      ) : null}

      {/* 4. Etkileşimli Olay İşaretçileri (Pulse Event Pins) */}
      {displayEvents.map((event, idx) => {
        const pos = pinPositions[idx % pinPositions.length];
        if (!pos) return null;
        const isSelected = selectedEventId === event.id;

        return (
          <TouchableOpacity
            key={event.id}
            activeOpacity={0.8}
            onPress={() => onSelectEvent?.(event)}
            accessibilityRole="button"
            accessibilityLabel={`${event.category}: ${event.title}`}
            style={{
              position: 'absolute',
              top: pos.y,
              left: pos.x,
              alignItems: 'center',
              zIndex: isSelected ? 99 : 10,
            }}
          >
            {/* Dış Pulsleme / Seçili Halkası */}
            <View
              style={{
                width: isSelected ? 48 : 38,
                height: isSelected ? 48 : 38,
                borderRadius: isSelected ? 24 : 19,
                backgroundColor: isSelected
                  ? 'rgba(20, 184, 166, 0.28)'
                  : 'rgba(255, 255, 255, 0.85)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.18,
                shadowRadius: 5,
                elevation: 4,
                borderWidth: isSelected ? 2.5 : 1.5,
                borderColor: isSelected ? theme.primary : '#FFFFFF',
              }}
            >
              {/* İç Kategori İkon Dairesi */}
              <View
                style={{
                  width: isSelected ? 34 : 28,
                  height: isSelected ? 34 : 28,
                  borderRadius: isSelected ? 17 : 14,
                  backgroundColor: event.categoryColor || theme.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {getCategoryIcon(event.category, '#FFFFFF', isSelected ? 17 : 14)}
              </View>
            </View>

            {/* Seçili İse Başlık Rozeti */}
            {isSelected ? (
              <View
                style={{
                  marginTop: 4,
                  backgroundColor: theme.surfaceElevated,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: radii.full,
                  borderWidth: 1,
                  borderColor: theme.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <AppText variant="caption" weight="bold" color={theme.text}>
                  {event.title.length > 20
                    ? `${event.title.substring(0, 18)}...`
                    : event.title}
                </AppText>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}

      {/* 5. Sol Üst: Expo Go Önizleme Modu Bilgi Rozeti */}
      <View
        style={{
          position: 'absolute',
          top: 138,
          left: 16,
          right: 16,
          zIndex: 5,
          alignItems: 'center',
        }}
        pointerEvents="box-none"
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.94)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: radii.full,
            borderWidth: 1,
            borderColor: isDark ? '#334155' : '#E2E8F0',
            gap: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Info size={14} color={theme.primary} />
          <AppText variant="caption" weight="bold" color={theme.text}>
            Expo Go Önizleme Modu
          </AppText>
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.textMuted,
            }}
          />
          <AppText variant="caption" color={theme.textSecondary}>
            MapLibre Native için EAS Build kullanılır
          </AppText>
        </View>
      </View>

      {/* 6. Sol Alt: Simülatör Zoom ve Merkeze Dön Butonları */}
      <View
        style={{
          position: 'absolute',
          bottom: 110,
          left: 16,
          gap: 8,
          zIndex: 20,
        }}
      >
        <TouchableOpacity
          onPress={handleZoomIn}
          accessibilityRole="button"
          accessibilityLabel="Yakınlaştır"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.surfaceElevated,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <ZoomIn size={18} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleZoomOut}
          accessibilityRole="button"
          accessibilityLabel="Uzaklaştır"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.surfaceElevated,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <ZoomOut size={18} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetCenter}
          accessibilityRole="button"
          accessibilityLabel="Meydana Dön"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.surfaceElevated,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <Navigation size={17} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
