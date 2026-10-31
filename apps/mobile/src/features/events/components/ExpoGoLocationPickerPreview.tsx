import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Navigation2,
  MapPin,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { AppText, AppButton, FloatingIconButton } from '../../../components/ui';
import { useAppTheme } from '../../../theme';
import type { LocationPickerModalProps } from './LocationPickerModal';
import type { SelectedLocation } from '../types/events.types';

export function ExpoGoLocationPickerPreview({
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

  // GPS İzni ve Gerçek Konum Alma
  const handleUseCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Konum izni verilmedi. Koordinatları butonlarla ayarlayabilirsiniz.');
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;
      setCoords({ latitude, longitude });
    } catch {
      setLocationError('Konum alınırken bir sorun oluştu.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  // İnce Ayar Kaydırma Butonları
  const nudge = useCallback((dLat: number, dLng: number) => {
    setCoords((c) => ({
      latitude: Number((c.latitude + dLat).toFixed(6)),
      longitude: Number((c.longitude + dLng).toFixed(6)),
    }));
  }, []);

  // Konum Onayı
  const handleConfirm = useCallback(() => {
    const selected: SelectedLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      district: coords.latitude > 38.72 ? 'Melikgazi' : 'Kocasinan',
      addressText: `Cumhuriyet Meydanı Civarı (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
      city: 'Kayseri',
    };
    onSelectLocation(selected);
    onClose();
  }, [coords, onSelectLocation, onClose]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
        ]}
      >
        {/* Üst Başlık ve Geri Butonu */}
        <View
          style={{
            paddingTop: Math.max(insets.top, 16),
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            backgroundColor: theme.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            zIndex: 10,
          }}
        >
          <FloatingIconButton
            icon={<ArrowLeft size={20} color={theme.text} />}
            onPress={onClose}
            accessibilityLabel="Geri Dön"
          />
          <View style={{ flex: 1 }}>
            <AppText variant="headingM" weight="bold">
              Konum Seçimi
            </AppText>
            <AppText variant="caption" color={theme.textSecondary}>
              Expo Go Önizleme Modu
            </AppText>
          </View>
        </View>

        {/* Bilgilendirme Notu */}
        <View
          style={{
            margin: spacing.md,
            padding: spacing.sm,
            borderRadius: radii.md,
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.9)',
            borderWidth: 1,
            borderColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Info size={16} color={theme.primary} />
          <AppText variant="caption" color={theme.textSecondary} style={{ flex: 1 }}>
            GPS butonuna basarak telefonunuzun gerçek konumunu alabilir veya yön tuşlarıyla ince ayar yapabilirsiniz.
          </AppText>
        </View>

        {/* Merkez Hedef ve Koordinat Görseli */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
          }}
        >
          {/* Hedef Dairesi & Pin */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(20, 184, 166, 0.12)',
              borderWidth: 2,
              borderColor: theme.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}
          >
            <MapPin size={42} color={theme.primary} />
          </View>

          {/* Aktif Koordinat Göstergesi */}
          <View
            style={{
              backgroundColor: theme.surfaceElevated,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <AppText variant="bodyM" weight="bold">
              {coords.latitude.toFixed(5)}° K, {coords.longitude.toFixed(5)}° D
            </AppText>
            <AppText variant="caption" color={theme.textSecondary}>
              Kayseri / {coords.latitude > 38.72 ? 'Melikgazi' : 'Kocasinan'}
            </AppText>
          </View>

          {/* İnce Ayar Yön Tuşları */}
          <View style={{ alignItems: 'center', gap: 6, marginVertical: spacing.md }}>
            <TouchableOpacity
              onPress={() => nudge(0.001, 0)}
              style={styles.nudgeBtn}
              accessibilityLabel="Kuzeye Kaydır"
            >
              <ChevronUp size={20} color={theme.text} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 24 }}>
              <TouchableOpacity
                onPress={() => nudge(0, -0.001)}
                style={styles.nudgeBtn}
                accessibilityLabel="Batıya Kaydır"
              >
                <ChevronLeft size={20} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => nudge(0, 0.001)}
                style={styles.nudgeBtn}
                accessibilityLabel="Doğuya Kaydır"
              >
                <ChevronRight size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => nudge(-0.001, 0)}
              style={styles.nudgeBtn}
              accessibilityLabel="Güneye Kaydır"
            >
              <ChevronDown size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* GPS Butonu */}
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            disabled={isLocating}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: theme.surfaceElevated,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: radii.full,
              borderWidth: 1,
              borderColor: theme.primary,
              marginTop: spacing.sm,
            }}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Navigation2 size={16} color={theme.primary} />
            )}
            <AppText variant="caption" weight="bold" color={theme.primary}>
              Mevcut GPS Konumumu Al
            </AppText>
          </TouchableOpacity>

          {locationError ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: spacing.sm,
              }}
            >
              <AlertTriangle size={14} color={theme.error} />
              <AppText variant="caption" color={theme.error}>
                {locationError}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Alt Onay Butonu */}
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Math.max(insets.bottom, 20),
            backgroundColor: theme.surface,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <AppButton
            title="Bu Konumu Seç"
            onPress={handleConfirm}
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  nudgeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
