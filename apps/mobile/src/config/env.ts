/**
 * Mobil Ortam Değişkenleri Güvenli Okuyucu
 * EXPO_PUBLIC_ prefix'i ile derleme zamanında güvenli şekilde enjekte edilir.
 */

export interface MobileEnv {
  apiUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  mapStyleUrl: string;
}

export const env: MobileEnv = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  appEnv: (process.env.EXPO_PUBLIC_APP_ENV as MobileEnv['appEnv']) || 'development',
  mapStyleUrl:
    process.env.EXPO_PUBLIC_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json',
};
