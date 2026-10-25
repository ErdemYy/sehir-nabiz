import { describe, it, expect, vi } from 'vitest';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthRateLimitGuard } from './rate-limit.guard';

describe('Auth Guards (Unit Tests)', () => {
  describe('JwtAuthGuard', () => {
    const guard = new JwtAuthGuard();

    it('kullanıcı varsa nesneyi döndürmeli', () => {
      const user = { sub: '123', email: 'test@example.com' };
      expect(guard.handleRequest(null, user)).toEqual(user);
    });

    it('kullanıcı yoksa UnauthorizedException fırlatmalı', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });

    it('hata varsa UnauthorizedException fırlatmalı', () => {
      expect(() => guard.handleRequest(new Error('Jwt Error'), null)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('AuthRateLimitGuard', () => {
    it('limit aşılmadığında geçişe izin vermeli', async () => {
      const mockRedisService = {
        checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9 }),
      };
      const guard = new AuthRateLimitGuard(mockRedisService as any);

      const mockResponse = { setHeader: vi.fn() };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: {}, ip: '127.0.0.1', route: { path: '/auth/login' } }),
          getResponse: () => mockResponse,
        }),
      } as any;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 9);
    });

    it('limit aşıldığında 429 TooManyRequests fırlatmalı', async () => {
      const mockRedisService = {
        checkRateLimit: vi.fn().mockResolvedValue({ allowed: false, remaining: 0 }),
      };
      const guard = new AuthRateLimitGuard(mockRedisService as any);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: {}, ip: '127.0.0.1', route: { path: '/auth/login' } }),
          getResponse: () => ({ setHeader: vi.fn() }),
        }),
      } as any;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(HttpException);
    });
  });
});
