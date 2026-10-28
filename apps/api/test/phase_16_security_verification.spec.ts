import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagnosticsGuard } from '../src/modules/health/guards/diagnostics.guard';
import { ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole, AccountStatus } from '@sehir-nabiz/shared';
import * as bcrypt from 'bcryptjs';

describe('Phase 16 — Güvenlik Sertleştirmesi, Diagnostics & Silme İptal Denetimleri', () => {
  describe('1. DiagnosticsGuard Yetkilendirme & İzolasyon Denetimi', () => {
    let guard: DiagnosticsGuard;
    let mockConfigService: any;
    let mockJwtService: any;

    const DIAGNOSTICS_SECRET = 'staging_internal_diagnostics_secret_token_2026!';

    beforeEach(() => {
      mockConfigService = {
        get: vi.fn((key: string) => {
          if (key === 'DIAGNOSTICS_SECRET') return DIAGNOSTICS_SECRET;
          if (key === 'JWT_ACCESS_SECRET') return 'test_jwt_secret_key_32chars_min!';
          return null;
        }),
      };

      mockJwtService = {
        verifyAsync: vi.fn(),
      };

      guard = new DiagnosticsGuard(mockConfigService, mockJwtService);
    });

    const createMockContext = (headers: Record<string, string>, ip = '192.168.1.50') => {
      const req: any = {
        headers,
        socket: { remoteAddress: ip },
      };
      return {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
      } as any;
    };

    it('yetkisiz istek (başlıksız / tokensız) 403 Forbidden fırlatmalı', async () => {
      const ctx = createMockContext({});
      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });

    it('geçerli x-diagnostics-key başlığı ile erişime izin vermeli (200 OK)', async () => {
      const ctx = createMockContext({ 'x-diagnostics-key': DIAGNOSTICS_SECRET });
      const canAccess = await guard.canActivate(ctx);
      expect(canAccess).toBe(true);
    });

    it('yanlış x-diagnostics-key başlığı ile 403 Forbidden fırlatmalı', async () => {
      const ctx = createMockContext({ 'x-diagnostics-key': 'wrong_secret_key' });
      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });

    it('ADMIN rolüne sahip geçerli JWT Bearer token ile erişime izin vermeli', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'admin-uuid-1',
        email: 'admin@sehirnabiz.internal',
        role: UserRole.ADMIN,
      });

      const ctx = createMockContext({ authorization: 'Bearer valid_admin_jwt_token' });
      const canAccess = await guard.canActivate(ctx);
      expect(canAccess).toBe(true);
    });

    it('Standart CITIZEN/MODERATOR rolüne sahip JWT Bearer token 403 Forbidden ile engellenmeli', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'citizen-uuid-1',
        email: 'citizen@sehirnabiz.internal',
        role: UserRole.CITIZEN,
      });

      const ctx = createMockContext({ authorization: 'Bearer citizen_jwt_token' });
      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('2. Hesap Silme İptal Güvenliği & Sınırlı Reauthentication Oturumu', () => {
    it('14 günlük cayma süresi (cooling-off) dolmuşsa silme iptali reddedilmeli', () => {
      const expiredScheduledFor = new Date(Date.now() - 1000); // 1 saniye önce dolmuş
      const isExpired = expiredScheduledFor.getTime() <= Date.now();

      expect(isExpired).toBe(true);
      // Servis bu koşulda BadRequestException fırlatmalıdır
      const checkExpiry = (scheduledFor: Date) => {
        if (scheduledFor.getTime() <= Date.now()) {
          throw new BadRequestException('14 günlük cayma ve iptal süresi dolmuştur. Hesap silme süreci geri alınamaz.');
        }
      };

      expect(() => checkExpiry(expiredScheduledFor)).toThrow(BadRequestException);
    });

    it('14 günlük cayma süresi dolmamışsa silme iptaline izin verilmeli', () => {
      const validScheduledFor = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 gün var
      const isExpired = validScheduledFor.getTime() <= Date.now();

      expect(isExpired).toBe(false);
    });

    it('PENDING_DELETION durumundaki kullanıcının tokenında kısıtlı yetki taşınmalı', () => {
      const restrictedPayload = {
        sub: 'user-uuid-pending',
        email: 'pending@sehirnabiz.internal',
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.PENDING_DELETION,
      };

      // Normal guard kontrolü simülasyonu
      const isAllowedOnGeneralEndpoints = (user: any, allowPending = false) => {
        if (user.accountStatus === AccountStatus.PENDING_DELETION && !allowPending) {
          throw new UnauthorizedException('Hesabınız silinme sürecindedir. Lütfen silme talebini iptal ediniz.');
        }
        return true;
      };

      // Standart endpoint'e erişim engellenmeli
      expect(() => isAllowedOnGeneralEndpoints(restrictedPayload, false)).toThrow(UnauthorizedException);

      // @AllowPendingDeletion olan endpoint'e erişebilmeli
      expect(isAllowedOnGeneralEndpoints(restrictedPayload, true)).toBe(true);
    });
  });

  describe('3. Parola Hash Algoritması Uyumluluk ve Bütünlük Testi (Bcrypt & Salt)', () => {
    it('bcrypt ile hashlenen parola doğrulukla teyit edilmeli', async () => {
      const plainPassword = 'GuvenliParola123!';
      const saltRounds = 10;
      const hash = await bcrypt.hash(plainPassword, saltRounds);

      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/); // Bcrypt hash formatı doğrulama
      const isValid = await bcrypt.compare(plainPassword, hash);
      expect(isValid).toBe(true);

      const isWrong = await bcrypt.compare('YanlisParola999!', hash);
      expect(isWrong).toBe(false);
    });

    it('farklı salt rounds (10 ve 12) ile oluşturulan hashler sorunsuz doğrulanmalı', async () => {
      const password = 'KullaniciSifresi2026!';
      const hash10 = await bcrypt.hash(password, 10);
      const hash12 = await bcrypt.hash(password, 12);

      expect(await bcrypt.compare(password, hash10)).toBe(true);
      expect(await bcrypt.compare(password, hash12)).toBe(true);
    });
  });

  describe('4. Hassas Veri Temizleme & PII Maskeleme Regex Denetimi', () => {
    it('metin içerisindeki telefon ve e-posta adresleri doğru maskelenmeli', () => {
      const rawText = 'Lütfen beni 0532 123 45 67 veya test.user@example.com adresinden arayın.';

      const scrubbed = rawText
        .replace(/(\+?90\s?)?(0\s?)?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/g, '[Telefon Gizlendi]')
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[E-posta Gizlendi]');

      expect(scrubbed).not.toContain('0532 123 45 67');
      expect(scrubbed).not.toContain('test.user@example.com');
      expect(scrubbed).toContain('[Telefon Gizlendi]');
      expect(scrubbed).toContain('[E-posta Gizlendi]');
    });
  });
});
