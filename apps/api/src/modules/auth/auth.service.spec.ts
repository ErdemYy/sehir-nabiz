import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole, AccountStatus } from '@sehir-nabiz/shared';
import { UserEntity, RefreshTokenEntity } from '../../database/entities';

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockRefreshTokenRepo: any;
  let mockJwtService: any;
  let mockConfigService: any;

  const mockUser: UserEntity = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'test@sehirnabiz.local',
    passwordHash: '$2a$12$eX4mpL3h4sH.vAl1dP4ssw0rdH4shF0rT3st1ngPurp0s3s',
    displayName: 'Test Kullanıcı',
    role: UserRole.CITIZEN,
    accountStatus: AccountStatus.ACTIVE,
    reputationScore: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto: any) => ({ ...dto, id: mockUser.id, createdAt: new Date(), updatedAt: new Date() })),
      save: vi.fn((entity: any) => Promise.resolve(entity)),
      createQueryBuilder: vi.fn(() => ({
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn(),
      })),
    };

    mockRefreshTokenRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto: any) => ({ ...dto, id: 'token-uuid-1' })),
      save: vi.fn((entity: any) => Promise.resolve(entity)),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('mocked-jwt-token'),
      verify: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test_access_secret_key_32chars_min!!';
        if (key === 'JWT_REFRESH_SECRET') return 'test_refresh_secret_key_32chars_min!';
        return defaultVal;
      }),
    };

    authService = new AuthService(
      mockUserRepo,
      mockRefreshTokenRepo,
      mockJwtService,
      mockConfigService,
    );
  });

  describe('Password Hashing & Verification', () => {
    it('şifreyi güvenli biçimde hashlemeli ve doğrulamalı', async () => {
      const rawPassword = 'Password123!';
      const hash = await authService.hashPassword(rawPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toEqual(rawPassword);
      expect(hash.startsWith('$2')).toBe(true);

      const isValid = await authService.comparePassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await authService.comparePassword('WrongPassword1!', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Register', () => {
    it('yeni kullanıcıyı başarıyla kaydetmeli ve hassas şifreyi gizlemeli', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await authService.register({
        email: 'yeni@sehirnabiz.local',
        password: 'Password123',
        displayName: 'Yeni Vatandaş',
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe('yeni@sehirnabiz.local');
      expect(result.user.displayName).toBe('Yeni Vatandaş');
      expect(result.user.role).toBe(UserRole.CITIZEN);
      expect(result.user.reputationScore).toBe(10);
      expect((result.user as any).passwordHash).toBeUndefined();
      expect(result.tokens.accessToken).toBe('mocked-jwt-token');
      expect(result.tokens.refreshToken).toBe('mocked-jwt-token');
      expect(mockRefreshTokenRepo.save).toHaveBeenCalled();
    });

    it('mükerrer e-posta durumunda ConflictException fırlatmalı', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: mockUser.email,
          password: 'Password123',
          displayName: 'Tekrar Kullanıcı',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Login', () => {
    it('geçerli bilgilerle giriş yapıldığında token ve kullanıcı dönmeli', async () => {
      const qb = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockUser),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);
      vi.spyOn(authService, 'comparePassword').mockResolvedValue(true);

      const result = await authService.login({
        email: mockUser.email,
        password: 'ValidPassword123',
      });

      expect(result.user.id).toBe(mockUser.id);
      expect((result.user as any).passwordHash).toBeUndefined();
      expect(result.tokens.accessToken).toBe('mocked-jwt-token');
    });

    it('kullanıcı bulunamazsa generic UnauthorizedException dönmeli', async () => {
      const qb = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        authService.login({ email: 'bilinmeyen@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('hatalı şifrede generic UnauthorizedException dönmeli', async () => {
      const qb = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(mockUser),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(qb);
      vi.spyOn(authService, 'comparePassword').mockResolvedValue(false);

      await expect(
        authService.login({ email: mockUser.email, password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Token Rotation & Reuse Detection', () => {
    it('geçerli refresh token ile yeni token çifti üretmeli ve eskiyi iptal etmeli', async () => {
      const rawRefreshToken = 'valid-refresh-token';
      mockJwtService.verify.mockReturnValue({ sub: mockUser.id, email: mockUser.email });

      const activeTokenRecord: RefreshTokenEntity = {
        id: 'token-1',
        userId: mockUser.id,
        tokenHash: authService.hashToken(rawRefreshToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 saat sonra
        isRevoked: false,
        createdAt: new Date(),
      };

      mockRefreshTokenRepo.findOne.mockResolvedValue(activeTokenRecord);
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const newTokens = await authService.refreshTokens(rawRefreshToken);

      expect(newTokens.accessToken).toBe('mocked-jwt-token');
      expect(newTokens.refreshToken).toBe('mocked-jwt-token');
      expect(activeTokenRecord.isRevoked).toBe(true);
      expect(activeTokenRecord.replacedByTokenHash).toBeDefined();
      expect(mockRefreshTokenRepo.save).toHaveBeenCalledWith(activeTokenRecord);
    });

    it('KRİTİK GÜVENLİK: İptal edilmiş token tekrar sunulursa (Reuse Detection) kullanıcının tüm oturumlarını sonlandırmalı', async () => {
      const compromisedToken = 'stolen-already-used-refresh-token';
      mockJwtService.verify.mockReturnValue({ sub: mockUser.id, email: mockUser.email });

      const alreadyRevokedRecord: RefreshTokenEntity = {
        id: 'token-revoked-1',
        userId: mockUser.id,
        tokenHash: authService.hashToken(compromisedToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        isRevoked: true, // Zaten kullanılmış / iptal edilmiş
        createdAt: new Date(),
      };

      mockRefreshTokenRepo.findOne.mockResolvedValue(alreadyRevokedRecord);

      await expect(authService.refreshTokens(compromisedToken)).rejects.toThrow(
        UnauthorizedException,
      );

      // Kullanıcının TÜM aktif oturumlarının iptal edildiğini doğrula
      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        { userId: mockUser.id, isRevoked: false },
        { isRevoked: true },
      );
    });
  });

  describe('Logout', () => {
    it('refresh token hashlenerek iptal (revoked) edilmeli', async () => {
      const rawToken = 'logout-refresh-token';
      const expectedHash = authService.hashToken(rawToken);

      await authService.logout(rawToken);

      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        { tokenHash: expectedHash, isRevoked: false },
        { isRevoked: true },
      );
    });
  });

  describe('User Public DTO (toUserResponse)', () => {
    it('hassas şifre hashini ve dahili detayları asla içermemeli', () => {
      const publicUser = authService.toUserResponse(mockUser);

      expect(publicUser.id).toBe(mockUser.id);
      expect(publicUser.email).toBe(mockUser.email);
      expect(publicUser.displayName).toBe(mockUser.displayName);
      expect(publicUser.role).toBe(UserRole.CITIZEN);
      expect(publicUser.reputationScore).toBe(10);
      expect((publicUser as any).passwordHash).toBeUndefined();
    });
  });
});
