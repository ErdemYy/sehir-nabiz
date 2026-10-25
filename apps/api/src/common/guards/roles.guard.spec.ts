import { describe, it, expect, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@sehir-nabiz/shared';

describe('RolesGuard (Unit Tests)', () => {
  it('rol kısıtı yoksa geçişe izin vermeli', () => {
    const mockReflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    };
    const guard = new RolesGuard(mockReflector as any);

    const mockContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.CITIZEN } }),
      }),
    } as any;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('kullanıcının rolü eşleşiyorsa geçişe izin vermeli', () => {
    const mockReflector = {
      getAllAndOverride: vi.fn().mockReturnValue([UserRole.ADMIN, UserRole.MODERATOR]),
    };
    const guard = new RolesGuard(mockReflector as any);

    const mockContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.ADMIN } }),
      }),
    } as any;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('kullanıcının rolü yetersizse ForbiddenException fırlatmalı', () => {
    const mockReflector = {
      getAllAndOverride: vi.fn().mockReturnValue([UserRole.ADMIN]),
    };
    const guard = new RolesGuard(mockReflector as any);

    const mockContext = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.CITIZEN } }),
      }),
    } as any;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});
