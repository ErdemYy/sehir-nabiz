import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Map,
  Camera,
  type CameraRef,
  type ViewStateChangeEvent,
} from '@maplibre/maplibre-react-native';
import {
  ArrowLeft,
  Navigation2,
  MapPin,
  AlertTriangle,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { AppText, AppButton, FloatingIconButton } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import { MAP_CONFIG } from '../../map/config/mapConfig';
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
  const cameraRef = useRef<CameraRef>(null);

  // Başlangıç konumu (Kayseri veya mevcut koordinat)
  const defaultLat = initialCoords?.latitude ?? 38.7225;
  const defaultLng = initialCoords?.longitude ?? 35.4853;

  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: defaultLat,
    longitude: defaultLng,
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Harita kamera hareketi tamamlandığında merkez koordinatını güncelle
  const handleRegionDidChange = useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      const bounds = event.nativeEvent?.bounds;
      if (bounds && Array.isArray(bounds) && bounds.length >= 4) {
        const [west, south, east, north] = bounds;
        const centerLng = (west + east) / 2;
        const centerLat = (south + north) / 2;
        setCoords({ latitude: centerLat, longitude: centerLng });
      }
    },
    []
  );

  // Yalnızca kullanıcı butona bastığında GPS izni talep et
  const handleUseCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Konum izni verilmedi. Harita üzerinden manuel seçim yapabilirsiniz.');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoords({ latitude, longitude });

      cameraRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 15.5,
        duration: 800,
      });
    } catch (err: any) {
      setLocationError('Konum alınırken bir hata oluştu.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    // Sahte adres üretilmez, koordinatlar net ve doğru olarak döndürülür
    onSelectLocation({
      latitude: Number(coords.latitude.toFixed(6)),
      longitude: Number(coords.longitude.toFixed(6)),
    });
    onClose();
  }, [coords, onSelectLocation, onClose]);

  const mapStyleUrl = isDark ? MAP_CONFIG.styles.dark : MAP_CONFIG.styles.light;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* MapLibre Harita Katmanı */}
        <Map
          style={StyleSheet.absoluteFill}
          mapStyle={mapStyleUrl}
          attribution={false}
          logo={false}
          onRegionDidChange={handleRegionDidChange}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [defaultLng, defaultLat],
              zoom: 14.5,
            }}
          />
        </Map>

        {/* Harita Merkezindeki Sabit İğne (Center Pin) */}
        <View pointerEvents="none" style={styles.centerPinWrapper}>
          <View style={styles.pinIconContainer}>
            <MapPin size={38} color="#EF4444" fill="#EF4444" />
          </View>
          {/* İğne gölgesi */}
          <View style={styles.pinShadow} />
        </View>

        {/* Üst Floating Kontrol Çubuğu */}
        <View
          style={[
            styles.topBar,
            {
              top: Math.max(insets.top + spacing.xs, 16),
              left: spacing.lg,
              right: spacing.lg,
            },
          ]}
        >
          <FloatingIconButton
            icon={<ArrowLeft size={20} color={theme.text} />}
            onPress={onClose}
            accessibilityLabel="Geri Dön"
          />

          <View
            style={[
              styles.coordCard,
              {
                backgroundColor: theme.surface,
                borderRadius: radii.pill,
                borderColor: theme.border,
              },
            ]}
          >
            <AppText variant="caption" weight="bold" color={theme.primary}>
              {coords.latitude.toFixed(4)}° K, {coords.longitude.toFixed(4)}° D
            </AppText>
          </View>
        </View>

        {/* Konum İzni Hatası Bildirimi */}
        {locationError ? (
          <View
            style={[
              styles.errorBanner,
              {
                top: Math.max(insets.top + 72, 80),
                left: spacing.lg,
                right: spacing.lg,
                backgroundColor: theme.errorLight,
                borderColor: theme.error,
                borderRadius: radii.medium,
              },
            ]}
          >
            <AlertTriangle size={16} color={theme.error} />
            <AppText variant="caption" color={theme.error} style={{ flex: 1 }}>
              {locationError}
            </AppText>
          </View>
        ) : null}

        {/* Sağ Taraf GPS Konum Butonu */}
        <View
          style={[
            styles.gpsButtonWrapper,
            {
              bottom: Math.max(insets.bottom + 100, 110),
              right: spacing.lg,
            },
          ]}
        >
          <FloatingIconButton
            icon={
              isLocating ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Navigation2 size={20} color={theme.primary} />
              )
            }
            onPress={handleUseCurrentLocation}
            accessibilityLabel="Mevcut Konumumu Kullan"
          />
        </View>

        {/* Alt Onay Paneli (Urban Floating UI Kartı) */}
        <View
          style={[
            styles.bottomPanel,
            {
              bottom: Math.max(insets.bottom + spacing.sm, 16),
              left: spacing.lg,
              right: spacing.lg,
              backgroundColor: theme.surface,
              borderRadius: radii.card,
              borderColor: theme.border,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.bottomHeaderRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyS" weight="bold">
                Olay Konumunu Doğrulayın
              </AppText>
              <AppText variant="caption" color={theme.textSecondary}>
                Haritayı kaydırarak iğneyi olayın tam gerçekleştiği noktaya getirin.
              </AppText>
            </View>
          </View>

          <AppButton
            title="Bu Konumu Seç"
            variant="primary"
            onPress={handleConfirm}
            fullWidth
            style={{ marginTop: spacing.sm }}
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
  centerPinWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pinIconContainer: {
    marginBottom: 38, // İğnenin ucunu tam merkeze getirmek için
  },
  pinShadow: {
    position: 'absolute',
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  topBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  coordCard: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorBanner: {
    position: 'absolute',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderWidth: 1,
  },
  gpsButtonWrapper: {
    position: 'absolute',
    zIndex: 20,
  },
  bottomPanel: {
    position: 'absolute',
    zIndex: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  bottomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
