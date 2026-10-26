import { Platform } from 'react-native';

/**
 * Mobil Ortam Değişkenleri Güvenli Okuyucu
 * EXPO_PUBLIC_ prefix'i ile derleme zamanında güvenli şekilde enjekte edilir.
 */

export interface MobileEnv {
  apiUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  mapStyleUrl: string;
}

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android emülatör 10.0.2.2 üzerinden geliştirici hostuna bağlanır
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api/v1';
  }
  return 'http://localhost:3001/api/v1';
}

export const env: MobileEnv = {
  apiUrl: getApiBaseUrl(),
  appEnv: (process.env.EXPO_PUBLIC_APP_ENV as MobileEnv['appEnv']) || 'development',
  mapStyleUrl:
    process.env.EXPO_PUBLIC_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json',
};
