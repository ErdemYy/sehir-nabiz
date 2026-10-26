import { create } from 'zustand';
import type { UserResponse, LoginInput, RegisterInput } from '@sehir-nabiz/shared';
import { authApi } from '../services/authApi';
import { secureTokenStorage } from '../services/secureTokenStorage';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Eylemler
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  getValidAccessToken: () => Promise<string | null>;
  clearError: () => void;
}

// Eşzamanlı refresh isteklerini koordine eden Promise (Race condition kilidi)
let refreshPromise: Promise<string | null> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (input: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(input);
      // Refresh token güvenli saklama alanına kaydedilir
      await secureTokenStorage.setRefreshToken(response.tokens.refreshToken);

      set({
        user: response.user,
        accessToken: response.tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Giriş yapılamadı.',
      });
      throw err;
    }
  },

  register: async (input: RegisterInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(input);
      await secureTokenStorage.setRefreshToken(response.tokens.refreshToken);

      set({
        user: response.user,
        accessToken: response.tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Kayıt yapılamadı.',
      });
      throw err;
    }
  },

  logout: async () => {
    const refreshToken = await secureTokenStorage.getRefreshToken();
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
    await secureTokenStorage.removeRefreshToken();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async (): Promise<boolean> => {
    const refreshToken = await secureTokenStorage.getRefreshToken();
    if (!refreshToken) {
      set({ isAuthenticated: false, user: null, accessToken: null });
      return false;
    }

    set({ isLoading: true });
    try {
      const tokens = await authApi.refreshTokens(refreshToken);
      await secureTokenStorage.setRefreshToken(tokens.refreshToken);

      // Profil bilgisini çek
      const profile = await authApi.getMe(tokens.accessToken);
      set({
        user: profile,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      await secureTokenStorage.removeRefreshToken();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    }
  },

  getValidAccessToken: async (): Promise<string | null> => {
    const currentToken = get().accessToken;
    if (currentToken) {
      return currentToken;
    }

    // Halihazırda devam eden bir refresh isteği varsa onu bekle (Yarış durumunu engelle)
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const refreshToken = await secureTokenStorage.getRefreshToken();
        if (!refreshToken) return null;

        const tokens = await authApi.refreshTokens(refreshToken);
        await secureTokenStorage.setRefreshToken(tokens.refreshToken);

        set({
          accessToken: tokens.accessToken,
          isAuthenticated: true,
        });

        return tokens.accessToken;
      } catch (err) {
        await secureTokenStorage.removeRefreshToken();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },
}));
