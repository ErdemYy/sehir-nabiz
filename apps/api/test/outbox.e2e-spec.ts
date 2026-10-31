import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import * as net from 'net';
import * as bcrypt from 'bcryptjs';
import { dataSourceOptions } from '../src/database/data-source';
import { OutboxService } from '../src/modules/outbox/outbox.service';
import { OutboxProcessorService } from '../src/modules/outbox/outbox-processor.service';
import { NotificationsService } from '../src/modules/notifications/notifications.service';
import { PushNotificationService } from '../src/modules/notifications/push-notification.service';
import { UserNotificationEntity } from '../src/database/entities/user-notification.entity';
import { DevicePushTokenEntity } from '../src/database/entities/device-push-token.entity';
import { UserNotificationPreferenceEntity } from '../src/database/entities/user-notification-preference.entity';
import { UserEntity } from '../src/database/entities/user.entity';
import { EventEntity } from '../src/database/entities/event.entity';
import { CategoryEntity } from '../src/database/entities/category.entity';
import {
  UserRole,
  AccountStatus,
  EventStatus,
  EventSeverity,
  OutboxStatus,
  NotificationType,
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

describe('Phase 11: Transactional Outbox, Idempotency & Search Security (E2E)', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5434', 10);

  const isPostgresUp = await isPortOpen(host, port);
  if (!isPostgresUp) {
    it.skip(`PostgreSQL servisi (${host}:${port}) kapalı: Testler atlandı.`, () => {});
    return;
  }

  let dataSource: DataSource;
  let outboxService: OutboxService;
  let outboxProcessor: OutboxProcessorService;
  let notificationsService: NotificationsService;
  let testUser: UserEntity;
  let testCategory: CategoryEntity;

  beforeAll(async () => {
    dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();

    // Varsa önceki test kalıntılarını temizle
    await dataSource.query(`DELETE FROM outbox_events WHERE last_error IS NOT NULL`);

    const userRepo = dataSource.getRepository(UserEntity);
    const categoryRepo = dataSource.getRepository(CategoryEntity);
    const notifRepo = dataSource.getRepository(UserNotificationEntity);
    const prefRepo = dataSource.getRepository(UserNotificationPreferenceEntity);
    const pushRepo = dataSource.getRepository(DevicePushTokenEntity);

    // Mock ConfigService
    const mockConfigService = {
      get: (key: string) => {
        if (key === 'NODE_ENV') return 'test';
        return undefined;
      },
    } as unknown as ConfigService;

    const pushService = new PushNotificationService(pushRepo, mockConfigService);
    notificationsService = new NotificationsService(
      notifRepo,
      pushRepo,
      prefRepo,
      undefined as any,
      pushService,
    );
    outboxService = new OutboxService();
    outboxProcessor = new OutboxProcessorService(
      dataSource,
      undefined,
      notificationsService,
      undefined,
    );

    // Test kullanıcısı oluştur
    const email = `outbox-test-${Date.now()}@sehirnabiz.local`;
    testUser = await userRepo.save(
      userRepo.create({
        email,
        passwordHash: await bcrypt.hash('Secret123!', 10),
        displayName: 'Outbox Test Vatandaşı',
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
        reputationScore: 20,
      }),
    );

    // Test kategorisi oluştur
    testCategory = await categoryRepo.findOne({ where: { code: 'TRAFFIC' } }) as CategoryEntity;
    if (!testCategory) {
      testCategory = await categoryRepo.save(
        categoryRepo.create({
          code: 'TRAFFIC',
          nameTr: 'Trafik Yoğunluğu',
          descriptionTr: 'Yol ve kavşak yoğunluğu',
          icon: 'traffic-cone',
          colorHex: '#EA580C',
          defaultDurationHours: 3,
          isActive: true,
        }),
      );
    }
  });

  afterAll(async () => {
    outboxProcessor.stopWorker();
    if (dataSource && dataSource.isInitialized) {
      // Temizlik
      await dataSource.query(`DELETE FROM user_notifications WHERE "userId" = $1`, [testUser.id]);
      await dataSource.query(`DELETE FROM outbox_events WHERE aggregate_id IN (SELECT id FROM events WHERE "authorId" = $1)`, [testUser.id]);
      await dataSource.query(`DELETE FROM events WHERE "authorId" = $1`, [testUser.id]);
      await dataSource.query(`DELETE FROM users WHERE id = $1`, [testUser.id]);
      await dataSource.destroy();
    }
  });

  it('1. Transaction Atomicity: Başarılı transaction hem olayı hem outbox kaydını birlikte kaydetmeli', async () => {
    let createdEventId: string = '';

    await dataSource.transaction(async manager => {
      const insertRes = await manager.query(
        `
        INSERT INTO "events" (
          "authorId", "categoryId", "title", "description", "severity", "status",
          "location", "addressText", "city", "district", "expiresAt", "isDemo",
          "confirmationCount", "denialCount", "reliabilityScore", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          ST_SetSRID(ST_MakePoint($7, $8), 4326),
          $9, $10, $11, $12, false,
          0, 0, 1.0, NOW(), NOW()
        )
        RETURNING id;
        `,
        [
          testUser.id,
          testCategory.id,
          'Outbox Atomik Test Olayı',
          'Açıklama',
          EventSeverity.MEDIUM,
          EventStatus.PENDING_REVIEW,
          35.48,
          38.72,
          'Cumhuriyet Meydanı',
          'Kayseri',
          'Melikgazi',
          new Date(Date.now() + 3600000),
        ],
      );

      createdEventId = insertRes[0].id;

      await outboxService.createOutboxEvent(
        manager,
        'Event',
        createdEventId,
        'EVENT_CREATED',
        {
          eventId: createdEventId,
          authorId: testUser.id,
          title: 'Outbox Atomik Test Olayı',
        },
      );
    });

    // İki kaydın da var olduğunu doğrula
    const eventInDb = await dataSource.getRepository(EventEntity).findOne({ where: { id: createdEventId } });
    expect(eventInDb).toBeDefined();
    expect(eventInDb?.title).toBe('Outbox Atomik Test Olayı');

    const outboxRows = await dataSource.query(
      `SELECT * FROM outbox_events WHERE aggregate_id = $1`,
      [createdEventId],
    );
    expect(outboxRows).toHaveLength(1);
    expect(outboxRows[0].event_type).toBe('EVENT_CREATED');
    expect(outboxRows[0].status).toBe(OutboxStatus.PENDING);
  });

  it('2. Transaction Rollback: Transaction hata aldığında ne olay ne de outbox kaydı kalmamalı', async () => {
    let failedEventId: string = '';

    const executeFailingTransaction = async () => {
      await dataSource.transaction(async manager => {
        const insertRes = await manager.query(
          `
          INSERT INTO "events" (
            "authorId", "categoryId", "title", "description", "severity", "status",
            "location", "addressText", "city", "district", "expiresAt", "isDemo",
            "confirmationCount", "denialCount", "reliabilityScore", "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            ST_SetSRID(ST_MakePoint($7, $8), 4326),
            $9, $10, $11, $12, false,
            0, 0, 1.0, NOW(), NOW()
          )
          RETURNING id;
          `,
          [
            testUser.id,
            testCategory.id,
            'Rollback Test Olayı',
            'Açıklama',
            EventSeverity.MEDIUM,
            EventStatus.PENDING_REVIEW,
            35.48,
            38.72,
            'Meydan',
            'Kayseri',
            'Melikgazi',
            new Date(Date.now() + 3600000),
          ],
        );

        failedEventId = insertRes[0].id;

        await outboxService.createOutboxEvent(
          manager,
          'Event',
          failedEventId,
          'EVENT_CREATED',
          { eventId: failedEventId, title: 'Rollback Test Olayı' },
        );

        // Kasıtlı hata fırlatarak rollback'i tetikle
        throw new Error('Kasıtlı işlem kesintisi (Simüle edilmiş çökme)');
      });
    };

    await expect(executeFailingTransaction()).rejects.toThrow('Kasıtlı işlem kesintisi');

    // Rollback sonrası iki kaydın da OLMADIĞINI doğrula
    const eventInDb = await dataSource.getRepository(EventEntity).findOne({ where: { id: failedEventId } });
    expect(eventInDb).toBeNull();

    const outboxRows = await dataSource.query(
      `SELECT * FROM outbox_events WHERE aggregate_id = $1`,
      [failedEventId],
    );
    expect(outboxRows).toHaveLength(0);
  });

  it('3. Outbox Processor: FOR UPDATE SKIP LOCKED ile kayıt claim edip başarıyla PROCESSED yapmalı', async () => {
    // Gerçek bir olay ve outbox kaydı ekle
    let testOutboxId: string = '';
    await dataSource.transaction(async manager => {
      const insertRes = await manager.query(
        `
        INSERT INTO "events" (
          "authorId", "categoryId", "title", "description", "severity", "status",
          "location", "addressText", "city", "district", "expiresAt", "isDemo",
          "confirmationCount", "denialCount", "reliabilityScore", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          ST_SetSRID(ST_MakePoint($7, $8), 4326),
          $9, $10, $11, $12, false,
          0, 0, 1.0, NOW(), NOW()
        )
        RETURNING id;
        `,
        [
          testUser.id,
          testCategory.id,
          'İşleme Test Olayı',
          'Açıklama',
          EventSeverity.MEDIUM,
          EventStatus.ACTIVE,
          35.48,
          38.72,
          'Meydan',
          'Kayseri',
          'Melikgazi',
          new Date(Date.now() + 3600000),
        ],
      );

      const realEventId = insertRes[0].id;

      const saved = await outboxService.createOutboxEvent(
        manager,
        'Event',
        realEventId,
        'EVENT_STATUS_CHANGED',
        {
          eventId: realEventId,
          newStatus: EventStatus.ACTIVE,
          authorId: testUser.id,
          title: 'İşleme Test Olayı',
        },
      );
      testOutboxId = saved.id;
    });

    // Processor'ı manuel bir tur çalıştır
    let processedCount = await outboxProcessor.processBatch();
    if (processedCount === 0) {
      await new Promise(r => setTimeout(r, 150));
      processedCount = await outboxProcessor.processBatch();
    }
    expect(processedCount).toBeGreaterThanOrEqual(1);

    // Durumunun PROCESSED olduğunu ve processed_at alanının dolduğunu doğrula
    const updatedRows = await dataSource.query(
      `SELECT status, processed_at, attempts FROM outbox_events WHERE id = $1`,
      [testOutboxId],
    );

    expect(updatedRows[0].status).toBe(OutboxStatus.PROCESSED);
    expect(updatedRows[0].processed_at).not.toBeNull();
    expect(updatedRows[0].attempts).toBe(1);
  });

  it('4. Consumer Idempotency: Aynı idempotencyKey ile gelen mükerrer bildirim kaydı oluşmamalı', async () => {
    const key = `idempotency:test:${Date.now()}`;

    // 1. Yazma
    const notif1 = await notificationsService.createNotification({
      userId: testUser.id,
      type: NotificationType.EVENT_APPROVED,
      title: 'İdempotent Başlık 1',
      body: 'Gövde',
      idempotencyKey: key,
    });

    expect(notif1).toBeDefined();

    // 2. Aynı anahtarla 2. Yazma (Yarış koşulu veya mükerrer outbox teslimatı)
    const notif2 = await notificationsService.createNotification({
      userId: testUser.id,
      type: NotificationType.EVENT_APPROVED,
      title: 'İdempotent Başlık 2',
      body: 'Gövde',
      idempotencyKey: key,
    });

    expect(notif2).toBeDefined();
    expect(notif2?.id).toBe(notif1?.id); // Aynı kayıt dönmeli

    // DB'de gerçekten yalnızca 1 kayıt olduğunu doğrula
    const count = await dataSource.getRepository(UserNotificationEntity).count({
      where: { idempotencyKey: key },
    });
    expect(count).toBe(1);
  });

  it('5. PostgreSQL unaccent Türkçe Karakter Duyarsız Arama Testi', async () => {
    // unaccent fonksiyonunun aktif olduğunu doğrula
    const unaccentTest = await dataSource.query(`
      SELECT 
        unaccent('ışık') AS isik,
        unaccent('İNCESU') AS incesu,
        unaccent('ŞEHİR') AS sehir,
        unaccent('ÇOCUK') AS cocuk,
        unaccent('ÖĞRENCİ') AS ogrenci;
    `);

    expect(unaccentTest[0].isik).toBe('isik');
    expect(unaccentTest[0].sehir).toBe('SEHIR');
    expect(unaccentTest[0].cocuk).toBe('COCUK');

    // LOWER + unaccent ile Türkçe eşleşme testi
    const matchTest = await dataSource.query(`
      SELECT (unaccent(LOWER('IŞIK')) ILIKE unaccent(LOWER('%ışık%'))) AS matched;
    `);

    expect(matchTest[0].matched).toBe(true);
  });
});
