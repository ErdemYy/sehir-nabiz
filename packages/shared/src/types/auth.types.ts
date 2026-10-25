import { UserRole, AccountStatus } from '../enums';

/**
 * Kullanıcı Açık Yanıt Modeli (Hassas bilgiler asla dönülmez)
 */
export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  reputationScore: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * JWT Token Yanıtı
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Giriş ve Kayıt Sonrası Dönen Tam Yanıt
 */
export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}

/**
 * JWT Payload Yapısı
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
