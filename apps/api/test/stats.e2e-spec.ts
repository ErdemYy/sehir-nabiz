import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Phase 10: Stats, Heatmap, Search ve Kullanıcı Olayları Canlı E2E Testleri', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let citizenToken: string;
  let citizenUserId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    dataSource = app.get(DataSource);

    // Test kategorisi temin et
    const catRows = await dataSource.query(`SELECT id FROM "categories" WHERE is_active = true LIMIT 1;`);
    testCategoryId = catRows[0]?.id;

    // Test kullanıcısı oluştur ve giriş yap
    const testEmail = `phase10_test_${Date.now()}@sehirnabiz.local`;
    const regRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        displayName: 'Phase 10 Test Kullanıcısı',
      })
      .expect(201);

    citizenToken = regRes.body.tokens.accessToken;
    citizenUserId = regRes.body.user.id;

    // Canlı test olayları ekle: 1 aktif, 1 çözülmüş, 1 incelemede (PENDING_REVIEW)
    await dataSource.query(
      `
      INSERT INTO "events" (
        "id", "authorId", "categoryId", "title", "description", "severity", "status",
        "location", "city", "district", "addressText", "confirmationCount", "reliabilityScore", "expiresAt", "createdAt", "updatedAt"
      ) VALUES
      (
        gen_random_uuid(), $1, $2, 'Kayseri Cumhuriyet Meydanı Tramvay Arızası',
        'Meydan durağında sinyalizasyon çalışması nedeniyle seferler gecikmeli yapılmaktadır.',
        'MEDIUM', 'ACTIVE',
        ST_SetSRID(ST_MakePoint(35.485, 38.725), 4326),
        'Kayseri', 'Melikgazi', 'Cumhuriyet Meydanı', 8, 1.2,
        NOW() + INTERVAL '24 hours', NOW() - INTERVAL '2 hours', NOW()
      ),
      (
        gen_random_uuid(), $1, $2, 'Erciyes Yolu Kar Temizleme Tamamlandı',
        'Erciyes kayak merkezi bağlantı yolu Karayolları ekiplerince açıldı.',
        'LOW', 'RESOLVED',
        ST_SetSRID(ST_MakePoint(35.510, 38.650), 4326),
        'Kayseri', 'Melikgazi', 'Erciyes Yolu', 15, 1.5,
        NOW() + INTERVAL '24 hours', NOW() - INTERVAL '5 hours', NOW()
      ),
      (
        gen_random_uuid(), $1, $2, 'Gizli İnceleme Bekleyen Olay',
        'Bu olay henüz moderatör tarafından onaylanmadı, kamuya sızmamalı.',
        'HIGH', 'PENDING_REVIEW',
        ST_SetSRID(ST_MakePoint(35.490, 38.730), 4326),
        'Kayseri', 'Kocasinan', 'İstasyon Cad.', 0, 1.0,
        NOW() + INTERVAL '24 hours', NOW() - INTERVAL '1 hour', NOW()
      );
      `,
      [citizenUserId, testCategoryId],
    );
  });

  afterAll(async () => {
    // Test verilerini temizle
    if (citizenUserId) {
      await dataSource.query(`DELETE FROM "events" WHERE "authorId" = $1;`, [citizenUserId]);
      await dataSource.query(`DELETE FROM "users" WHERE "id" = $1;`, [citizenUserId]);
    }
    await app.close();
  });

  describe('1. Şehir İstatistikleri Özeti (GET /api/v1/stats/overview)', () => {
    it('Kayseri için genel istatistikleri ve disclaimer metnini döndürmeli', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stats/overview?city=Kayseri&period=7d')
        .expect(200);

      expect(res.body.city).toBe('Kayseri');
      expect(res.body.totalEvents).toBeGreaterThanOrEqual(2);
      expect(res.body.activeEvents).toBeGreaterThanOrEqual(1);
      expect(res.body.resolvedEvents).toBeGreaterThanOrEqual(1);
      expect(res.body.resolutionRate).toBeGreaterThanOrEqual(0);
      expect(res.body.categoryDistribution).toBeInstanceOf(Array);
      expect(res.body.timeline).toBeInstanceOf(Array);
      expect(res.body.districtComparison).toBeInstanceOf(Array);
      expect(res.body.disclaimer).toContain('tüm gerçek olayların eksiksiz kaydını temsil etmez');
    });

    it('gizli (PENDING_REVIEW) olayları kamu istatistiklerine dahil etmemeli', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stats/overview?city=Kayseri&period=24h')
        .expect(200);

      // Toplam public olay sayısı (ACTIVE + RESOLVED), PENDING_REVIEW olay hariç tutulmalıdır
      expect(res.body.activeEvents + res.body.resolvedEvents).toBe(res.body.totalEvents);
    });
  });

  describe('2. Coğrafi Yoğunluk / Isı Haritası (GET /api/v1/stats/heatmap)', () => {
    it('BBox sınırları içindeki olayları ızgara bazlı kümeleyerek dönmeli', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/stats/heatmap?minLng=35.40&minLat=38.60&maxLng=35.60&maxLat=38.80&period=7d')
        .expect(200);

      expect(res.body.totalPoints).toBeGreaterThanOrEqual(2);
      expect(res.body.aggregatedClusterCount).toBeGreaterThanOrEqual(1);
      expect(res.body.points).toBeInstanceOf(Array);
      expect(res.body.points[0]?.weight).toBeGreaterThanOrEqual(0.1);
      expect(res.body.points[0]?.weight).toBeLessThanOrEqual(1.0);
      expect(res.body.disclaimer).toContain('resmî tehlike veya risk haritası değildir');
    });
  });

  describe('3. Olay Arama (GET /api/v1/events/search)', () => {
    it('Türkçe karakterler içeren aramalarda büyük/küçük harf duyarsız eşleşmeli', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/search?q=tramvay')
        .expect(200);

      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.items[0]?.title).toContain('Tramvay');
    });

    it('arama sonuçlarında kamuya açık olmayan (PENDING_REVIEW) olaylar sızmamalı', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/search?q=Gizli')
        .expect(200);

      expect(res.body.items).toHaveLength(0);
    });

    it('2 karakterden kısa aramalarda 400 Bad Request dönmeli', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/events/search?q=a')
        .expect(400);
    });
  });

  describe('4. Kullanıcı Katkı İstatistikleri (GET /api/v1/users/me/stats)', () => {
    it('oturum açmış kullanıcının gerçek katkı sayılarını ve itibar seviyesini dönmeli', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      expect(res.body.reportedCount).toBe(3); // 3 olay eklemiştik
      expect(res.body.resolvedCount).toBe(1); // 1 tanesi çözülmüştü
      expect(res.body.reputationScore).toBeDefined();
      expect(res.body.reputationLevel).toBeDefined();
    });

    it('oturum açmamış isteklerde 401 Unauthorized dönmeli', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .expect(401);
    });
  });

  describe('5. Kullanıcının Kendi Olayları (GET /api/v1/users/me/events)', () => {
    it('kullanıcının kendi PENDING_REVIEW, ACTIVE ve RESOLVED olaylarını dönmeli', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me/events')
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      expect(res.body.items).toHaveLength(3);
      const statuses = res.body.items.map((i: any) => i.status);
      expect(statuses).toContain('PENDING_REVIEW');
      expect(statuses).toContain('ACTIVE');
      expect(statuses).toContain('RESOLVED');
    });

    it('status parametresi ile filtrelenebilmeli', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me/events?status=ACTIVE')
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]?.status).toBe('ACTIVE');
    });
  });
});
