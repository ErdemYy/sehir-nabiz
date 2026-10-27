import type {
  LoginInput,
  RegisterInput,
  AuthResponse,
  AuthTokens,
  UserResponse,
} from '@sehir-nabiz/shared';
import { getApiBaseUrl } from '../../../config/env';

export class AuthApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        data.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.',
        data
      );
    }

    return data as AuthResponse;
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        data.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyiniz.',
        data
      );
    }

    return data as AuthResponse;
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        data.message || 'Oturum yenilenemedi. Lütfen tekrar giriş yapınız.',
        data
      );
    }

    return data as AuthTokens;
  },

  async logout(refreshToken: string): Promise<void> {
    const baseUrl = getApiBaseUrl();
    try {
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      console.warn('[AuthApi] Logout isteği başarısız oldu (yerel oturum yine de temizleniyor):', err);
    }
  },

  async getMe(accessToken: string): Promise<UserResponse> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        data.message || 'Kullanıcı profili alınamadı.',
        data
      );
    }

    return data as UserResponse;
  },

  /**
   * Hesap ve Kişisel Verileri Kalıcı Olarak Silme Talebi (DELETE /users/me) (Phase 14)
   */
  async deleteAccount(
    token: string,
    input: { password: string; reason?: string; immediate?: boolean }
  ): Promise<any> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/users/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        data.message || 'Hesap silme işlemi gerçekleştirilemedi.',
        data
      );
    }

    return data;
  },

  /**
   * Silme Talebini İptal Etme (POST /users/cancel-deletion) (Phase 14)
   */
  async cancelDeletion(
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/users/cancel-deletion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        data.message || 'Silme talebi iptal edilemedi.',
        data
      );
    }

    return data;
  },
};
