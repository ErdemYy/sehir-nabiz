import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import * as net from 'net';
import * as bcrypt from 'bcryptjs';
import { dataSourceOptions } from '../src/database/data-source';
import {
  UserEntity,
  CategoryEntity,
  EventMediaEntity,
  OutboxEventEntity,
  AccountDeletionRequestEntity,
  DevicePushTokenEntity,
} from '../src/database/entities';
import {
  UserRole,
  AccountStatus,
  DeletionRequestStatus,
  MediaStatus,
} from '@sehir-nabiz/shared';

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

describe('Staging Veritabanı, Sıfırdan Migration ve Veri Yaşam Döngüsü Denetimi', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5434', 10);

  const isPostgresUp = await isPortOpen(host, port);
  if (!isPostgresUp) {
    it.skip(`PostgreSQL servisi (${host}:${port}) kapalı: Staging testi atlandı.`, () => {});
    return;
  }

  let dataSource: DataSource;
  const cleanupUserIds: string[] = [];

  beforeAll(async () => {
    dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      for (const uid of cleanupUserIds) {
        try {
          await dataSource.query(`DELETE FROM "account_deletion_requests" WHERE "userId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "outbox_events" WHERE "payload"->>'userId' = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "device_push_tokens" WHERE "userId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "event_media" WHERE "uploadedById" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "events" WHERE "authorId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "users" WHERE "id" = $1;`, [uid]);
        } catch {
          // ignore
        }
      }
      await dataSource.destroy();
    }
  });

  it('1. Migration sıralaması deterministik ve eksiksiz olmalı (7 Adet Migration)', () => {
    const migrations = dataSource.migrations;
    expect(migrations.length).toBe(7);

    // Zaman damgası sıralamasını denetle
    const timestamps: number[] = migrations.map(m => {
      const name = m.name || '';
      const match = name.match(/\d{13}/);
      return match ? parseInt(match[0], 10) : 0;
    });

    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeLessThan(timestamps[i + 1]!);
    }
  });

  it('2. Tüm zorunlu çekirdek tablolar veritabanında mevcut olmalı', async () => {
    const requiredTables = [
      'users',
      'refresh_tokens',
      'categories',
      'events',
      'event_moderation_logs',
      'event_media',
      'event_feedbacks',
      'user_reputation_logs',
      'user_notifications',
      'device_push_tokens',
      'user_notification_preferences',
      'outbox_events',
      'account_deletion_requests',
    ];

    for (const tableName of requiredTables) {
      const result = await dataSource.query(
        `SELECT to_regclass('public."${tableName}"') as table_name;`,
      );
      expect(result[0]?.table_name).toBeDefined();
      expect(result[0]?.table_name).not.toBeNull();
    }
  });

  it('3. Sıfırdan Staging Veri Yaşam Döngüsü Akışı: Kayıt -> Olay -> Medya -> Moderasyon -> Outbox -> Silme', async () => {
    const userRepo = dataSource.getRepository(UserEntity);
    const catRepo = dataSource.getRepository(CategoryEntity);
    const mediaRepo = dataSource.getRepository(EventMediaEntity);
    const outboxRepo = dataSource.getRepository(OutboxEventEntity);
    const pushRepo = dataSource.getRepository(DevicePushTokenEntity);

    // 1. Kullanıcı kaydı
    const passwordHash = await bcrypt.hash('StagingTestPass123!', 10);
    const stagingUser = await userRepo.save(
      userRepo.create({
        email: `staging_flow_${Date.now()}@staging.sehirnabiz.local`,
        displayName: 'Staging Test Vatandaşı',
        passwordHash,
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
        reputationScore: 10,
      }),
    );
    cleanupUserIds.push(stagingUser.id);
    expect(stagingUser.id).toBeDefined();

    // 2. Kategori temin et
    let cat = await catRepo.findOne({ where: { code: 'TRAFFIC' as any } });
    if (!cat) {
      cat = await catRepo.save(
        catRepo.create({
          code: 'TRAFFIC' as any,
          nameTr: 'Trafik',
          colorHex: '#EF4444',
        }),
      );
    }

    // 3. Olay oluşturma
    const eventResult = await dataSource.query(
      `
      INSERT INTO "events" (
        "authorId", "categoryId", "title", "description", "severity", "status",
        "location", "city", "district", "expiresAt", "reliabilityScore", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, 'Staging Zincirleme Trafik Kazası', 'Kayseri Kartal Kavşağı trafik durdu.',
        'HIGH', 'PENDING_REVIEW',
        ST_SetSRID(ST_MakePoint(35.49, 38.72), 4326),
        'Kayseri', 'Melikgazi', NOW() + INTERVAL '12 hours', 1.0, NOW(), NOW()
      ) RETURNING id;
      `,
      [stagingUser.id, cat.id],
    );
    const eventId = eventResult[0].id;
    expect(eventId).toBeDefined();

    // 4. Medya ekleme
    const media = await mediaRepo.save(
      mediaRepo.create({
        eventId,
        uploadedById: stagingUser.id,
        storageKey: `events/${eventId}/staging-kaza.webp`,
        mimeType: 'image/webp',
        fileSize: 4567,
        status: MediaStatus.PENDING_UPLOAD,
      }),
    );
    expect(media.id).toBeDefined();

    // 5. Moderasyon: Olayı onayla (PENDING_REVIEW -> ACTIVE)
    await dataSource.query(
      `UPDATE "events" SET "status" = 'ACTIVE' WHERE "id" = $1;`,
      [eventId],
    );
    const activeEvent = await dataSource.query(`SELECT status FROM "events" WHERE "id" = $1;`, [eventId]);
    expect(activeEvent[0].status).toBe('ACTIVE');

    // 6. Push token ve Transactional Outbox görevi
    await pushRepo.save(
      pushRepo.create({
        userId: stagingUser.id,
        token: `ExponentPushToken[staging_device_${stagingUser.id}]`,
        platform: 'android' as any,
      }),
    );

    const outboxItem: OutboxEventEntity = await outboxRepo.save(
      outboxRepo.create({
        eventType: 'EVENT_STATUS_CHANGED' as any,
        aggregateType: 'Event',
        aggregateId: eventId,
        payload: {
          userId: stagingUser.id,
          eventId,
          newStatus: 'ACTIVE',
        },
        status: 'PENDING' as any,
        attempts: 0,
      }),
    );
    expect(outboxItem.id).toBeDefined();

    // 7. Kullanıcı hesap silme (Anında anonimleştirme)
    const delReqRepo = dataSource.getRepository(AccountDeletionRequestEntity);
    const delReq = await delReqRepo.save(
      delReqRepo.create({
        userId: stagingUser.id,
        status: DeletionRequestStatus.PROCESSING,
        scheduledFor: new Date(),
        attemptCount: 1,
        reason: 'Staging veri yaşam döngüsü testi',
      }),
    );

    // Atomik maskeleme ve temizlik
    await dataSource.transaction(async manager => {
      // PII maskele
      await manager.update(
        UserEntity,
        { id: stagingUser.id },
        {
          email: `deleted_${Date.now()}_${stagingUser.id.substring(0, 8)}@deleted.sehirnabiz.local`,
          displayName: 'Anonim Vatandaş',
          passwordHash: '*DELETED*',
          accountStatus: AccountStatus.DELETED,
          reputationScore: 0,
        },
      );

      // Push token sil
      await manager.delete(DevicePushTokenEntity, { userId: stagingUser.id });

      // Outbox iptal
      await manager.query(
        `UPDATE "outbox_events" SET "status" = 'FAILED', "last_error" = 'Hesap silindiği için iptal' 
         WHERE "status" = 'PENDING' AND "payload"->>'userId' = $1;`,
        [stagingUser.id],
      );

      // Talep tamamla
      await manager.update(
        AccountDeletionRequestEntity,
        { id: delReq.id },
        { status: DeletionRequestStatus.COMPLETED, completedAt: new Date() },
      );
    });

    // 8. Sonuç doğrulaması
    const freshUser = await userRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: stagingUser.id })
      .getOne();
    expect(freshUser?.displayName).toBe('Anonim Vatandaş');
    expect(freshUser?.accountStatus).toBe(AccountStatus.DELETED);
    expect(freshUser?.passwordHash).toBe('*DELETED*');

    // Onaylanmış kentsel olay korunmalı
    const preservedEvent = await dataSource.query(`SELECT "authorId", "status", "title" FROM "events" WHERE "id" = $1;`, [eventId]);
    expect(preservedEvent[0].authorId).toBe(stagingUser.id);
    expect(preservedEvent[0].status).toBe('ACTIVE');

    // Push token ve Outbox doğrula
    const tokensLeft = await pushRepo.count({ where: { userId: stagingUser.id } });
    expect(tokensLeft).toBe(0);

    const cancelledOutbox = await dataSource.query(
      `SELECT status FROM "outbox_events" WHERE "id" = $1;`,
      [outboxItem.id],
    );
    expect(cancelledOutbox[0].status).toBe('FAILED');
  });
});
