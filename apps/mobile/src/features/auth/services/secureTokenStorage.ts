import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'sehir_nabiz_refresh_token';

// Web veya SecureStore desteklemeyen ortamlar için bellek içi yedek
let inMemoryFallbackToken: string | null = null;

export const secureTokenStorage = {
  async getRefreshToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return inMemoryFallbackToken;
      }
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.warn('[SecureStorage] Refresh token okunamadı, bellek içi değer kontrol ediliyor:', err);
      return inMemoryFallbackToken;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        inMemoryFallbackToken = token;
        return;
      }
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (err) {
      console.warn('[SecureStorage] Refresh token SecureStore\'a yazılamadı, bellekte tutuluyor:', err);
      inMemoryFallbackToken = token;
    }
  },

  async removeRefreshToken(): Promise<void> {
    try {
      inMemoryFallbackToken = null;
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (err) {
      console.warn('[SecureStorage] Refresh token silinirken hata oluştu:', err);
    }
  },
};
