import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import * as net from 'net';
import * as bcrypt from 'bcryptjs';
import sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { dataSourceOptions } from '../src/database/data-source';
import { StorageService } from '../src/modules/storage/storage.service';
import { MediaService } from '../src/modules/media/media.service';
import { EventsService } from '../src/modules/events/events.service';
import { EventMediaEntity } from '../src/database/entities/event-media.entity';
import { EventEntity } from '../src/database/entities/event.entity';
import { UserEntity } from '../src/database/entities/user.entity';
import { CategoryEntity } from '../src/database/entities/category.entity';
import { EventModerationLogEntity } from '../src/database/entities/event-moderation-log.entity';
import { EventFeedbackEntity } from '../src/database/entities/event-feedback.entity';
import { UserReputationLogEntity } from '../src/database/entities/user-reputation-log.entity';
import {
  MediaStatus,
  EventSeverity,
  UserRole,
  AccountStatus,
} from '@sehir-nabiz/shared';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

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

describe('Güvenli Medya Yükleme ve MinIO Object Storage Canlı Testleri (E2E)', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5434', 10);
  const storagePort = 9000;

  const isPostgresUp = await isPortOpen(host, port);
  const isMinioUp = await isPortOpen(host, storagePort);

  if (!isPostgresUp || !isMinioUp) {
    it.skip(`PostgreSQL veya MinIO (${host}:${storagePort}) kapalı: Medya E2E testleri atlandı.`, () => {});
    return;
  }

  let dataSource: DataSource;
  let storageService: StorageService;
  let mediaService: MediaService;
  let eventsService: EventsService;

  let testUser: UserEntity;
  let strangerUser: UserEntity;
  let trafficCategory: CategoryEntity;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...(dataSourceOptions as any),
      host,
      port,
      database: 'sehir_nabiz_test',
    });
    await dataSource.initialize();
    await dataSource.runMigrations();

    const mediaRepo = dataSource.getRepository(EventMediaEntity);
    const eventRepo = dataSource.getRepository(EventEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const categoryRepo = dataSource.getRepository(CategoryEntity);
    const moderationLogRepo = dataSource.getRepository(EventModerationLogEntity);
    const feedbackRepo = dataSource.getRepository(EventFeedbackEntity);
    const reputationLogRepo = dataSource.getRepository(UserReputationLogEntity);

    const configService = {
      get: (key: string, defaultVal: any) => {
        const envMap: Record<string, any> = {
          STORAGE_ENDPOINT: 'http://127.0.0.1:9000',
          STORAGE_REGION: 'us-east-1',
          STORAGE_ACCESS_KEY: 'minio_admin_user',
          STORAGE_SECRET_KEY: 'minio_secure_dev_password',
          STORAGE_BUCKET: 'sehir-nabiz-media-test',
          STORAGE_PUBLIC_URL: 'http://127.0.0.1:9000/sehir-nabiz-media-test',
          STORAGE_FORCE_PATH_STYLE: true,
        };
        return envMap[key] ?? defaultVal;
      },
    } as unknown as ConfigService;

    storageService = new StorageService(configService);
    await storageService.onModuleInit();

    mediaService = new MediaService(mediaRepo, eventRepo, storageService, dataSource);
    eventsService = new EventsService(
      eventRepo,
      userRepo,
      categoryRepo,
      moderationLogRepo,
      feedbackRepo,
      reputationLogRepo,
      dataSource,
    );

    // Test Kullanıcıları
    const passwordHash = await bcrypt.hash('SecureMedia123!', 10);
    testUser = await userRepo.save(
      userRepo.create({
        email: `media-user-${Date.now()}@sehirnabiz.local`,
        passwordHash,
        displayName: 'Fotoğraf Çeken Vatandaş',
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
      }),
    );

    strangerUser = await userRepo.save(
      userRepo.create({
        email: `stranger-user-${Date.now()}@sehirnabiz.local`,
        passwordHash,
        displayName: 'Yabancı Kullanıcı',
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
      }),
    );

    const categories = await categoryRepo.find();
    trafficCategory = categories.find(c => c.code === 'TRAFFIC')!;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query('TRUNCATE TABLE "event_media", "events", "users" CASCADE;');
      await dataSource.destroy();
    }
  });

  describe('1. Presigned Upload URL ve Depolama Anahtarı', () => {
    let singleEvent: EventEntity;

    beforeAll(async () => {
      const created = await eventsService.create(testUser.id, {
        categoryId: trafficCategory.id,
        title: 'Presigned URL Test Olayı',
        description: 'Presigned upload URL doğrulaması için olay.',
        severity: EventSeverity.MEDIUM,
        longitude: 35.48,
        latitude: 38.72,
      });
      singleEvent = (await dataSource.getRepository(EventEntity).findOne({ where: { id: created.id } }))!;
    });

    it('Olay yazarı için presigned URL ve tahmin edilemez storageKey üretilmeli', async () => {
      const uploadResult = await mediaService.generateUploadUrl(
        singleEvent.id,
        {
          fileName: 'kaza_olay_yeri.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024 * 300,
        },
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );

      expect(uploadResult).toBeDefined();
      expect(uploadResult.mediaId).toBeDefined();
      expect(uploadResult.uploadUrl).toContain('127.0.0.1:9000');
      expect(uploadResult.uploadUrl).toContain('X-Amz-Signature');
      expect(uploadResult.storageKey).toMatch(/^events\/[a-f0-9-]+\/raw\/[a-f0-9-]+\.jpg$/);
      expect(uploadResult.expiresInSeconds).toBe(900);

      const mediaRecord = await dataSource.getRepository(EventMediaEntity).findOne({
        where: { id: uploadResult.mediaId },
      });
      expect(mediaRecord).toBeDefined();
      expect(mediaRecord?.status).toBe(MediaStatus.PENDING_UPLOAD);
    });

    it('Yabancı bir kullanıcı başka birinin olayına fotoğraf eklemeye kalkışırsa ForbiddenException almalı', async () => {
      await expect(
        mediaService.generateUploadUrl(
          singleEvent.id,
          {
            fileName: 'izinsiz.png',
            mimeType: 'image/png',
            fileSize: 1024 * 100,
          },
          { sub: strangerUser.id, role: UserRole.CITIZEN, email: strangerUser.email },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('2. Gerçek Görsel Yükleme, EXIF Temizleme ve Complete Doğrulaması', () => {
    let uploadEvent: EventEntity;

    beforeAll(async () => {
      const created = await eventsService.create(testUser.id, {
        categoryId: trafficCategory.id,
        title: 'EXIF Temizleme Test Olayı',
        description: 'EXIF temizleme ve complete akışı için olay.',
        severity: EventSeverity.HIGH,
        longitude: 35.48,
        latitude: 38.72,
      });
      uploadEvent = (await dataSource.getRepository(EventEntity).findOne({ where: { id: created.id } }))!;
    });

    it('Gerçek JPEG görsel yüklenip complete çağrıldığında EXIF temizlenmeli ve WebP olarak READY olmalı', async () => {
      // 1. Presigned URL al
      const { mediaId, storageKey } = await mediaService.generateUploadUrl(
        uploadEvent.id,
        {
          fileName: 'akilli_telefon_fotografi.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024 * 150,
        },
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );

      // 2. EXIF meta verisi içeren (Kamera modeli ve GPS etiketli) gerçek bir test JPEG görseli üret
      const testImageWithExif = await sharp({
        create: {
          width: 400,
          height: 300,
          channels: 3,
          background: { r: 220, g: 38, b: 38 },
        },
      })
        .jpeg()
        .withMetadata({
          exif: {
            IFD0: {
              Make: 'GizliAkilliTelefonModeli',
              Model: 'GizliCihaz123',
            },
          },
        })
        .toBuffer();

      // Orijinal görselde EXIF olduğunu doğrula
      const originalMeta = await sharp(testImageWithExif).metadata();
      expect(originalMeta.exif).toBeDefined();

      // 3. Dosyayı MinIO depolamaya yükle
      await storageService.putObject(storageKey, testImageWithExif, 'image/jpeg');

      // 4. Complete endpointini çağır
      const completedMedia = await mediaService.completeUpload(
        uploadEvent.id,
        mediaId,
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );

      expect(completedMedia).toBeDefined();
      expect(completedMedia.status).toBe(MediaStatus.READY);
      expect(completedMedia.mimeType).toBe('image/webp');
      expect(completedMedia.width).toBe(400);
      expect(completedMedia.height).toBe(300);
      expect(completedMedia.storageKey).toMatch(/^events\/[a-f0-9-]+\/clean\/[a-f0-9-]+\.webp$/);

      // 5. KRİTİK GİZLİLİK TESTİ: Depolamadaki temizlenmiş görseli çek ve EXIF'in SİLİNDİĞİNİ kanıtla!
      const sanitizedBuffer = await storageService.getObject(completedMedia.storageKey);
      const sanitizedMeta = await sharp(sanitizedBuffer).metadata();

      expect(sanitizedMeta.format).toBe('webp');
      expect(sanitizedMeta.exif).toBeUndefined(); // EXIF tamamen temizlendi!

      // 6. Orijinal ham dosyanın depolamadan silindiğini doğrula
      const rawExists = await storageService.headObject(storageKey);
      expect(rawExists).toBeNull();
    });
  });

  describe('3. Sahte MIME / Bozuk Dosya Güvenlik Koruması', () => {
    let fakeEvent: EventEntity;

    beforeAll(async () => {
      const created = await eventsService.create(testUser.id, {
        categoryId: trafficCategory.id,
        title: 'Sahte Dosya Test Olayı',
        description: 'Sahte dosya tespiti için olay.',
        severity: EventSeverity.LOW,
        longitude: 35.48,
        latitude: 38.72,
      });
      fakeEvent = (await dataSource.getRepository(EventEntity).findOne({ where: { id: created.id } }))!;
    });

    it('MIME tipi JPEG bildirilip sahte HTML/metin yüklendiğinde Magic Bytes kontrolü reddetmeli', async () => {
      const { mediaId, storageKey } = await mediaService.generateUploadUrl(
        fakeEvent.id,
        {
          fileName: 'fake_image.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1000,
        },
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );

      const fakePayload = Buffer.from('<html><body><script>maliciousCode();</script></body></html>');
      await storageService.putObject(storageKey, fakePayload, 'image/jpeg');

      await expect(
        mediaService.completeUpload(
          fakeEvent.id,
          mediaId,
          { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
        ),
      ).rejects.toThrow(BadRequestException);

      const record = await dataSource.getRepository(EventMediaEntity).findOne({ where: { id: mediaId } });
      expect(record?.status).toBe(MediaStatus.REJECTED);
      expect(record?.rejectionReason).toContain('Magic bytes');

      const fileStillInStorage = await storageService.headObject(storageKey);
      expect(fileStillInStorage).toBeNull();
    });
  });

  describe('4. 3 Görsel Sınırı ve Eşzamanlılık Koruması', () => {
    let limitEvent: EventEntity;

    beforeAll(async () => {
      const created = await eventsService.create(testUser.id, {
        categoryId: trafficCategory.id,
        title: '3 Görsel Sınırı Test Olayı',
        description: 'Sınır testi için bağımsız olay.',
        severity: EventSeverity.MEDIUM,
        longitude: 35.48,
        latitude: 38.72,
      });
      limitEvent = (await dataSource.getRepository(EventEntity).findOne({ where: { id: created.id } }))!;
    });

    it('Bir olaya 3 aktif görsel eklendikten sonra 4. görsel talebi engellenmeli', async () => {
      // Tam 3 adet görsel ekle
      for (let i = 1; i <= 3; i++) {
        const { mediaId, storageKey } = await mediaService.generateUploadUrl(
          limitEvent.id,
          {
            fileName: `foto_${i}.png`,
            mimeType: 'image/png',
            fileSize: 1024 * 30,
          },
          { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
        );

        const dummyPng = await sharp({
          create: { width: 50, height: 50, channels: 3, background: { r: 0, g: 255, b: 0 } },
        })
          .png()
          .toBuffer();

        await storageService.putObject(storageKey, dummyPng, 'image/png');
        await mediaService.completeUpload(
          limitEvent.id,
          mediaId,
          { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
        );
      }

      // Şimdi olayda tam 3 adet READY görsel var. 4. görsel talep edildiğinde engellenmeli!
      await expect(
        mediaService.generateUploadUrl(
          limitEvent.id,
          {
            fileName: 'foto_4_asiri.jpg',
            mimeType: 'image/jpeg',
            fileSize: 1024 * 50,
          },
          { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('5. Medya Silme ve Gizlilik (DELETE & GET /events/:id/media)', () => {
    let privacyEvent: EventEntity;
    let createdMediaId: string;

    beforeAll(async () => {
      // PENDING_REVIEW durumunda olay
      const created = await eventsService.create(testUser.id, {
        categoryId: trafficCategory.id,
        title: 'Gizlilik ve Silme Test Olayı',
        description: 'Gizlilik kontrolleri için olay.',
        severity: EventSeverity.LOW,
        longitude: 35.48,
        latitude: 38.72,
      });
      privacyEvent = (await dataSource.getRepository(EventEntity).findOne({ where: { id: created.id } }))!;

      // 1 adet görsel yükle
      const { mediaId, storageKey } = await mediaService.generateUploadUrl(
        privacyEvent.id,
        {
          fileName: 'silinecek_foto.png',
          mimeType: 'image/png',
          fileSize: 1024 * 20,
        },
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );
      createdMediaId = mediaId;

      const dummyPng = await sharp({
        create: { width: 40, height: 40, channels: 3, background: { r: 0, g: 0, b: 255 } },
      })
        .png()
        .toBuffer();

      await storageService.putObject(storageKey, dummyPng, 'image/png');
      await mediaService.completeUpload(
        privacyEvent.id,
        mediaId,
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );
    });

    it('Onay bekleyen (PENDING_REVIEW) olayın medyasını anonim kullanıcı sorguladığında 404 dönmeli', async () => {
      // Anonim (user parametresi yok)
      await expect(
        mediaService.getEventMedia(privacyEvent.id, undefined),
      ).rejects.toThrow(NotFoundException);
    });

    it('Olayın yazarı kimlik doğruladığında kendi bekleyen olayının medyasını görebilmeli', async () => {
      const mediaList = await mediaService.getEventMedia(
        privacyEvent.id,
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );

      expect(mediaList.length).toBe(1);
      expect(mediaList[0]?.id).toBe(createdMediaId);
    });

    it('Medya silindiğinde depolamadan kaldırılmalı ve veritabanında DELETED işaretlenmeli', async () => {
      const deleteRes = await mediaService.deleteMedia(
        privacyEvent.id,
        createdMediaId,
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );

      expect(deleteRes.success).toBe(true);

      const record = await dataSource.getRepository(EventMediaEntity).findOne({ where: { id: createdMediaId } });
      expect(record?.status).toBe(MediaStatus.DELETED);

      const inStorage = await storageService.headObject(record!.storageKey);
      expect(inStorage).toBeNull();
    });
  });
});
