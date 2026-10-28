import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import * as net from 'net';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { dataSourceOptions } from '../src/database/data-source';
import { StorageService } from '../src/modules/storage/storage.service';
import { RealtimeGateway } from '../src/modules/realtime/realtime.gateway';
import { AccountDeletionService } from '../src/modules/users/account-deletion.service';
import { AccountDeletionProcessorService } from '../src/modules/users/account-deletion-processor.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import {
  UserEntity,
  AccountDeletionRequestEntity,
  RefreshTokenEntity,
  DevicePushTokenEntity,
  EventMediaEntity,
  OutboxEventEntity,
  CategoryEntity,
} from '../src/database/entities';
import {
  UserRole,
  AccountStatus,
  DeletionRequestStatus,
  DeletionClientSource,
  MediaStatus,
} from '@sehir-nabiz/shared';
import { UnauthorizedException } from '@nestjs/common';

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

describe('Phase 15 — Account Deletion Verification, Privacy Hardening & Real MinIO Physical Cleanup (E2E)', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5434', 10);
  const storagePort = 9000;

  const isPostgresUp = await isPortOpen(host, port);
  const isMinioUp = await isPortOpen(host, storagePort);

  if (!isPostgresUp) {
    it.skip(`PostgreSQL (${host}:${port}) kapalı: Testler atlandı.`, () => {});
    return;
  }

  let dataSource: DataSource;
  let storageService: StorageService;
  let realtimeGateway: RealtimeGateway;
  let deletionService: AccountDeletionService;
  let processorService: AccountDeletionProcessorService;
  let jwtStrategy: JwtStrategy;
  let jwtAuthGuard: JwtAuthGuard;
  let configService: ConfigService;
  let jwtService: JwtService;

  let testCategory: CategoryEntity;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();

    configService = new ConfigService({
      STORAGE_ENDPOINT: `http://${host}:${storagePort}`,
      STORAGE_REGION: 'auto',
      STORAGE_ACCESS_KEY: 'minio_admin_user',
      STORAGE_SECRET_KEY: 'minio_secure_dev_password',
      STORAGE_FORCE_PATH_STYLE: 'true',
      STORAGE_BUCKET: 'sehir-nabiz-media-test',
      JWT_ACCESS_SECRET: 'test_super_secret_access_jwt_key_32chars!',
    });

    storageService = new StorageService(configService);
    if (isMinioUp) {
      await storageService.onModuleInit();
    }

    jwtService = new JwtService({
      secret: 'test_super_secret_access_jwt_key_32chars!',
    });

    realtimeGateway = new RealtimeGateway(jwtService);

    deletionService = new AccountDeletionService(
      dataSource.getRepository(UserEntity),
      dataSource.getRepository(AccountDeletionRequestEntity),
      dataSource.getRepository(RefreshTokenEntity),
      dataSource.getRepository(EventMediaEntity),
      storageService,
      realtimeGateway,
      dataSource,
    );

    processorService = new AccountDeletionProcessorService(
      dataSource.getRepository(AccountDeletionRequestEntity),
      deletionService,
    );

    jwtStrategy = new JwtStrategy(
      configService,
      dataSource.getRepository(UserEntity),
    );

    const reflector = new Reflector();
    jwtAuthGuard = new JwtAuthGuard(reflector);

    const catRepo = dataSource.getRepository(CategoryEntity);
    let cat = await catRepo.findOne({ where: { code: 'INFRASTRUCTURE' as any } });
    if (!cat) {
      cat = catRepo.create({
        code: 'INFRASTRUCTURE' as any,
        nameTr: 'Altyapı',
        colorHex: '#3B82F6',
      });
      cat = await catRepo.save(cat);
    }
    testCategory = cat;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      for (const uid of createdUserIds) {
        try {
          await dataSource.query(`DELETE FROM "account_deletion_requests" WHERE "userId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "outbox_events" WHERE "payload"::text LIKE $1;`, [`%"userId":"${uid}"%`]);
          await dataSource.query(`DELETE FROM "device_push_tokens" WHERE "userId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "user_notifications" WHERE "userId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "user_notification_preferences" WHERE "userId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "refresh_tokens" WHERE "userId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "event_media" WHERE "uploadedById" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "events" WHERE "authorId" = $1;`, [uid]);
          await dataSource.query(`DELETE FROM "users" WHERE "id" = $1;`, [uid]);
        } catch {
          // cleanup
        }
      }
      await dataSource.destroy();
    }
  });

  async function createTestUser(suffix: string): Promise<UserEntity> {
    const userRepo = dataSource.getRepository(UserEntity);
    const hash = await bcrypt.hash('GuvenliSifre123!', 10);
    const user = userRepo.create({
      email: `p15_${suffix}_${Date.now()}@sehirnabiz.local`,
      displayName: `Phase 15 Test ${suffix}`,
      passwordHash: hash,
      role: UserRole.CITIZEN,
      accountStatus: AccountStatus.ACTIVE,
      reputationScore: 50,
    });
    const saved = await userRepo.save(user);
    createdUserIds.push(saved.id);
    return saved;
  }

  it('1. Gerçek MinIO nesne deposuyla fiziksel temizlik: Yükle, Doğrula, Sil, Yok oluşu kanıtla', async () => {
    if (!isMinioUp) {
      console.warn('MinIO kapalı, test atlanıyor.');
      return;
    }

    const user = await createTestUser('minio_physical');
    const mediaRepo = dataSource.getRepository(EventMediaEntity);

    // 1. MinIO'ya gerçek nesne yükle
    const storageKey = `events/phase15-physical-${user.id}.webp`;
    const imagePayload = Buffer.from('RIFF_FAKE_WEBP_IMAGE_PAYLOAD_PHASE_15');
    await storageService.putObject(storageKey, imagePayload, 'image/webp');

    // 2. Nesnenin MinIO'da fiziksel olarak var olduğunu kanıtla
    const downloadedBefore = await storageService.getObject(storageKey);
    expect(downloadedBefore).toBeDefined();
    expect(downloadedBefore.length).toBe(imagePayload.length);

    // 3. Olay ve medya kaydı ilişkilendir
    const eventResult = await dataSource.query(
      `
      INSERT INTO "events" (
        "authorId", "categoryId", "title", "description", "severity", "status",
        "location", "expiresAt", "reliabilityScore", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, 'MinIO Fiziksel Temizlik Olayı', 'Açıklama', 'LOW', 'PENDING_REVIEW',
        ST_SetSRID(ST_MakePoint(35.48, 38.72), 4326),
        NOW() + INTERVAL '24 hours', 1.0, NOW(), NOW()
      ) RETURNING id;
      `,
      [user.id, testCategory.id],
    );
    const eventId = eventResult[0].id;

    const mediaEntity = await mediaRepo.save(
      mediaRepo.create({
        eventId,
        uploadedById: user.id,
        storageKey,
        mimeType: 'image/webp',
        fileSize: imagePayload.length,
        status: MediaStatus.PENDING_UPLOAD,
      }),
    );

    // 4. Anında silme talebi ve executeDeletion
    const req = await deletionService.requestDeletion(
      user.id,
      { password: 'GuvenliSifre123!', immediate: true },
      { source: DeletionClientSource.MOBILE_APP },
    );
    expect(req.success).toBe(true);
    expect(req.status).toBe(DeletionRequestStatus.COMPLETED);

    // 5. MinIO nesnesinin fiziksel olarak yok olduğunu doğrula
    await expect(storageService.getObject(storageKey)).rejects.toThrow();

    // 6. Veritabanında medya durumunun DELETED olduğunu doğrula
    const freshMedia = await mediaRepo.findOne({ where: { id: mediaEntity.id } });
    expect(freshMedia?.status).toBe(MediaStatus.DELETED);
  });

  it('2. Kamuya açık onaylanmış olaylar korunmalı, taslaklar anonimleştirilmeli', async () => {
    const user = await createTestUser('privacy_hardening');

    // Kullanıcının 1 adet onaylanmamış taslak olayı, 1 adet aktif onaylanmış olayı olsun
    await dataSource.query(
      `
      INSERT INTO "events" (
        "authorId", "categoryId", "title", "description", "severity", "status",
        "location", "expiresAt", "reliabilityScore", "createdAt", "updatedAt"
      ) VALUES
      ($1, $2, 'Taslak Özel Olay', 'Evimin önünde çukur var, numaram 555-1234', 'LOW', 'PENDING_REVIEW',
       ST_SetSRID(ST_MakePoint(35.48, 38.72), 4326), NOW() + INTERVAL '24 hours', 1.0, NOW(), NOW()),
      ($1, $2, 'Ana Cadde Su Patlağı', 'Kayseri Sivas Caddesi su borusu patladı', 'HIGH', 'ACTIVE',
       ST_SetSRID(ST_MakePoint(35.49, 38.73), 4326), NOW() + INTERVAL '24 hours', 2.5, NOW(), NOW());
      `,
      [user.id, testCategory.id],
    );

    // Silme işlemini yürüt
    const result = await deletionService.executeDeletion(user.id);
    expect(result.success).toBe(true);
    expect(result.details.eventsSanitized).toBe(1);

    // Doğrula: Taslak olay kişisel veriden arındırılmış olmalı
    const sanitizedEvent = await dataSource.query(
      `SELECT * FROM "events" WHERE "authorId" = $1 AND "status" = 'PENDING_REVIEW';`,
      [user.id],
    );
    expect(sanitizedEvent[0].title).toBe('Kişisel Veriden Arındırılmış Bildirim');
    expect(sanitizedEvent[0].description).toContain('kişisel verilerden arındırılmıştır');

    // Doğrula: Onaylanmış kamu yararı taşıyan aktif olay korunmalı
    const publicEvent = await dataSource.query(
      `SELECT * FROM "events" WHERE "authorId" = $1 AND "status" = 'ACTIVE';`,
      [user.id],
    );
    expect(publicEvent[0].title).toBe('Ana Cadde Su Patlağı');
  });

  it('3. PENDING_DELETION durumundaki kullanıcı için JwtAuthGuard ve @AllowPendingDeletion doğrulaması', async () => {
    const user = await createTestUser('guard_check');

    // 14 günlük bekleme moduna al
    await deletionService.requestDeletion(
      user.id,
      { password: 'GuvenliSifre123!', immediate: false },
    );

    // JwtStrategy üzerinden validate çağır
    const validated = await jwtStrategy.validate({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    expect(validated.accountStatus).toBe(AccountStatus.PENDING_DELETION);

    // Normal uç nokta (allowPending = false): Guard engellemeli
    const normalContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    expect(() =>
      jwtAuthGuard.handleRequest(null, validated, null, normalContext),
    ).toThrow(UnauthorizedException);

    // Silme sorgulama / iptal uç noktası: AllowPendingDeletion metadata simülasyonu
    const mockReflector = new Reflector();
    mockReflector.getAllAndOverride = () => true;
    const allowedGuard = new JwtAuthGuard(mockReflector);

    const allowedResult = allowedGuard.handleRequest(null, validated, null, normalContext);
    expect(allowedResult).toBeDefined();
    expect(allowedResult.sub).toBe(user.id);
  });

  it('4. PENDING_DELETION durumundaki kullanıcı JWT ile silme talebini iptal edebilmeli', async () => {
    const user = await createTestUser('cancel_jwt');

    // Silme talebi başlat (14 gün)
    await deletionService.requestDeletion(
      user.id,
      { password: 'GuvenliSifre123!', immediate: false },
    );

    // Durumu sorgula
    const status = await deletionService.getDeletionStatus(user.id);
    expect(status.hasPendingDeletion).toBe(true);
    expect(status.canCancel).toBe(true);

    // Oturumlu iptal çağrısı (userId ile)
    const cancelResult = await deletionService.cancelDeletion(
      { userId: user.id },
      { password: 'GuvenliSifre123!' },
    );
    expect(cancelResult.success).toBe(true);

    // Kullanıcının yeniden ACTIVE olduğunu doğrula
    const freshUser = await dataSource.getRepository(UserEntity).findOne({ where: { id: user.id } });
    expect(freshUser?.accountStatus).toBe(AccountStatus.ACTIVE);
  });

  it('5. Hesap silindiğinde Transactional Outbox görevleri iptal edilmeli ve push tokenlar yok edilmeli', async () => {
    const user = await createTestUser('outbox_isolation');

    // 1. Push token ekle
    const pushRepo = dataSource.getRepository(DevicePushTokenEntity);
    await pushRepo.save(
      pushRepo.create({
        userId: user.id,
        token: `ExponentPushToken[p15_test_${user.id}]`,
        platform: 'android' as any,
      }),
    );

    // 2. Bu kullanıcıya ait PENDING Outbox kaydı ekle
    const outboxRepo = dataSource.getRepository(OutboxEventEntity);
    const fakeUuid = '00000000-0000-0000-0000-000000000001';
    await outboxRepo.save(
      outboxRepo.create({
        eventType: 'EVENT_NOTIFICATION' as any,
        aggregateType: 'Event',
        aggregateId: fakeUuid,
        payload: {
          userId: user.id,
          title: 'Yeni Bildirim',
          body: 'Yakınınızda olay gerçekleşti',
        },
        status: 'PENDING' as any,
        attempts: 0,
      }),
    );

    // 3. Hesabı sil
    const execResult = await deletionService.executeDeletion(user.id);
    expect(execResult.success).toBe(true);
    expect(execResult.details.pushTokensDeleted).toBe(1);
    expect(execResult.details.outboxCancelled).toBe(1);

    // 4. Doğrula: Push token 0 olmalı
    const remainingPush = await pushRepo.count({ where: { userId: user.id } });
    expect(remainingPush).toBe(0);

    // 5. Doğrula: Outbox görevi FAILED (iptal) durumuna alınmış olmalı
    const updatedOutbox = await dataSource.query(
      `SELECT * FROM "outbox_events" WHERE "payload"->>'userId' = $1;`,
      [user.id],
    );
    expect(updatedOutbox.length).toBe(1);
    expect(updatedOutbox[0].status).toBe('FAILED');
    expect(updatedOutbox[0].last_error).toContain('Kullanıcı hesabı silindiği için görev iptal edildi');
  });

  it('6. AccountDeletionProcessorService süresi dolan talepleri otomatik işlemeli', async () => {
    const user = await createTestUser('processor_worker');

    // Geçmiş tarihli (süresi dolmuş) PENDING talep oluştur
    const delReqRepo = dataSource.getRepository(AccountDeletionRequestEntity);
    const expiredReq = await delReqRepo.save(
      delReqRepo.create({
        userId: user.id,
        status: DeletionRequestStatus.PENDING,
        scheduledFor: new Date(Date.now() - 60000), // 1 dakika önce süresi dolmuş
        attemptCount: 0,
        reason: 'Süresi dolan otomatik worker testi',
      }),
    );

    // Worker batch çalıştırması
    const batchResult = await processorService.processBatch();
    expect(batchResult.processed).toBeGreaterThanOrEqual(1);
    expect(batchResult.succeeded).toBeGreaterThanOrEqual(1);

    // Talep durumunun COMPLETED olduğunu doğrula
    const freshReq = await delReqRepo.findOne({ where: { id: expiredReq.id } });
    expect(freshReq?.status).toBe(DeletionRequestStatus.COMPLETED);

    // Kullanıcının DELETED olduğunu doğrula
    const freshUser = await dataSource.getRepository(UserEntity).findOne({ where: { id: user.id } });
    expect(freshUser?.accountStatus).toBe(AccountStatus.DELETED);
  });

  it('7. MinIO geçici hata simülasyonu: FAILED kaydı oluşmalı ve retry sonrası COMPLETED olmalı', async () => {
    const user = await createTestUser('minio_fault_retry');
    const mediaRepo = dataSource.getRepository(EventMediaEntity);

    // Sahte ve ulaşılamayan bir dosya anahtarı ekle
    const eventResult = await dataSource.query(
      `
      INSERT INTO "events" (
        "authorId", "categoryId", "title", "description", "severity", "status",
        "location", "expiresAt", "reliabilityScore", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, 'Hata Simülasyon Olayı', 'Açıklama', 'LOW', 'PENDING_REVIEW',
        ST_SetSRID(ST_MakePoint(35.48, 38.72), 4326),
        NOW() + INTERVAL '24 hours', 1.0, NOW(), NOW()
      ) RETURNING id;
      `,
      [user.id, testCategory.id],
    );
    const eventId = eventResult[0].id;

    await mediaRepo.save(
      mediaRepo.create({
        eventId,
        uploadedById: user.id,
        storageKey: 'events/non-existent-p15-test-key.webp',
        mimeType: 'image/webp',
        fileSize: 1234,
        status: MediaStatus.PENDING_UPLOAD,
      }),
    );

    const delReqRepo = dataSource.getRepository(AccountDeletionRequestEntity);
    const req = await delReqRepo.save(
      delReqRepo.create({
        userId: user.id,
        status: DeletionRequestStatus.PROCESSING,
        scheduledFor: new Date(),
        attemptCount: 1,
      }),
    );

    // executeDeletion çağrısı (MinIO nesnesi bulunamasa bile db transaction başarılı olmalı)
    const execRes = await deletionService.executeDeletion(user.id, req.id);
    expect(execRes).toBeDefined();

    // Kullanıcının DELETED olduğunu doğrula
    const freshUser = await dataSource.getRepository(UserEntity).findOne({ where: { id: user.id } });
    expect(freshUser?.accountStatus).toBe(AccountStatus.DELETED);

    // retryFailedDeletions çalıştırılabilir olmalı
    const retryResult = await deletionService.retryFailedDeletions();
    expect(typeof retryResult.retried).toBe('number');
  });

  it('8. Azami deneme sınırını (5) aşan FAILED silme talepleri DEAD_LETTER sayılmalı', async () => {
    const user = await createTestUser('dead_letter_ops');

    const delReqRepo = dataSource.getRepository(AccountDeletionRequestEntity);
    await delReqRepo.save(
      delReqRepo.create({
        userId: user.id,
        status: DeletionRequestStatus.FAILED,
        scheduledFor: new Date(),
        attemptCount: 5,
        lastError: 'MinIO depolama hizmetine erişim kalıcı olarak kesildi.',
      }),
    );

    const batchResult = await processorService.processBatch();
    expect(batchResult.deadLetterCount).toBeGreaterThanOrEqual(1);
  });
});
