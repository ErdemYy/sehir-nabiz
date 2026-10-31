import { Platform } from 'react-native';

/**
 * Mobil Ortam Değişkenleri Güvenli Okuyucu
 * EXPO_PUBLIC_ prefix'i ile derleme zamanında istemci koduna gömülür.
 * 
 * DİKKAT: EXPO_PUBLIC_ değişkenleri halka açıktır (public/untrusted);
 * hiçbir API gizli anahtarı veya servis sırrı bu değişkenlerde saklanamaz.
 */

export interface MobileEnv {
  apiUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  mapStyleUrl: string;
  isProductionConfigured: boolean;
}

export function getApiBaseUrl(): string {
  const customUrl = process.env.EXPO_PUBLIC_API_URL;
  const appEnv = (process.env.EXPO_PUBLIC_APP_ENV as MobileEnv['appEnv']) || 'development';
  const isProd =
    appEnv === 'production' ||
    (!process.env.EXPO_PUBLIC_APP_ENV && !__DEV__ && process.env.NODE_ENV === 'production');

  if (customUrl) {
    const trimmed = customUrl.trim();
    const isLocalhostOrLoopback =
      trimmed.includes('localhost') ||
      trimmed.includes('127.0.0.1') ||
      trimmed.includes('10.0.2.2') ||
      trimmed.startsWith('http://192.168.') ||
      trimmed.startsWith('http://10.') ||
      trimmed.startsWith('http://172.');

    if (isProd && isLocalhostOrLoopback) {
      console.error(
        '[CRITICAL SECURITY/CONFIG] Production derlemesinde localhost veya yerel IP adresi kullanılamaz:',
        trimmed,
      );
      // Production ortamında yerel döngü adreslerine istek gitmesini engelle
      return '';
    }
    return trimmed;
  }

  // Production ortamında API URL tanımlanmamışsa yerel IP fallback'i VERİLMEZ
  if (isProd) {
    console.error(
      '[CRITICAL CONFIG] Production ortamı için EXPO_PUBLIC_API_URL tanımlanmamış! Production derlemesi BLOCKED durumundadır.',
    );
    return '';
  }

  // Yalnızca Geliştirme (Development) ortamında yerel emülatör fallback'i
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
  isProductionConfigured: Boolean(
    process.env.EXPO_PUBLIC_API_URL &&
      !process.env.EXPO_PUBLIC_API_URL.includes('localhost') &&
      !process.env.EXPO_PUBLIC_API_URL.includes('10.0.2.2') &&
      !process.env.EXPO_PUBLIC_API_URL.includes('127.0.0.1'),
  ),
};
