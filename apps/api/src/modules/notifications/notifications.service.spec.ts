import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationsService } from './notifications.service';
import { NotificationType, PushPlatform } from '@sehir-nabiz/shared';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService (Unit Tests)', () => {
  let service: NotificationsService;
  let mockNotificationRepo: any;
  let mockPushTokenRepo: any;
  let mockPreferenceRepo: any;
  let mockRealtimeService: any;
  let mockPushNotificationService: any;

  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockNotificationRepo = {
      createQueryBuilder: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([
          {
            id: 'notif-1',
            userId: mockUserId,
            type: NotificationType.EVENT_APPROVED,
            title: 'Bildiriminiz yayınlandı',
            body: 'Olay yayında',
            eventId: 'event-1',
            readAt: null,
            createdAt: new Date(),
            expiresAt: null,
          },
        ]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 3 }),
        getOne: vi.fn().mockResolvedValue(null),
      }),
      count: vi.fn().mockResolvedValue(1),
      findOne: vi.fn(),
      save: vi.fn().mockImplementation(item => Promise.resolve({ ...item, id: item.id || 'new-notif-id' })),
      create: vi.fn().mockImplementation(item => ({ ...item, createdAt: new Date() })),
    };

    mockPushTokenRepo = {
      findOne: vi.fn(),
      create: vi.fn().mockImplementation(item => ({ ...item, id: 'token-id' })),
      save: vi.fn().mockImplementation(item => Promise.resolve(item)),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      find: vi.fn().mockResolvedValue([{ token: 'ExponentPushToken[mock_token_12345]' }]),
    };

    mockPreferenceRepo = {
      findOne: vi.fn().mockResolvedValue({
        id: 'pref-1',
        userId: mockUserId,
        followedEvents: true,
        confirmedEvents: true,
        reportedEvents: true,
        nearbyEvents: false,
        systemNotifications: true,
        pushEnabled: true,
        inAppEnabled: true,
      }),
      create: vi.fn().mockImplementation(item => item),
      save: vi.fn().mockImplementation(item => Promise.resolve(item)),
    };

    mockRealtimeService = {
      sendNotificationToUser: vi.fn(),
    };

    mockPushNotificationService = {
      sendPushNotifications: vi.fn().mockResolvedValue({ sentCount: 1, failedCount: 0 }),
    };

    service = new NotificationsService(
      mockNotificationRepo,
      mockPushTokenRepo,
      mockPreferenceRepo,
      mockRealtimeService,
      mockPushNotificationService,
    );
  });

  describe('Bildirimleri Listeleme ve Sayfalama', () => {
    it('kullanıcının bildirimlerini başarıyla dönmeli', async () => {
      const result = await service.getUserNotifications(mockUserId, {
        limit: 10,
        unreadOnly: false,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe('notif-1');
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(1);
    });
  });

  describe('Okundu İşlemleri (Idempotency)', () => {
    it('tekil bildirimi okundu olarak işaretlemeli', async () => {
      mockNotificationRepo.findOne.mockResolvedValue({
        id: 'notif-1',
        userId: mockUserId,
        type: NotificationType.EVENT_APPROVED,
        title: 'Başlık',
        body: 'Gövde',
        readAt: null,
        createdAt: new Date(),
      });

      const result = await service.markAsRead(mockUserId, 'notif-1');
      expect(result.isRead).toBe(true);
      expect(mockNotificationRepo.save).toHaveBeenCalled();
    });

    it('zaten okunmuş bildirimi tekrar işaretlediğinde hata vermemeli (idempotent)', async () => {
      const existingDate = new Date();
      mockNotificationRepo.findOne.mockResolvedValue({
        id: 'notif-1',
        userId: mockUserId,
        type: NotificationType.EVENT_APPROVED,
        title: 'Başlık',
        body: 'Gövde',
        readAt: existingDate,
        createdAt: new Date(),
      });

      const result = await service.markAsRead(mockUserId, 'notif-1');
      expect(result.isRead).toBe(true);
      expect(mockNotificationRepo.save).not.toHaveBeenCalled();
    });

    it('olmayan bildirim için NotFoundException fırlatmalı', async () => {
      mockNotificationRepo.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(mockUserId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('tüm bildirimleri toplu olarak okundu işaretlemeli', async () => {
      const result = await service.markAllAsRead(mockUserId);
      expect(result.affected).toBe(3);
    });
  });

  describe('Bildirim Üretme ve Dağıtım (WebSocket + Push)', () => {
    it('tercihler izin verdiğinde hem realtime hem push bildirim iletmeli', async () => {
      const notif = await service.createNotification({
        userId: mockUserId,
        type: NotificationType.EVENT_APPROVED,
        title: 'Bildiriminiz onaylandı',
        body: 'Olayınız haritada gösteriliyor.',
        eventId: 'event-uuid-1',
      });

      expect(notif).toBeDefined();
      expect(mockRealtimeService.sendNotificationToUser).toHaveBeenCalled();
      expect(mockPushNotificationService.sendPushNotifications).toHaveBeenCalled();
    });

    it('kullanıcı in-app bildirimleri kapattıysa realtime iletimi yapmamalı', async () => {
      mockPreferenceRepo.findOne.mockResolvedValue({
        id: 'pref-1',
        userId: mockUserId,
        followedEvents: true,
        confirmedEvents: true,
        reportedEvents: true,
        nearbyEvents: false,
        systemNotifications: true,
        pushEnabled: true,
        inAppEnabled: false, // In-app kapalı
      });

      await service.createNotification({
        userId: mockUserId,
        type: NotificationType.EVENT_APPROVED,
        title: 'Başlık',
        body: 'Gövde',
      });

      expect(mockRealtimeService.sendNotificationToUser).not.toHaveBeenCalled();
      expect(mockPushNotificationService.sendPushNotifications).toHaveBeenCalled();
    });
  });

  describe('Cihaz Push Token Yönetimi', () => {
    it('yeni push tokenı başarıyla kaydetmeli', async () => {
      mockPushTokenRepo.findOne.mockResolvedValue(null);

      const token = await service.registerPushToken(mockUserId, {
        token: 'ExponentPushToken[fresh_token_123456789]',
        platform: PushPlatform.ANDROID,
      });

      expect(token).toBeDefined();
      expect(mockPushTokenRepo.create).toHaveBeenCalled();
      expect(mockPushTokenRepo.save).toHaveBeenCalled();
    });

    it('mevcut tokenı güncelleyip aktif etmeli', async () => {
      mockPushTokenRepo.findOne.mockResolvedValue({
        id: 'token-1',
        token: 'ExponentPushToken[existing_token_123]',
        isActive: false,
      });

      const token = await service.registerPushToken(mockUserId, {
        token: 'ExponentPushToken[existing_token_123]',
        platform: PushPlatform.IOS,
      });

      expect(token.isActive).toBe(true);
      expect(mockPushTokenRepo.save).toHaveBeenCalled();
    });

    it('tokenı pasifleştirebilmeli (oturum çıkışı)', async () => {
      const result = await service.deactivatePushToken(mockUserId, 'ExponentPushToken[existing]');
      expect(result.success).toBe(true);
      expect(mockPushTokenRepo.update).toHaveBeenCalledWith(
        { userId: mockUserId, token: 'ExponentPushToken[existing]' },
        { isActive: false },
      );
    });
  });

  describe('Bildirim Tercihleri', () => {
    it('varsayılan tercihlerde yakınımdaki gelişmeler kapalı olmalı (gizlilik)', async () => {
      mockPreferenceRepo.findOne.mockResolvedValue(null);

      const prefs = await service.getPreferences(mockUserId);
      expect(prefs.nearbyEvents).toBe(false);
      expect(prefs.followedEvents).toBe(true);
      expect(prefs.pushEnabled).toBe(true);
    });

    it('tercihleri güncelleyebilmeli', async () => {
      const updated = await service.updatePreferences(mockUserId, {
        pushEnabled: false,
        nearbyEvents: true,
      });

      expect(updated.pushEnabled).toBe(false);
      expect(updated.nearbyEvents).toBe(true);
      expect(mockPreferenceRepo.save).toHaveBeenCalled();
    });
  });
});
