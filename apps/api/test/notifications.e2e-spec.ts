import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import * as net from 'net';
import * as bcrypt from 'bcryptjs';
import { dataSourceOptions } from '../src/database/data-source';
import { NotificationsService } from '../src/modules/notifications/notifications.service';
import { PushNotificationService } from '../src/modules/notifications/push-notification.service';
import { UserNotificationEntity } from '../src/database/entities/user-notification.entity';
import { DevicePushTokenEntity } from '../src/database/entities/device-push-token.entity';
import { UserNotificationPreferenceEntity } from '../src/database/entities/user-notification-preference.entity';
import { UserEntity } from '../src/database/entities/user.entity';
import {
  UserRole,
  AccountStatus,
  NotificationType,
  PushPlatform,
} from '@sehir-nabiz/shared';
import { ConfigService } from '@nestjs/config';

async function isPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

describe('Akıllı Bildirimler & Push Altyapısı Canlı Entegrasyon Testleri (E2E)', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5434', 10);

  const isPostgresUp = await isPortOpen(host, port);
  if (!isPostgresUp) {
    it.skip(`PostgreSQL servisi (${host}:${port}) kapalı: Testler atlandı.`, () => {});
    return;
  }

  let dataSource: DataSource;
  let notificationsService: NotificationsService;
  let pushService: PushNotificationService;

  let testUser: UserEntity;

  beforeAll(async () => {
    dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();

    const userRepo = dataSource.getRepository(UserEntity);
    const notifRepo = dataSource.getRepository(UserNotificationEntity);
    const tokenRepo = dataSource.getRepository(DevicePushTokenEntity);
    const prefRepo = dataSource.getRepository(UserNotificationPreferenceEntity);

    const configService = new ConfigService({
      NODE_ENV: 'test',
    });

    pushService = new PushNotificationService(tokenRepo, configService);

    const mockRealtimeService: any = {
      sendNotificationToUser: () => {},
    };

    notificationsService = new NotificationsService(
      notifRepo,
      tokenRepo,
      prefRepo,
      mockRealtimeService,
      pushService,
    );

    // Test kullanıcısı oluştur
    const hash = await bcrypt.hash('GuvenliSifre.123', 10);
    testUser = await userRepo.save(
      userRepo.create({
        email: `notif_user_${Date.now()}@example.com`,
        displayName: 'Bildirim Test Kullanıcısı',
        passwordHash: hash,
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
        reputationScore: 10,
      }),
    );
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      if (testUser) {
        await dataSource.getRepository(UserEntity).delete({ id: testUser.id });
      }
      await dataSource.destroy();
    }
  });

  it('1. Kullanıcının başlangıçta hiç bildirimi olmamalı (unreadCount = 0)', async () => {
    const count = await notificationsService.getUnreadCount(testUser.id);
    expect(count).toBe(0);

    const res = await notificationsService.getUserNotifications(testUser.id, {
      limit: 10,
      unreadOnly: false,
    });
    expect(res.items).toHaveLength(0);
    expect(res.total).toBe(0);
  });

  it('2. Device Push Token kaydetmeli ve aktif olarak işaretlemeli', async () => {
    const token = await notificationsService.registerPushToken(testUser.id, {
      token: 'ExponentPushToken[e2e_test_token_sample_12345]',
      platform: PushPlatform.ANDROID,
      deviceIdentifier: 'android-hw-sha256-hash',
    });

    expect(token).toBeDefined();
    expect(token.id).toBeDefined();
    expect(token.isActive).toBe(true);
    expect(token.token).toBe('ExponentPushToken[e2e_test_token_sample_12345]');
  });

  it('3. Yeni bildirim üretildiğinde veritabanına kaydedilmeli ve unreadCount artmalı', async () => {
    const notif = await notificationsService.createNotification({
      userId: testUser.id,
      type: NotificationType.EVENT_APPROVED,
      title: 'Bildiriminiz onaylandı',
      body: 'Atatürk Bulvarı trafik bildirimi onaylandı.',
    });

    expect(notif).toBeDefined();
    expect(notif?.title).toBe('Bildiriminiz onaylandı');
    expect(notif?.isRead).toBe(false);

    const unread = await notificationsService.getUnreadCount(testUser.id);
    expect(unread).toBe(1);
  });

  it('4. Tekil bildirim okundu olarak işaretlenebilmeli (isRead: true)', async () => {
    const list = await notificationsService.getUserNotifications(testUser.id, {
      limit: 10,
      unreadOnly: true,
    });
    expect(list.items.length).toBeGreaterThan(0);

    const notifId = list.items[0]?.id;
    expect(notifId).toBeDefined();
    const updated = await notificationsService.markAsRead(testUser.id, notifId!);

    expect(updated.isRead).toBe(true);
    expect(updated.readAt).not.toBeNull();

    const unread = await notificationsService.getUnreadCount(testUser.id);
    expect(unread).toBe(0);
  });

  it('5. Bildirim tercihleri varsayılan olarak yakındaki gelişmeleri kapalı tutmalı (Gizlilik)', async () => {
    const prefs = await notificationsService.getPreferences(testUser.id);
    expect(prefs.nearbyEvents).toBe(false);
    expect(prefs.pushEnabled).toBe(true);
    expect(prefs.inAppEnabled).toBe(true);

    const updated = await notificationsService.updatePreferences(testUser.id, {
      pushEnabled: false,
    });
    expect(updated.pushEnabled).toBe(false);
  });

  it('6. Push token pasifleştirilebilmeli (Oturum çıkışı)', async () => {
    const res = await notificationsService.deactivatePushToken(
      testUser.id,
      'ExponentPushToken[e2e_test_token_sample_12345]',
    );
    expect(res.success).toBe(true);

    const tokenInDb = await dataSource
      .getRepository(DevicePushTokenEntity)
      .findOne({
        where: { token: 'ExponentPushToken[e2e_test_token_sample_12345]' },
      });
    expect(tokenInDb?.isActive).toBe(false);
  });

  it('7. Çoklu bildirimler toplu olarak okundu işaretlenebilmeli (markAllAsRead)', async () => {
    await notificationsService.createNotification({
      userId: testUser.id,
      type: NotificationType.SYSTEM,
      title: 'Sistem Bakımı',
      body: 'Bu gece 03:00 - 04:00 arası kısa süreli bakım planlandı.',
    });

    const unreadBefore = await notificationsService.getUnreadCount(testUser.id);
    expect(unreadBefore).toBe(1);

    const res = await notificationsService.markAllAsRead(testUser.id);
    expect(res.affected).toBe(1);

    const unreadAfter = await notificationsService.getUnreadCount(testUser.id);
    expect(unreadAfter).toBe(0);
  });
});
