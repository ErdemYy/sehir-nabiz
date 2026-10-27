import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Navigation2,
  MapPin,
  AlertTriangle,
} from 'lucide-react-native';
import { AppText, AppButton, FloatingIconButton } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import type { SelectedLocation } from '../types/events.types';

export interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: SelectedLocation) => void;
  initialCoords?: { latitude: number; longitude: number } | null;
}

export function LocationPickerModal({
  visible,
  onClose,
  onSelectLocation,
  initialCoords,
}: LocationPickerModalProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { theme, spacing, radii, isDark } = useAppTheme();

  const defaultLat = initialCoords?.latitude ?? 38.7225;
  const defaultLng = initialCoords?.longitude ?? 35.4853;

  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: defaultLat,
    longitude: defaultLng,
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (!visible || typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || !window.L) return;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      const map = window.L.map(mapContainerRef.current, {
        center: [coords.latitude, coords.longitude],
        zoom: 15,
        zoomControl: false,
      });

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      window.L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

      map.on('move', () => {
        const center = map.getCenter();
        setCoords({ latitude: center.lat, longitude: center.lng });
      });

      leafletMapRef.current = map;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [visible, isDark]);

  const handleUseCurrentLocation = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setCoords({ latitude, longitude });
          leafletMapRef.current?.setView([latitude, longitude], 16);
          setIsLocating(false);
        },
        err => {
          setLocationError('Konum alınamadı: ' + err.message);
          setIsLocating(false);
        }
      );
    } else {
      setLocationError('Tarayıcınız konum özelliğini desteklemiyor.');
      setIsLocating(false);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    onSelectLocation({
      latitude: Number(coords.latitude.toFixed(6)),
      longitude: Number(coords.longitude.toFixed(6)),
    });
    onClose();
  }, [coords, onSelectLocation, onClose]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />

        {/* Merkez Pin */}
        <View style={styles.centerMarkerContainer} pointerEvents="none">
          <View style={[styles.pulseRing, { borderColor: theme.primary }]} />
          <MapPin size={40} color={theme.primary} strokeWidth={2.5} style={styles.pinIcon} />
        </View>

        {/* Üst Bar */}
        <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
          <FloatingIconButton
            icon={<ArrowLeft size={20} color={theme.text} />}
            accessibilityLabel="Kapat"
            onPress={onClose}
          />
          <View style={[styles.titleBadge, { backgroundColor: theme.surface, borderRadius: radii.full }]}>
            <AppText variant="caption" weight="semibold" style={{ color: theme.text }}>
              Haritada Konumu Seçin
            </AppText>
          </View>
        </View>

        {/* GPS Butonu */}
        <View style={[styles.gpsButtonContainer, { bottom: insets.bottom + 120 }]}>
          <FloatingIconButton
            icon={<Navigation2 size={20} color={theme.primary} />}
            accessibilityLabel="Mevcut Konumuma Git"
            onPress={handleUseCurrentLocation}
          />
        </View>

        {/* Alt Onay Kartı */}
        <View
          style={[
            styles.bottomCard,
            {
              backgroundColor: theme.surface,
              paddingBottom: insets.bottom + spacing.md,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
            },
          ]}
        >
          {locationError ? (
            <View style={[styles.errorRow, { backgroundColor: theme.errorLight || 'rgba(239, 68, 68, 0.1)' }]}>
              <AlertTriangle size={16} color={theme.error} />
              <AppText variant="caption" style={{ color: theme.error, flex: 1, marginLeft: 6 }}>
                {locationError}
              </AppText>
            </View>
          ) : null}

          <View style={styles.coordsRow}>
            <View>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Seçilen Koordinat
              </AppText>
              <AppText variant="bodyM" weight="bold">
                {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </AppText>
            </View>
            {isLocating ? <ActivityIndicator size="small" color={theme.primary} /> : null}
          </View>

          <AppButton
            title="Bu Konumu Seç"
            onPress={handleConfirm}
            variant="primary"
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pinIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pulseRing: {
    position: 'absolute',
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'rgba(20, 184, 166, 0.25)',
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  titleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  gpsButtonContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
});
