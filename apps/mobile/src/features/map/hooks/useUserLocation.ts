import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import type { UserLocationState } from '../types/map.types';

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    coords: null,
    permissionStatus: 'undetermined',
    isLoading: false,
    error: null,
  });

  const requestLocation = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Konum servisinin cihazda açık olduğunu denetle
      const isServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!isServicesEnabled) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Cihazınızın konum servisi (GPS) kapalı. Lütfen ayarlardan açınız.',
        }));
        return null;
      }

      // 2. Kullanıcıdan açık izin iste
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setState((prev) => ({
          ...prev,
          permissionStatus: 'denied',
          isLoading: false,
          error: 'Konum izni reddedildi. Haritayı manuel olarak gezinebilirsiniz.',
        }));
        return null;
      }

      // 3. Konumu al (Dengeli doğruluk, hızlı yanıt)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };

      setState({
        coords: newCoords,
        permissionStatus: 'granted',
        isLoading: false,
        error: null,
      });

      return {
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
      };
    } catch (err: any) {
      const errorMessage =
        err?.message?.includes('timeout') || err?.code === 'E_LOCATION_TIMEOUT'
          ? 'Konum belirleme zaman aşımına uğradı. Lütfen tekrar deneyiniz.'
          : 'Konumunuz alınırken bir hata oluştu.';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  return {
    ...state,
    requestLocation,
  };
}
