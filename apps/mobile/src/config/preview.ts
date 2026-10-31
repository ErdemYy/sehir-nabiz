import Constants, { ExecutionEnvironment } from 'expo-constants';
import { env } from './env';

/**
 * Expo Go Önizleme Modu Denetleyicisi
 * 
 * Bu mod yalnızca geliştirme ortamında ve Expo Go (StoreClient) içerisinde aktiftir.
 * Production derlemelerinde kesinlikle KAPALIDIR (her zaman false döner).
 */
export function isExpoGoPreview(): boolean {
  // 1. Güvenlik Bariyeri: Production ortamında preview modu kesinlikle açılamaz
  if (env.appEnv === 'production') {
    return false;
  }

  // 2. Çevresel Değişken Denetimi (Metro tarafından derleme zamanında enjekte edilir)
  if (process.env.EXPO_PUBLIC_EXPO_GO_PREVIEW === 'true') {
    return true;
  }

  // 3. Expo Constants Çalışma Zamanı Denetimi
  try {
    const isStoreClient =
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      (Constants as any).appOwnership === 'expo';

    return Boolean(isStoreClient);
  } catch {
    return false;
  }
}

/**
 * Önizleme Modu Bilgi Metinleri ve Etiketleri
 */
export const PREVIEW_CONFIG = {
  modeName: 'Expo Go Önizleme Modu',
  badgeText: 'Önizleme Modu',
  mapNotice:
    'Expo Go ortamında vektör harita motoru simüle edilmektedir. Donanım ivmeli MapLibre Native harita için EAS Preview derlemesi kullanılır.',
  isReadOnlyNotice: 'Önizleme verileri test amaçlıdır.',
} as const;
