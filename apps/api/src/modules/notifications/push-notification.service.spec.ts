import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PushNotificationService } from './push-notification.service';
import { ConfigService } from '@nestjs/config';

describe('PushNotificationService (Unit Tests)', () => {
  let service: PushNotificationService;
  let mockPushTokenRepo: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockPushTokenRepo = {
      createQueryBuilder: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 1 }),
      }),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'EXPO_ACCESS_TOKEN') return undefined;
        return undefined;
      }),
    };

    service = new PushNotificationService(mockPushTokenRepo, mockConfigService as ConfigService);
  });

  describe('Push Token Format Doğrulama', () => {
    it('geçerli ExponentPushToken formatını doğrulamalı', () => {
      expect(
        service.isValidExpoPushToken('ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'),
      ).toBe(true);
      expect(
        service.isValidExpoPushToken('ExpoPushToken[xxxxxxxxxxxxxxxxxxxxxx]'),
      ).toBe(true);
    });

    it('geçersiz formatlı tokenları reddetmeli', () => {
      expect(service.isValidExpoPushToken('')).toBe(false);
      expect(service.isValidExpoPushToken('invalid-token')).toBe(false);
      expect(service.isValidExpoPushToken('12345')).toBe(false);
    });
  });

  describe('Geliştirme / Test Ortamı Kontrollü Simülasyon Adaptörü', () => {
    it('üretim dışı ortamda gerçek dış ağ araması yapmadan kontrollü simülasyon sonucu dönmeli', async () => {
      const result = await service.sendPushNotifications(
        ['ExponentPushToken[valid_test_token_12345678]'],
        'Test Başlık',
        'Test Gövde',
        { eventId: '123' },
      );

      expect(result.isSimulated).toBe(true);
      expect(result.sentCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(result.invalidTokens).toHaveLength(0);
    });

    it('boş token listesinde hiçbir işlem yapmadan sıfır dönmeli', async () => {
      const result = await service.sendPushNotifications([], 'Başlık', 'Gövde');
      expect(result.sentCount).toBe(0);
      expect(result.failedCount).toBe(0);
      expect(result.isSimulated).toBe(false);
    });

    it('hatalı tokenları tespit edip veritabanında pasife çekmeli', async () => {
      const result = await service.sendPushNotifications(
        ['invalid_token_format', 'ExponentPushToken[valid_one_123456789]'],
        'Başlık',
        'Gövde',
      );

      expect(mockPushTokenRepo.createQueryBuilder).toHaveBeenCalled();
      expect(result.sentCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.invalidTokens).toContain('invalid_token_format');
    });
  });
});
