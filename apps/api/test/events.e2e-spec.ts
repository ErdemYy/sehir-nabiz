import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import * as net from 'net';
import * as bcrypt from 'bcryptjs';
import { dataSourceOptions } from '../src/database/data-source';
import { EventsService } from '../src/modules/events/events.service';
import { CategoriesService } from '../src/modules/categories/categories.service';
import { EventEntity } from '../src/database/entities/event.entity';
import { UserEntity } from '../src/database/entities/user.entity';
import { CategoryEntity } from '../src/database/entities/category.entity';
import { EventModerationLogEntity } from '../src/database/entities/event-moderation-log.entity';
import {
  EventStatus,
  EventSeverity,
  UserRole,
  AccountStatus,
} from '@sehir-nabiz/shared';
import { BadRequestException } from '@nestjs/common';

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

describe('Coğrafi Veri ve Olay Yönetimi Canlı PostGIS Entegrasyon Testleri (E2E)', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5434', 10);

  const isPostgresUp = await isPortOpen(host, port);
  if (!isPostgresUp) {
    it.skip(`PostgreSQL servisi (${host}:${port}) kapalı: Testler atlandı.`, () => {});
    return;
  }

  let dataSource: DataSource;
  let eventsService: EventsService;
  let categoriesService: CategoriesService;

  let testUser: UserEntity;
  let testModerator: UserEntity;
  let trafficCategory: CategoryEntity;
  let waterCategory: CategoryEntity;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...(dataSourceOptions as any),
      host,
      port,
      database: 'sehir_nabiz_test',
    });
    await dataSource.initialize();
    await dataSource.runMigrations();

    const eventRepo = dataSource.getRepository(EventEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const categoryRepo = dataSource.getRepository(CategoryEntity);
    const moderationLogRepo = dataSource.getRepository(EventModerationLogEntity);

    eventsService = new EventsService(
      eventRepo,
      userRepo,
      categoryRepo,
      moderationLogRepo,
      dataSource,
    );
    categoriesService = new CategoriesService(categoryRepo);

    // Test Kullanıcıları
    const passwordHash = await bcrypt.hash('TestPassword123!', 10);
    testUser = await userRepo.save(
      userRepo.create({
        email: `citizen-events-${Date.now()}@sehirnabiz.local`,
        passwordHash,
        displayName: 'Test Vatandaş',
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
        reputationScore: 20,
      }),
    );

    testModerator = await userRepo.save(
      userRepo.create({
        email: `mod-events-${Date.now()}@sehirnabiz.local`,
        passwordHash,
        displayName: 'Test Moderatör',
        role: UserRole.MODERATOR,
        accountStatus: AccountStatus.ACTIVE,
        reputationScore: 100,
      }),
    );

    // Kategorileri veritabanından çek
    const categories = await categoryRepo.find();
    trafficCategory = categories.find(c => c.code === 'TRAFFIC')!;
    waterCategory = categories.find(c => c.code === 'WATER_OUTAGE')!;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query('TRUNCATE TABLE "event_moderation_logs", "events", "refresh_tokens", "users" CASCADE;');
      await dataSource.destroy();
    }
  });

  describe('1. Kategori Sistemi ve Veritabanı Bütünlüğü', () => {
    it('11 temel kategorinin tamamı veritabanında mevcut olmalı', async () => {
      const categories = await categoriesService.findAll();
      expect(categories.length).toBeGreaterThanOrEqual(11);

      const codes = categories.map(c => c.code);
      expect(codes).toContain('TRAFFIC');
      expect(codes).toContain('ACCIDENT');
      expect(codes).toContain('ROAD_WORK');
      expect(codes).toContain('WATER_OUTAGE');
      expect(codes).toContain('POWER_OUTAGE');
      expect(codes).toContain('INFRASTRUCTURE');
      expect(codes).toContain('PUBLIC_TRANSPORT');
      expect(codes).toContain('WEATHER');
      expect(codes).toContain('DISASTER');
      expect(codes).toContain('EVENT');
      expect(codes).toContain('OTHER');
    });

    it('Kategori görsel kimlik alanları (icon, colorHex, defaultDurationHours) eksiksiz olmalı', async () => {
      expect(trafficCategory.icon).toBeDefined();
      expect(trafficCategory.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(trafficCategory.defaultDurationHours).toBeGreaterThan(0);
    });
  });

  describe('2. PostGIS Konum Saklama ve Olay Oluşturma', () => {
    it('Olay WGS84 SRID 4326 koordinatlarıyla başarıyla kaydedilmeli ve başlangıç durumu PENDING_REVIEW olmalı', async () => {
      const created = await eventsService.create(testUser.id, {
        categoryId: trafficCategory.id,
        title: 'Kayseri Meydan Trafik Tıkanıklığı',
        description: 'Cumhuriyet Meydanı civarında araç trafiği durma noktasında.',
        severity: EventSeverity.HIGH,
        longitude: 35.4826,
        latitude: 38.7205,
        addressText: 'Cumhuriyet Meydanı, Melikgazi',
        city: 'Kayseri',
        district: 'Melikgazi',
      });

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.status).toBe(EventStatus.PENDING_REVIEW);
      expect(created.location.longitude).toBeCloseTo(35.4826, 4);
      expect(created.location.latitude).toBeCloseTo(38.7205, 4);
      expect(created.category.code).toBe('TRAFFIC');
      expect(created.author.displayName).toBe(testUser.displayName);
      // Hassas veri sızıntısı yok
      expect((created.author as any).email).toBeUndefined();
    });

    it('Veritabanında koordinatların enlem/boylam sırası doğru saklanmalı (ST_X = Longitude, ST_Y = Latitude)', async () => {
      const checkResult = await dataSource.query(`
        SELECT ST_X(location) AS lon, ST_Y(location) AS lat 
        FROM "events" 
        WHERE title = 'Kayseri Meydan Trafik Tıkanıklığı' 
        LIMIT 1;
      `);

      expect(checkResult.length).toBe(1);
      expect(parseFloat(checkResult[0].lon)).toBeCloseTo(35.4826, 4);
      expect(parseFloat(checkResult[0].lat)).toBeCloseTo(38.7205, 4);
    });
  });

  describe('3. 150 Metre ve 45 Dakika Mükerrer Bildirim Kontrolü (Duplicate Detection)', () => {
    it('150m yarıçapında ve 45 dakika içinde aynı kategoride olay oluşturulduğunda duplicate uyarısı üretmeli', async () => {
      // Orijinal olay Meydan'da (35.4826, 38.7205)
      // Yaklaşık 80 metre ötesi (35.4834, 38.7205)
      const duplicateReport = await eventsService.create(testUser.id, {
        categoryId: trafficCategory.id,
        title: 'Meydanda Araçlar Kilitlendi',
        description: 'Trafik ışıkları arızalı, araçlar ilerleyemiyor.',
        severity: EventSeverity.MEDIUM,
        longitude: 35.4834,
        latitude: 38.7205,
      });

      expect(duplicateReport.duplicateWarning).toBeDefined();
      expect(duplicateReport.duplicateWarning?.isDuplicateSuspected).toBe(true);
      expect(duplicateReport.duplicateWarning?.distanceMeters).toBeLessThanOrEqual(150);
      expect(duplicateReport.duplicateWarning?.candidateTitle).toContain('Trafik');
    });

    it('Başka bir kullanıcının PENDING_REVIEW durumundaki bildirimi için gizlilik korunmalı (başlık ve ID sızdırılmamalı)', async () => {
      // İkinci bir vatandaş kullanıcısı oluştur
      const secondCitizen = await dataSource.getRepository(UserEntity).save({
        email: `citizen-privacy-${Date.now()}@sehirnabiz.local`,
        passwordHash: 'secret-hash',
        displayName: 'İkinci Vatandaş',
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
        reputationScore: 10,
      });

      // İkinci kullanıcı 150m içinde benzer kategoride bildirim yapar
      const privacyDuplicateReport = await eventsService.create(secondCitizen.id, {
        categoryId: trafficCategory.id,
        title: 'Kavşakta Trafik Tıkandı',
        description: 'Trafik akmıyor, ikinci bildirim.',
        severity: EventSeverity.MEDIUM,
        longitude: 35.4830,
        latitude: 38.7205,
      });

      expect(privacyDuplicateReport.duplicateWarning).toBeDefined();
      expect(privacyDuplicateReport.duplicateWarning?.isDuplicateSuspected).toBe(true);
      // GİZLİLİK KORUMASI: Başka kullanıcının onaylanmamış PENDING_REVIEW olay detayları gizlenmeli
      expect(privacyDuplicateReport.duplicateWarning?.candidateTitle).toBeUndefined();
      expect(privacyDuplicateReport.duplicateWarning?.candidateId).toBeUndefined();
      expect(privacyDuplicateReport.duplicateWarning?.createdAt).toBeUndefined();
      expect(privacyDuplicateReport.duplicateWarning?.message).toBe(
        'Yakın bölgede benzer bir bildirim bulunuyor olabilir.',
      );
      expect(privacyDuplicateReport.duplicateWarning?.distanceMeters).toBeLessThanOrEqual(150);
    });

    it('Farklı bir kategoride (örn. SU KESİNTİSİ) aynı konuma bildirim yapıldığında mükerrer uyarısı üretmemeli', async () => {
      const differentCategoryReport = await eventsService.create(testUser.id, {
        categoryId: waterCategory.id,
        title: 'Meydan Parkında Boru Patlağı',
        description: 'Park sulama hattında su kaçağı var.',
        severity: EventSeverity.LOW,
        longitude: 35.4826,
        latitude: 38.7205,
      });

      expect(differentCategoryReport.duplicateWarning).toBeUndefined();
    });

    it('500 metre uzakta aynı kategoride bildirim yapıldığında mükerrer uyarısı üretmemeli', async () => {
      // Talas Bulvarı yönü ~1 km uzakta (35.4950, 38.7205)
      const farReport = await eventsService.create(testUser.id, {
        categoryId: trafficCategory.id,
        title: 'Erciyes Üniversitesi Girişi Trafik',
        description: 'Kampüs girişinde araç yoğunluğu.',
        severity: EventSeverity.LOW,
        longitude: 35.495,
        latitude: 38.7205,
      });

      expect(farReport.duplicateWarning).toBeUndefined();
    });
  });

  describe('4. Coğrafi Yarıçap (ST_DWithin) ve Mesafe (ST_Distance) Sorguları (/events/nearby)', () => {
    let activeEventId: string;

    beforeAll(async () => {
      // Bir olayı ACTIVE yap (halka açık sorgularda görünmesi için)
      const eventToActivate = await dataSource.query(`
        SELECT id FROM "events" WHERE title = 'Kayseri Meydan Trafik Tıkanıklığı' LIMIT 1;
      `);
      activeEventId = eventToActivate[0].id;

      await eventsService.updateStatus(
        activeEventId,
        { status: EventStatus.ACTIVE, reason: 'Doğrulandı' },
        { sub: testModerator.id, role: UserRole.MODERATOR, email: testModerator.email },
      );
    });

    it('Merkeze 1 km yarıçapındaki arama, Meydan olayını doğru metre mesafesiyle döndürmeli', async () => {
      // Meydanın 200m yakınından sorgu yapıyoruz
      const response = await eventsService.findNearby({
        longitude: 35.484,
        latitude: 38.7205,
        radiusMeters: 1000,
        limit: 10,
      });

      expect(response.items.length).toBeGreaterThanOrEqual(1);
      const found = response.items.find(e => e.id === activeEventId);
      expect(found).toBeDefined();
      expect(found?.distanceMeters).toBeDefined();
      expect(found?.distanceMeters).toBeLessThan(500);
      expect(found?.distanceMeters).toBeGreaterThan(50);
    });

    it('Merkezden çok uzaktaki (50 km) bir noktadan 1 km yarıçapında sıfır sonuç dönmeli', async () => {
      // Develi / Erciyes Güneyi (35.48, 38.35) - yaklaşık 40 km güneyde
      const response = await eventsService.findNearby({
        longitude: 35.48,
        latitude: 38.35,
        radiusMeters: 1000,
        limit: 10,
      });

      expect(response.items.length).toBe(0);
    });

    it('Onay bekleyen (PENDING_REVIEW) olaylar halka açık /nearby sorgusunda ASLA görünmemeli', async () => {
      // Su kesintisi olayı PENDING_REVIEW durumunda
      const response = await eventsService.findNearby({
        longitude: 35.4826,
        latitude: 38.7205,
        radiusMeters: 5000,
        category: 'WATER_OUTAGE',
        limit: 10,
      });

      // Halka açık sorguda PENDING_REVIEW olay listelenmez
      expect(response.items.length).toBe(0);
    });

    it('Moderatör yetkisiyle /nearby sorgulandığında PENDING_REVIEW olaylar listelenebilmeli', async () => {
      const response = await eventsService.findNearby(
        {
          longitude: 35.4826,
          latitude: 38.7205,
          radiusMeters: 5000,
          status: EventStatus.PENDING_REVIEW,
          limit: 10,
        },
        { sub: testModerator.id, role: UserRole.MODERATOR, email: testModerator.email },
      );

      expect(response.items.length).toBeGreaterThanOrEqual(1);
      expect(response.items.every(e => e.status === EventStatus.PENDING_REVIEW)).toBe(true);
    });
  });

  describe('5. Harita Bounding Box (ST_MakeEnvelope) Sorguları (/events/bbox)', () => {
    it('Kayseri sınırlarını kapsayan bounding box sorgusu aktif olayları döndürmeli', async () => {
      const response = await eventsService.findBBox({
        west: 35.4,
        south: 38.65,
        east: 35.55,
        north: 38.75,
        limit: 20,
      });

      expect(response.items.length).toBeGreaterThanOrEqual(1);
      expect(response.items.every(e => e.status !== EventStatus.REJECTED)).toBe(true);
    });

    it('Ankara sınırlarını kapsayan bounding box sorgusunda Kayseri olayları dönmemeli', async () => {
      const response = await eventsService.findBBox({
        west: 32.7,
        south: 39.8,
        east: 33.0,
        north: 40.0,
        limit: 20,
      });

      expect(response.items.length).toBe(0);
    });

    it('Uluslararası tarih çizgisini aşan (west > east) bounding box sorgusu hatasız çalışmalı', async () => {
      const response = await eventsService.findBBox({
        west: 175.0,
        south: -40.0,
        east: -175.0,
        north: -35.0,
        limit: 10,
      });

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
    });

    it('Güney enlemi kuzey enleminden büyük olduğunda BadRequestException fırlatmalı', async () => {
      await expect(
        eventsService.findBBox({
          west: 35.4,
          south: 40.0, // south > north
          east: 35.5,
          north: 38.0,
          limit: 20,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('6. Olay Yaşam Döngüsü ve Moderasyon Denetim İzi (Audit Trail)', () => {
    it('Moderatör onayladığında audit trail kaydı eksiksiz oluşturulmalı', async () => {
      // Bekleyen su kesintisi olayını bul
      const pendingEvent = await dataSource.query(`
        SELECT id FROM "events" WHERE status = 'PENDING_REVIEW' LIMIT 1;
      `);
      expect(pendingEvent.length).toBe(1);
      const eventId = pendingEvent[0].id;

      const updated = await eventsService.updateStatus(
        eventId,
        { status: EventStatus.ACTIVE, reason: 'Fotoğraf ve konum teyit edildi' },
        { sub: testModerator.id, role: UserRole.MODERATOR, email: testModerator.email },
      );

      expect(updated.status).toBe(EventStatus.ACTIVE);

      // Denetim logunu incele
      const logs = await eventsService.getModerationLogs(eventId);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0]?.previousStatus).toBe(EventStatus.PENDING_REVIEW);
      expect(logs[0]?.newStatus).toBe(EventStatus.ACTIVE);
      expect(logs[0]?.moderatorId).toBe(testModerator.id);
      expect(logs[0]?.reason).toBe('Fotoğraf ve konum teyit edildi');
    });

    it('Yazar kendi olayını çözüldü (RESOLVED) yaptığında resolvedAt tarihi atanmalı', async () => {
      const activeEvent = await dataSource.query(`
        SELECT id FROM "events" WHERE status = 'ACTIVE' AND "authorId" = $1 LIMIT 1;
      `, [testUser.id]);
      expect(activeEvent.length).toBe(1);
      const eventId = activeEvent[0].id;

      const resolved = await eventsService.updateStatus(
        eventId,
        { status: EventStatus.RESOLVED, reason: 'Trafik normale döndü' },
        { sub: testUser.id, role: UserRole.CITIZEN, email: testUser.email },
      );

      expect(resolved.status).toBe(EventStatus.RESOLVED);
      expect(resolved.resolvedAt).toBeDefined();
    });
  });

  describe('7. GiST Uzamsal İndeks (Spatial Index) Doğrulaması', () => {
    it('Veritabanında idx_events_location_gist GiST indeksi aktif ve kullanılabilir olmalı', async () => {
      const indexResult = await dataSource.query(`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'events' AND indexname = 'idx_events_location_gist';
      `);

      expect(indexResult.length).toBe(1);
      expect(indexResult[0].indexdef).toContain('USING gist (location)');
    });
  });
});
