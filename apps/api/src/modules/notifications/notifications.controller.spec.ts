import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationsController } from './notifications.controller';
import { DevicesController } from './devices.controller';
import { PushPlatform, UserRole } from '@sehir-nabiz/shared';

describe('Notifications & Devices Controllers (Unit Tests)', () => {
  let notifController: NotificationsController;
  let devicesController: DevicesController;
  let mockNotifService: any;

  const mockUser: any = {
    sub: 'user-uuid-1',
    email: 'user@example.com',
    role: UserRole.CITIZEN,
  };
  const mockReq: any = { user: mockUser };

  beforeEach(() => {
    mockNotifService = {
      getUserNotifications: vi.fn().mockResolvedValue({
        items: [],
        total: 0,
        unreadCount: 0,
      }),
      getUnreadCount: vi.fn().mockResolvedValue(2),
      markAsRead: vi.fn().mockResolvedValue({ id: 'notif-1', isRead: true }),
      markAllAsRead: vi.fn().mockResolvedValue({ affected: 5 }),
      getPreferences: vi.fn().mockResolvedValue({
        followedEvents: true,
        confirmedEvents: true,
        reportedEvents: true,
        nearbyEvents: false,
        systemNotifications: true,
        pushEnabled: true,
        inAppEnabled: true,
      }),
      updatePreferences: vi.fn().mockResolvedValue({
        followedEvents: true,
        confirmedEvents: true,
        reportedEvents: true,
        nearbyEvents: false,
        systemNotifications: true,
        pushEnabled: false,
        inAppEnabled: true,
      }),
      registerPushToken: vi.fn().mockResolvedValue({ id: 'token-uuid-1' }),
      deactivatePushToken: vi.fn().mockResolvedValue({ success: true }),
    };

    notifController = new NotificationsController(mockNotifService);
    devicesController = new DevicesController(mockNotifService);
  });

  describe('NotificationsController', () => {
    it('GET /notifications kullanıcının bildirimlerini dönmeli', async () => {
      const res = await notifController.getNotifications(mockReq, { limit: 10, unreadOnly: false });
      expect(mockNotifService.getUserNotifications).toHaveBeenCalledWith('user-uuid-1', { limit: 10, unreadOnly: false });
      expect(res.total).toBe(0);
    });

    it('GET /notifications/unread-count okunmamış sayısını dönmeli', async () => {
      const res = await notifController.getUnreadCount(mockReq);
      expect(res.unreadCount).toBe(2);
    });

    it('PATCH /notifications/:id/read bildirimi okundu işaretlemeli', async () => {
      const res = await notifController.markAsRead(mockReq, 'notif-1');
      expect(res.isRead).toBe(true);
      expect(mockNotifService.markAsRead).toHaveBeenCalledWith('user-uuid-1', 'notif-1');
    });

    it('PATCH /notifications/read-all tümünü okundu işaretlemeli', async () => {
      const res = await notifController.markAllAsRead(mockReq);
      expect(res.affected).toBe(5);
    });

    it('GET /notifications/preferences tercihleri dönmeli', async () => {
      const res = await notifController.getPreferences(mockReq);
      expect(res.pushEnabled).toBe(true);
    });

    it('PATCH /notifications/preferences tercihleri güncellemeli', async () => {
      const res = await notifController.updatePreferences(mockReq, { pushEnabled: false });
      expect(res.pushEnabled).toBe(false);
    });
  });

  describe('DevicesController', () => {
    it('POST /devices/push-token push token kaydetmeli', async () => {
      const res = await devicesController.registerPushToken(mockReq, {
        token: 'ExponentPushToken[device_token_sample]',
        platform: PushPlatform.ANDROID,
      });
      expect(res.success).toBe(true);
      expect(res.id).toBe('token-uuid-1');
    });

    it('DELETE /devices/push-token push tokenı pasifleştirmeli', async () => {
      const res = await devicesController.deactivatePushToken(mockReq, 'ExponentPushToken[device_token_sample]');
      expect(res.success).toBe(true);
    });
  });
});
