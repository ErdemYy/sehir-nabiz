import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import * as net from 'net';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { dataSourceOptions } from '../src/database/data-source';
import { StorageService } from '../src/modules/storage/storage.service';
import { RealtimeGateway } from '../src/modules/realtime/realtime.gateway';
import { AccountDeletionService } from '../src/modules/users/account-deletion.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import {
  UserEntity,
  AccountDeletionRequestEntity,
  RefreshTokenEntity,
  DevicePushTokenEntity,
  UserNotificationEntity,
  UserNotificationPreferenceEntity,
  EventMediaEntity,
  EventEntity,
  CategoryEntity,
} from '../src/database/entities';
import {
  UserRole,
  AccountStatus,
  DeletionRequestStatus,
  DeletionClientSource,
  NotificationType,
  PushPlatform,
  MediaStatus,
  EventSeverity,
  EventStatus,
} from '@sehir-nabiz/shared';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

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

describe('Phase 14 — Güvenli Hesap Silme, Veri Yaşam Döngüsü ve Release Blocker Canlı Entegrasyon Testleri (E2E)', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5434', 10);
  const storagePort = 9000;

  const isPostgresUp = await isPortOpen(host, port);
  const isMinioUp = await isPortOpen(host, storagePort);

  if (!isPostgresUp) {
    it.skip(`PostgreSQL servisi (${host}:${port}) kapalı: Testler atlandı.`, () => {});
    return;
  }

  let dataSource: DataSource;
  let storageService: StorageService;
  let realtimeGateway: RealtimeGateway;
  let deletionService: AccountDeletionService;
  let jwtStrategy: JwtStrategy;
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

    jwtStrategy = new JwtStrategy(
      configService,
      dataSource.getRepository(UserEntity),
    );

    // Test kategorisi oluştur
    const catRepo = dataSource.getRepository(CategoryEntity);
    let cat = await catRepo.findOne({ where: { code: 'TRAFFIC' as any } });
    if (!cat) {
      cat = catRepo.create({
        code: 'TRAFFIC' as any,
        nameTr: 'Trafik',
        colorHex: '#14B8A6',
      });
      cat = await catRepo.save(cat);
    }
    testCategory = cat;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      for (const uid of createdUserIds) {
        try {
          await dataSource.query(
            `DELETE FROM "account_deletion_requests" WHERE "userId" = $1;`,
            [uid],
          );
          await dataSource.query(
            `DELETE FROM "device_push_tokens" WHERE "userId" = $1;`,
            [uid],
          );
          await dataSource.query(
            `DELETE FROM "user_notifications" WHERE "userId" = $1;`,
            [uid],
          );
          await dataSource.query(
            `DELETE FROM "user_notification_preferences" WHERE "userId" = $1;`,
            [uid],
          );
          await dataSource.query(
            `DELETE FROM "refresh_tokens" WHERE "userId" = $1;`,
            [uid],
          );
          await dataSource.query(
            `DELETE FROM "event_media" WHERE "uploadedById" = $1;`,
            [uid],
          );
          await dataSource.query(
            `DELETE FROM "events" WHERE "authorId" = $1;`,
            [uid],
          );
          await dataSource.query(`DELETE FROM "users" WHERE "id" = $1;`, [uid]);
        } catch {
          // ignore cleanup errors
        }
      }
      await dataSource.destroy();
    }
  });

  async function createTestUser(emailPrefix: string, password = 'Password123!'): Promise<UserEntity> {
    const userRepo = dataSource.getRepository(UserEntity);
    const passwordHash = await bcrypt.hash(password, 10);
    const email = `${emailPrefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.local`;

    const user = userRepo.create({
      email,
      displayName: 'Test Vatandaş',
      passwordHash,
      role: UserRole.CITIZEN,
      accountStatus: AccountStatus.ACTIVE,
      reputationScore: 25,
    });

    const saved = await userRepo.save(user);
    createdUserIds.push(saved.id);
    return saved;
  }

  describe('1. Yetki ve Kimlik Doğrulama Güvenliği', () => {
    it('yanlış şifre ile silme talebinde 401 Unauthorized fırlatmalı', async () => {
      const user = await createTestUser('wrong_pass_user');

      await expect(
        deletionService.requestDeletion(user.id, {
          password: 'IncorrectPassword999!',
          immediate: true,
        }),
      ).rejects.toThrow(UnauthorizedException);

      // Kullanıcının aktif kaldığını doğrula
      const freshUser = await dataSource.getRepository(UserEntity).findOne({ where: { id: user.id } });
      expect(freshUser?.accountStatus).toBe(AccountStatus.ACTIVE);
    });

    it('var olmayan kullanıcı ID ile silme talebinde NotFoundException fırlatmalı', async () => {
      await expect(
        deletionService.requestDeletion('00000000-0000-0000-0000-000000000000', {
          password: 'AnyPassword123!',
          immediate: true,
        }),
      ).rejects.toThrow('Kullanıcı hesabı bulunamadı');
    });
  });

  describe('2. Başarılı Anında Silme ve Veri Anonimleştirme (Immediate Purge)', () => {
    it('hesabı başarıyla silmeli, PII bilgilerini maskelemeli ve audit kaydı üretmeli', async () => {
      const user = await createTestUser('immediate_user');
      const originalEmail = user.email;

      // Kullanıcıya ait ilişkili veriler ekle
      const tokenRepo = dataSource.getRepository(RefreshTokenEntity);
      const pushRepo = dataSource.getRepository(DevicePushTokenEntity);
      const notifRepo = dataSource.getRepository(UserNotificationEntity);
      const prefRepo = dataSource.getRepository(UserNotificationPreferenceEntity);

      await tokenRepo.save(
        tokenRepo.create({
          userId: user.id,
          tokenHash: 'dummy_token_hash_1',
          expiresAt: new Date(Date.now() + 86400000),
          isRevoked: false,
        }),
      );

      await pushRepo.save(
        pushRepo.create({
          userId: user.id,
          token: 'ExponentPushToken[immediate_test_token]',
          platform: PushPlatform.ANDROID,
        }),
      );

      await notifRepo.save(
        notifRepo.create({
          userId: user.id,
          title: 'Hoşgeldiniz',
          body: 'Test bildirim gövdesi',
          type: NotificationType.SYSTEM,
        }),
      );

      await prefRepo.save(
        prefRepo.create({
          userId: user.id,
          pushEnabled: true,
          inAppEnabled: true,
        }),
      );

      // Silme isteğini gönder
      const result = await deletionService.requestDeletion(
        user.id,
        {
          password: 'Password123!',
          reason: 'Gizlilik endişesi',
          immediate: true,
        },
        {
          ip: '192.168.1.100',
          userAgent: 'SehirNabiz-Mobile/1.0.0 (Android 14)',
          source: DeletionClientSource.MOBILE_APP,
        },
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(DeletionRequestStatus.COMPLETED);
      expect(result.anonymizedDisplayName).toBe('Anonim Vatandaş');

      // Veritabanı doğrulama
      const freshUser = await dataSource
        .getRepository(UserEntity)
        .createQueryBuilder('u')
        .addSelect('u.passwordHash')
        .where('u.id = :id', { id: user.id })
        .getOne();

      expect(freshUser?.accountStatus).toBe(AccountStatus.DELETED);
      expect(freshUser?.displayName).toBe('Anonim Vatandaş');
      expect(freshUser?.passwordHash).toBe('*DELETED*');
      expect(freshUser?.reputationScore).toBe(0);
      expect(freshUser?.email).not.toBe(originalEmail);
      expect(freshUser?.email).toContain('@deleted.sehirnabiz.local');

      // Refresh tokenların iptal edildiğini doğrula
      const tokens = await tokenRepo.find({ where: { userId: user.id } });
      expect(tokens.every(t => t.isRevoked)).toBe(true);

      // Push tokenlarının tamamen silindiğini doğrula
      const pushTokens = await pushRepo.find({ where: { userId: user.id } });
      expect(pushTokens).toHaveLength(0);

      // Bildirimlerin temizlendiğini doğrula
      const notifications = await notifRepo.find({ where: { userId: user.id } });
      expect(notifications).toHaveLength(0);

      // Audit kaydını doğrula
      const audit = await dataSource.getRepository(AccountDeletionRequestEntity).findOne({
        where: { id: result.requestId },
      });
      expect(audit).not.toBeNull();
      expect(audit?.status).toBe(DeletionRequestStatus.COMPLETED);
      expect(audit?.clientSource).toBe(DeletionClientSource.MOBILE_APP);
      expect(audit?.ipAddress).toBe('192.168.1.100');
      expect(audit?.details).toBeDefined();
    });
  });

  describe('3. Eski JWT İle Erişim Engeli (Token Invalidation)', () => {
    it('silinmiş kullanıcının geçerli JWT access token ile istek yapmasını engellemeli', async () => {
      const user = await createTestUser('jwt_block_user');

      // Silmeden önce geçerli JWT Payload
      const validPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      // Aktifken başarılı doğrulamalı
      const validatedActive = await jwtStrategy.validate(validPayload);
      expect(validatedActive.sub).toBe(user.id);

      // Hesabı sil
      await deletionService.requestDeletion(user.id, {
        password: 'Password123!',
        immediate: true,
      });

      // Silindikten sonra aynı token validate edildiğinde Unauthorized fırlatmalı
      await expect(jwtStrategy.validate(validPayload)).rejects.toThrow(
        'Kullanıcı hesabı aktif değil veya silinmiş.',
      );
    });
  });

  describe('4. Foreign Key Tutarlılığı & Kentsel Olay Bütünlüğü', () => {
    it('kullanıcının bildirdiği kentsel olaylar silinmemeli, yazar bilgisi anonimleştirilmeli', async () => {
      const user = await createTestUser('event_author_user');

      // Kullanıcı adına bir olay oluştur (PostGIS formatında)
      const eventResult = await dataSource.query(
        `
        INSERT INTO "events" (
          "authorId", "categoryId", "title", "description", "severity", "status",
          "location", "expiresAt", "reliabilityScore", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          ST_SetSRID(ST_MakePoint($7, $8), 4326),
          $9, 1.0, NOW(), NOW()
        ) RETURNING id;
        `,
        [
          user.id,
          testCategory.id,
          'Atatürk Bulvarı Yol Çökmesi',
          'Sağ şeritte derin asfalt çökmesi meydana geldi.',
          EventSeverity.HIGH,
          EventStatus.ACTIVE,
          35.48,
          38.72,
          new Date(Date.now() + 86400000),
        ],
      );
      const eventId = eventResult[0].id;

      // Hesabı sil
      await deletionService.requestDeletion(user.id, {
        password: 'Password123!',
        immediate: true,
      });

      // Olayın veritabanında hala sağlam ve güvenli şekilde durduğunu doğrula
      const freshEvent = await dataSource.getRepository(EventEntity).findOne({
        where: { id: eventId },
        relations: { author: true },
      });
      expect(freshEvent).not.toBeNull();
      expect(freshEvent?.title).toBe('Atatürk Bulvarı Yol Çökmesi');
      // Yazar anonimleştirilmiş olmalı
      expect(freshEvent?.author.displayName).toBe('Anonim Vatandaş');
      expect(freshEvent?.author.accountStatus).toBe(AccountStatus.DELETED);
    });
  });

  describe('5. Eşzamanlı İstek (Concurrency) Koruması', () => {
    it('aynı kullanıcı için eşzamanlı silme taleplerinde yarış durumunu (Race Condition) engellemeli', async () => {
      const user = await createTestUser('concurrent_user');

      // Bir silme kaydını elle PROCESSING durumuna alarak simüle et
      const deletionRepo = dataSource.getRepository(AccountDeletionRequestEntity);
      await deletionRepo.save(
        deletionRepo.create({
          userId: user.id,
          status: DeletionRequestStatus.PROCESSING,
          scheduledFor: new Date(),
          attemptCount: 1,
        }),
      );

      // Yeni bir silme isteği geldiğinde ConflictException fırlatmalı
      await expect(
        deletionService.requestDeletion(user.id, {
          password: 'Password123!',
          immediate: true,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('6. Grace Period ve İptal Akışı (Cancellation)', () => {
    it('14 günlük bekleme moduna alınmalı ve iptal işlemi ile yeniden aktifleşmeli', async () => {
      const user = await createTestUser('grace_period_user');

      // immediate: false ile talep oluştur
      const requestResult = await deletionService.requestDeletion(user.id, {
        password: 'Password123!',
        reason: 'Bir süre ara veriyorum',
        immediate: false,
      });

      expect(requestResult.status).toBe(DeletionRequestStatus.PENDING);

      // Kullanıcı PENDING_DELETION durumuna geçmiş olmalı
      const pendingUser = await dataSource.getRepository(UserEntity).findOne({ where: { id: user.id } });
      expect(pendingUser?.accountStatus).toBe(AccountStatus.PENDING_DELETION);

      // Durum sorgulama kontrolü
      const statusCheck = await deletionService.getDeletionStatus(user.id);
      expect(statusCheck.hasPendingDeletion).toBe(true);
      expect(statusCheck.canCancel).toBe(true);

      // İptal et
      const cancelResult = await deletionService.cancelDeletion(
        { userId: user.id },
        { password: 'Password123!' },
      );
      expect(cancelResult.success).toBe(true);

      // Kullanıcının yeniden ACTIVE olduğunu doğrula
      const activeUser = await dataSource.getRepository(UserEntity).findOne({ where: { id: user.id } });
      expect(activeUser?.accountStatus).toBe(AccountStatus.ACTIVE);

      // Talep durumunun CANCELLED olduğunu doğrula
      const cancelledReq = await dataSource.getRepository(AccountDeletionRequestEntity).findOne({
        where: { id: requestResult.requestId },
      });
      expect(cancelledReq?.status).toBe(DeletionRequestStatus.CANCELLED);
    });
  });

  describe('7. Web Üzerinden Silme Talebi & HTML Arayüzü', () => {
    it('web silme talebinde e-posta ve şifreyi doğrulamalı ve WEB_REQUEST kaynağı ile kaydetmeli', async () => {
      const user = await createTestUser('web_delete_user');

      const webResult = await deletionService.requestWebDeletion(
        {
          email: user.email,
          password: 'Password123!',
          reason: 'Web talep formu',
          immediate: true,
        },
        {
          ip: '203.0.113.195',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      );

      expect(webResult.success).toBe(true);
      expect(webResult.status).toBe(DeletionRequestStatus.COMPLETED);

      const audit = await dataSource.getRepository(AccountDeletionRequestEntity).findOne({
        where: { id: webResult.requestId },
      });
      expect(audit?.clientSource).toBe(DeletionClientSource.WEB_REQUEST);
      expect(audit?.ipAddress).toBe('203.0.113.195');
    });

    it('web HTML sayfası marka adı, KVKK açıklaması ve silme formunu içermeli', () => {
      const html = deletionService.renderAccountDeletionHtml();

      expect(html).toContain('ŞehirNabız');
      expect(html).toContain('Hesap ve Kişisel Veri Silme Talebi');
      expect(html).toContain('6698 Sayılı KVKK');
      expect(html).toContain('Anonim Vatandaş');
      expect(html).toContain('id="deletionForm"');
      expect(html).toContain('/api/v1/users/web-deletion-request');
    });
  });

  describe('8. Medya Temizliği, MinIO Hata Toleransı & Yeniden Deneme (Retry)', () => {
    it('gerçek MinIO nesnesi yükleyip hesap silindiğinde nesnenin MinIO depolamasından fiziksel olarak silindiğini doğrulamalı', async () => {
      const user = await createTestUser('media_real_minio_user');
      const mediaRepo = dataSource.getRepository(EventMediaEntity);

      const eventResult = await dataSource.query(
        `
        INSERT INTO "events" (
          "authorId", "categoryId", "title", "description", "severity", "status",
          "location", "expiresAt", "reliabilityScore", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          ST_SetSRID(ST_MakePoint($7, $8), 4326),
          $9, 1.0, NOW(), NOW()
        ) RETURNING id;
        `,
        [
          user.id,
          testCategory.id,
          'Canlı MinIO Test Olayı',
          'Açıklama',
          EventSeverity.MEDIUM,
          EventStatus.PENDING_REVIEW,
          35.48,
          38.72,
          new Date(Date.now() + 86400000),
        ],
      );
      const eventId = eventResult[0].id;
      const realStorageKey = `events/phase14-real-test-${user.id}.webp`;

      // 1. MinIO'ya gerçek test görseli/buffer'ı yaz
      const testBuffer = Buffer.from('RIFF....WEBPVP8 ... fake webp bytes for live test');
      await storageService.putObject(realStorageKey, testBuffer, 'image/webp');

      // MinIO'da nesnenin var olduğunu doğrula
      const downloadedBefore = await storageService.getObject(realStorageKey);
      expect(downloadedBefore).toBeDefined();
      expect(downloadedBefore.length).toBeGreaterThan(0);

      // 2. EventMediaEntity kaydet (PENDING_UPLOAD durumunda)
      const mediaEntity = await mediaRepo.save(
        mediaRepo.create({
          eventId,
          uploadedById: user.id,
          storageKey: realStorageKey,
          mimeType: 'image/webp',
          fileSize: testBuffer.length,
          status: MediaStatus.PENDING_UPLOAD,
        }),
      );

      // 3. Silme talebi oluştur ve executeDeletion çalıştır
      const delReq = await dataSource.getRepository(AccountDeletionRequestEntity).save(
        dataSource.getRepository(AccountDeletionRequestEntity).create({
          userId: user.id,
          status: DeletionRequestStatus.PROCESSING,
          scheduledFor: new Date(),
          attemptCount: 1,
        }),
      );

      const execResult = await deletionService.executeDeletion(user.id, delReq.id);
      expect(execResult.success).toBe(true);

      // 4. Veritabanında medya durumunun DELETED olduğunu doğrula
      const freshMedia = await mediaRepo.findOne({ where: { id: mediaEntity.id } });
      expect(freshMedia?.status).toBe(MediaStatus.DELETED);

      // 5. MinIO nesnesinin fiziksel olarak silindiğini doğrula (getObject hata fırlatmalı)
      await expect(storageService.getObject(realStorageKey)).rejects.toThrow();

      // 6. Audit kaydında mediaDeleted: 1 olduğunu doğrula
      const freshAudit = await dataSource.getRepository(AccountDeletionRequestEntity).findOne({
        where: { id: delReq.id },
      });
      expect(freshAudit?.status).toBe(DeletionRequestStatus.COMPLETED);
      expect(freshAudit?.details?.mediaDeleted).toBe(1);
    });

    it('MinIO nesne silme hatası aldığında ana silme işlemi çökmemeli ve hata kaydedilmeli', async () => {
      const user = await createTestUser('media_error_user');

      // Sahte ve var olmayan MinIO key'ine sahip medya ekle
      const mediaRepo = dataSource.getRepository(EventMediaEntity);

      const eventResult = await dataSource.query(
        `
        INSERT INTO "events" (
          "authorId", "categoryId", "title", "description", "severity", "status",
          "location", "expiresAt", "reliabilityScore", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          ST_SetSRID(ST_MakePoint($7, $8), 4326),
          $9, 1.0, NOW(), NOW()
        ) RETURNING id;
        `,
        [
          user.id,
          testCategory.id,
          'Test Medya Olayı',
          'Açıklama',
          EventSeverity.LOW,
          EventStatus.PENDING_REVIEW,
          35.48,
          38.72,
          new Date(Date.now() + 86400000),
        ],
      );
      const eventId = eventResult[0].id;

      await mediaRepo.save(
        mediaRepo.create({
          eventId,
          uploadedById: user.id,
          storageKey: 'events/non-existent-key-force-test.webp',
          mimeType: 'image/webp',
          fileSize: 1024,
          status: MediaStatus.PENDING_UPLOAD,
        }),
      );

      // Silme işlemi çalıştırılır
      const delReq = await dataSource.getRepository(AccountDeletionRequestEntity).save(
        dataSource.getRepository(AccountDeletionRequestEntity).create({
          userId: user.id,
          status: DeletionRequestStatus.PROCESSING,
          scheduledFor: new Date(),
          attemptCount: 1,
        }),
      );

      // executeDeletion çağrısı (MinIO nesnesi olmasa bile veritabanı tutarlılığı korunmalı)
      const executionResult = await deletionService.executeDeletion(user.id, delReq.id);
      expect(executionResult).toBeDefined();

      // Kullanıcının başarıyla anonimleştirildiğini doğrula
      const freshUser = await dataSource.getRepository(UserEntity).findOne({ where: { id: user.id } });
      expect(freshUser?.accountStatus).toBe(AccountStatus.DELETED);

      // retryFailedDeletions fonksiyonu çalıştırılabilir olmalı
      const retryResult = await deletionService.retryFailedDeletions();
      expect(typeof retryResult.retried).toBe('number');
    });
  });
});
