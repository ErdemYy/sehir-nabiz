import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OutboxProcessorService } from '../src/modules/outbox/outbox-processor.service';
import { PiiScrubber } from '../src/common/utils/pii-scrubber.util';
import { DiagnosticsGuard } from '../src/modules/health/guards/diagnostics.guard';
import { HealthController } from '../src/modules/health/health.controller';
import { validateEnvironment } from '../src/config/env.validation';
import { EventStatus, OutboxStatus } from '@sehir-nabiz/shared';
import { ForbiddenException } from '@nestjs/common';

describe('Phase 17 — Dağıtık Sistem Güvenilirliği, Outbox Teslimat Garantisi & Güvenlik Sertleştirmesi', () => {
  describe('1. Outbox Kanal Teslimat Semantiği & Redis Kesintisi Davranışı', () => {
    let processor: OutboxProcessorService;
    let mockDataSource: any;
    let mockRealtimeService: any;
    let mockNotificationsService: any;
    let mockRedisService: any;

    beforeEach(() => {
      mockDataSource = {
        query: vi.fn().mockResolvedValue([]),
        transaction: vi.fn(),
      };
      mockRealtimeService = {
        broadcastEventStatusChanged: vi.fn(),
        broadcastEventCreated: vi.fn(),
        notifyModerationQueue: vi.fn(),
        broadcastFeedbackUpdated: vi.fn(),
      };
      mockNotificationsService = {
        createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
      };
      mockRedisService = {
        isReady: true,
        client: {
          keys: vi.fn().mockResolvedValue(['stats:overview:1']),
          del: vi.fn().mockResolvedValue(1),
        },
      };

      processor = new OutboxProcessorService(
        mockDataSource,
        mockRealtimeService,
        mockNotificationsService,
        mockRedisService,
      );
    });

    it('Başarılı olay durum değişikliğinde tüm kanallar DELIVERED olarak raporlanmalı ve PROCESSED işaretlenmeli', async () => {
      const event: any = {
        id: 'outbox-evt-1',
        aggregateType: 'Event',
        aggregateId: 'agg-evt-1',
        eventType: 'EVENT_STATUS_CHANGED',
        payload: {
          eventId: 'agg-evt-1',
          newStatus: EventStatus.ACTIVE,
          authorId: 'author-uuid-1',
          title: 'Yol Çalışması Tamamlandı',
          event: { id: 'agg-evt-1', status: EventStatus.ACTIVE, title: 'Yol Çalışması Tamamlandı' },
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
      };

      await processor.processSingleEvent(event);

      // Veritabanı bildirimi ve WebSocket çağrılmış olmalı
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
      expect(mockRealtimeService.broadcastEventStatusChanged).toHaveBeenCalled();
      expect(mockRedisService.client.del).toHaveBeenCalled();

      // outbox_events PROCESSED yapılmış ve _channelDeliveries kaydedilmiş olmalı
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'PROCESSED'"),
        ['outbox-evt-1'],
      );

      expect(event.payload._channelDeliveries).toBeDefined();
      expect(event.payload._channelDeliveries.inAppNotification).toBe('DELIVERED');
      expect(event.payload._channelDeliveries.websocketBroadcast).toBe('DELIVERED');
      expect(event.payload._channelDeliveries.redisPubSub).toBe('DELIVERED');
      expect(event.payload._channelDeliveries.cacheInvalidation).toBe('DELIVERED');
    });

    it('Redis kesintisinde kalıcı DB bildirimi kaybolmamalı, redisPubSub DEGRADED işaretlenmeli ve outbox güvenle tamamlanmalı', async () => {
      mockRedisService.isReady = false; // Redis çevrimdışı
      mockRedisService.client.keys = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      const event: any = {
        id: 'outbox-redis-down-1',
        aggregateType: 'Event',
        aggregateId: 'agg-evt-2',
        eventType: 'EVENT_STATUS_CHANGED',
        payload: {
          eventId: 'agg-evt-2',
          newStatus: EventStatus.ACTIVE,
          authorId: 'author-uuid-2',
          title: 'Ana Su Borusu Arızası',
          event: { id: 'agg-evt-2', status: EventStatus.ACTIVE, title: 'Ana Su Borusu Arızası' },
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
      };

      await processor.processSingleEvent(event);

      // Zorunlu in-app bildirim DB'ye başarıyla yazıldı
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'author-uuid-2',
          idempotencyKey: 'outbox:outbox-redis-down-1:author-uuid-2',
        }),
      );

      // Redis kesintisi graceful degradation ile kaydedildi
      expect(event.payload._channelDeliveries.inAppNotification).toBe('DELIVERED');
      expect(event.payload._channelDeliveries.redisPubSub).toBe('DEGRADED');
      expect(event.payload._channelDeliveries.cacheInvalidation).toBe('DEGRADED');

      // Outbox kaydı veri kaybı olmadan PROCESSED işaretlendi
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'PROCESSED'"),
        ['outbox-redis-down-1'],
      );
    });

    it('Zorunlu veritabanı bildirimi başarısız olduğunda Outbox PROCESSED yapılmamalı, PENDING ile retry edilmeli', async () => {
      // DB bildirim yazma hatası
      mockNotificationsService.createNotification.mockRejectedValueOnce(
        new Error('PostgreSQL connection lost / query timeout'),
      );

      const event: any = {
        id: 'outbox-db-fail-1',
        aggregateType: 'Event',
        aggregateId: 'agg-evt-3',
        eventType: 'EVENT_STATUS_CHANGED',
        payload: {
          eventId: 'agg-evt-3',
          newStatus: EventStatus.ACTIVE,
          authorId: 'author-uuid-3',
          title: 'Kaza Bildirimi',
          event: { id: 'agg-evt-3', status: EventStatus.ACTIVE, title: 'Kaza Bildirimi' },
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
      };

      await processor.processSingleEvent(event);

      // ASLA PROCESSED OLMAMALI! PENDING ile retry kuyruğuna alınmalı
      expect(mockDataSource.query).not.toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'PROCESSED'"),
        expect.anything(),
      );

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'PENDING'"),
        expect.arrayContaining(['outbox-db-fail-1', expect.any(Number), 'PostgreSQL connection lost / query timeout']),
      );

      expect(event.payload._channelDeliveries.inAppNotification).toBe('FAILED');
      expect(event.payload._channelDeliveries.error).toContain('PostgreSQL connection lost');
    });
  });

  describe('2. Worker Crash Recovery & Idempotency Koruması', () => {
    it('Worker bildirim oluşturduktan sonra çökerse, ikinci worker tekil idempotency_key ile mükerrer bildirim oluşturmamalı', async () => {
      // Simüle edilen bildirim deposu
      const notificationsStore = new Map<string, any>();

      const mockNotificationsServiceWithStore = {
        createNotification: vi.fn(async (params: any) => {
          if (notificationsStore.has(params.idempotencyKey)) {
            // İdempotency kalkanı: Mevcut kaydı döndür, mükerrer yazma
            return notificationsStore.get(params.idempotencyKey);
          }
          const created = { id: `notif-${Date.now()}`, ...params };
          notificationsStore.set(params.idempotencyKey, created);
          return created;
        }),
      };

      const mockDataSource = {
        query: vi.fn().mockResolvedValue([]),
        transaction: vi.fn(),
      };

      const outboxEvent = {
        id: 'crash-outbox-event-1',
        aggregateType: 'Event',
        aggregateId: 'agg-crash-1',
        eventType: 'EVENT_STATUS_CHANGED',
        payload: {
          eventId: 'agg-crash-1',
          authorId: 'user-crash-author',
          newStatus: EventStatus.ACTIVE,
          title: 'Yol Çalışması',
          event: { id: 'agg-crash-1', status: EventStatus.ACTIVE, title: 'Yol Çalışması' },
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
      };

      // Worker 1 bildirimi yazar
      await mockNotificationsServiceWithStore.createNotification({
        userId: 'user-crash-author',
        title: 'Bildirim',
        body: 'Gövde',
        eventId: 'agg-crash-1',
        idempotencyKey: `outbox:crash-outbox-event-1:user-crash-author`,
      });

      expect(notificationsStore.size).toBe(1);

      // Worker 1 aniden çöker (process crash), outbox_events PROCESSED işaretlenemez.
      // 30 saniye sonra lease süresi dolar (lock_lease_expires_at < NOW()).
      // İkinci worker kaydı devralır ve işler:
      const worker2 = new OutboxProcessorService(
        mockDataSource as any,
        undefined,
        mockNotificationsServiceWithStore as any,
        undefined,
      );

      const reclaimedEvent = {
        ...outboxEvent,
        attempts: 2,
      };

      await worker2.processSingleEvent(reclaimedEvent as any);

      // İkinci çalıştırmada notificationsStore boyutu HALA 1 olmalıdır (Mükerrer bildirim engellendi!)
      expect(notificationsStore.size).toBe(1);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'PROCESSED'"),
        ['crash-outbox-event-1'],
      );
    });
  });

  describe('3. Diagnostics ve Readiness Güvenlik İzolasyonu', () => {
    it('Kamusal ters vekil üzerinden (X-Forwarded-For) gelen /health/ready istekleri iç altyapıyı (DB, Redis, S3) ifşa etmemeli', async () => {
      const mockDataSource = { isInitialized: true };
      const mockRedisService = { isReady: true };
      const mockStorageService = { checkHealth: () => Promise.resolve(true) };

      const controller = new HealthController(
        mockDataSource as any,
        mockRedisService as any,
        mockStorageService as any,
      );

      // Kamusal ters vekil isteği simülasyonu
      const publicReq: any = {
        headers: {
          'x-forwarded-for': '203.0.113.195',
          'user-agent': 'Mozilla/5.0 Public User',
        },
      };

      const publicReady = await controller.getReadiness(publicReq);
      expect(publicReady.status).toBe('ok');
      expect(publicReady.timestamp).toBeDefined();

      // İç servis bilgileri ifşa edilmemeli!
      expect(publicReady.database).toBeUndefined();
      expect(publicReady.redis).toBeUndefined();
      expect(publicReady.storage).toBeUndefined();

      // Dahili çağrıda veya testte detaylar sağlanmalı
      const internalReady = await controller.getReadiness();
      expect(internalReady.database).toBe('connected');
      expect(internalReady.redis).toBe('connected');
      expect(internalReady.storage).toBe('connected');
    });

    it('DiagnosticsGuard zamanlama saldırılarına karşı timingSafeEqual ve secret rotation desteklemeli', async () => {
      // Virgülle ayrılmış iki aktif anahtar (Zero-downtime secret rotation)
      const currentSecret = 'new_production_diagnostics_secret_token_key_2026!';
      const oldSecret = 'old_expiring_diagnostics_secret_token_key_2026!';
      const rotationConfig = `${currentSecret},${oldSecret}`;

      const mockConfig: any = {
        get: (key: string) => {
          if (key === 'DIAGNOSTICS_SECRET') return rotationConfig;
          if (key === 'NODE_ENV') return 'staging';
          return null;
        },
      };

      const guard = new DiagnosticsGuard(mockConfig);

      const createCtx = (headers: Record<string, string>) => ({
        switchToHttp: () => ({
          getRequest: () => ({ headers, socket: { remoteAddress: '127.0.0.1' } }),
        }),
      } as any);

      // Hem yeni hem eski secret kabul edilmeli
      expect(await guard.canActivate(createCtx({ 'x-diagnostics-key': currentSecret }))).toBe(true);
      expect(await guard.canActivate(createCtx({ 'x-diagnostics-key': oldSecret }))).toBe(true);

      // Yanlış anahtar reddedilmeli
      await expect(guard.canActivate(createCtx({ 'x-diagnostics-key': 'malicious_attacker_key' }))).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Üretim ve Staging ortamında DIAGNOSTICS_SECRET tanımlı değilse fail-closed davranmalı', async () => {
      const emptyConfig: any = {
        get: (key: string) => {
          if (key === 'NODE_ENV') return 'production';
          return null;
        },
      };

      const guard = new DiagnosticsGuard(emptyConfig);
      const ctx: any = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: { 'x-diagnostics-key': 'some_key' }, socket: {} }),
        }),
      };

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('4. Kişisel Veri Arındırma (PiiScrubber) Doğrulaması', () => {
    it('Türkiye cep telefonları, sabit hatlar, e-postalar ve TCKN doğru şekilde maskelenmeli', () => {
      const rawText =
        'Kaza oldu, lütfen beni 0532 123 45 67 veya +90 542 987 65 43 numarasından arayın. ' +
        'Sabit hat: (0212) 345 67 89. E-posta: vatandas.ahmet@ornek.com. TCKN: 12345678901.';

      const scrubbed = PiiScrubber.scrub(rawText);

      expect(scrubbed).not.toContain('0532 123 45 67');
      expect(scrubbed).not.toContain('+90 542 987 65 43');
      expect(scrubbed).not.toContain('(0212) 345 67 89');
      expect(scrubbed).not.toContain('vatandas.ahmet@ornek.com');
      expect(scrubbed).not.toContain('12345678901');

      expect(scrubbed).toContain('[Telefon Gizlendi]');
      expect(scrubbed).toContain('[E-posta Gizlendi]');
      expect(scrubbed).toContain('[Kimlik No Gizlendi]');
    });

    it('Tarihler, koordinatlar, posta kodları ve ölçü birimleri yanlış pozitif olarak maskelenmemeli', () => {
      const nonPiiText =
        'Tarih: 2026-10-29. Konum koordinatları: 41.0082, 28.9784. Posta kodu: 34100. ' +
        'Olay yeri mesafesi: 50 metre, etkilenen yaklaşık 1500 kişi.';

      const scrubbed = PiiScrubber.scrub(nonPiiText);

      expect(scrubbed).toContain('2026-10-29');
      expect(scrubbed).toContain('41.0082, 28.9784');
      expect(scrubbed).toContain('34100');
      expect(scrubbed).toContain('50 metre');
      expect(scrubbed).toContain('1500 kişi');
      expect(scrubbed).not.toContain('[Telefon Gizlendi]');
      expect(scrubbed).not.toContain('[Kimlik No Gizlendi]');
    });
  });

  describe('5. Fail-Closed Production Configuration Validation', () => {
    it('Üretim (production) ortamında varsayılan dev şifresi, localhost veya wildcard CORS kullanıldığında fail-closed olmalı', () => {
      // 1. Localhost veritabanı denemesi
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'production',
          DB_HOST: '127.0.0.1',
          DB_PASSWORD: 'strong_prod_password_here_1234!',
          JWT_ACCESS_SECRET: 'production_access_secret_with_more_than_48_bytes_length_2026!',
          JWT_REFRESH_SECRET: 'production_refresh_secret_with_more_than_48_bytes_length_2026!',
          CORS_ORIGIN: 'https://sehirnabiz.com',
          REDIS_PASSWORD: 'strong_redis_password_1234!',
          STORAGE_ENDPOINT: 'https://s3.eu-central-1.amazonaws.com',
          STORAGE_ACCESS_KEY: 'prod_key',
          STORAGE_SECRET_KEY: 'prod_secret',
          DIAGNOSTICS_SECRET: 'prod_diagnostics_secret_32_characters_minimum!',
        }),
      ).toThrow('[ProductionSecurityError]');

      // 2. Wildcard CORS denemesi
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'production',
          DB_HOST: 'postgres.cluster.internal',
          DB_PASSWORD: 'strong_prod_password_here_1234!',
          JWT_ACCESS_SECRET: 'production_access_secret_with_more_than_48_bytes_length_2026!',
          JWT_REFRESH_SECRET: 'production_refresh_secret_with_more_than_48_bytes_length_2026!',
          CORS_ORIGIN: '*',
          REDIS_PASSWORD: 'strong_redis_password_1234!',
          STORAGE_ENDPOINT: 'https://s3.eu-central-1.amazonaws.com',
          STORAGE_ACCESS_KEY: 'prod_key',
          STORAGE_SECRET_KEY: 'prod_secret',
          DIAGNOSTICS_SECRET: 'prod_diagnostics_secret_32_characters_minimum!',
        }),
      ).toThrow(/\[SecurityError\]|\[ProductionSecurityError\]/);

      // 3. Eksik veya varsayılan dev şifresi
      expect(() =>
        validateEnvironment({
          NODE_ENV: 'production',
          DB_HOST: 'postgres.cluster.internal',
          DB_PASSWORD: 'postgres_secure_dev_password', // Dev default
          JWT_ACCESS_SECRET: 'production_access_secret_with_more_than_48_bytes_length_2026!',
          JWT_REFRESH_SECRET: 'production_refresh_secret_with_more_than_48_bytes_length_2026!',
          CORS_ORIGIN: 'https://sehirnabiz.com',
          REDIS_PASSWORD: 'strong_redis_password_1234!',
          STORAGE_ENDPOINT: 'https://s3.eu-central-1.amazonaws.com',
          STORAGE_ACCESS_KEY: 'prod_key',
          STORAGE_SECRET_KEY: 'prod_secret',
          DIAGNOSTICS_SECRET: 'prod_diagnostics_secret_32_characters_minimum!',
        }),
      ).toThrow('[ProductionSecurityError]');
    });

    it('Tüm üretim kriterleri sağlandığında konfigürasyon başarıyla onaylanmalı', () => {
      const validProdConfig = {
        NODE_ENV: 'production',
        DB_HOST: 'postgres.cluster.internal',
        DB_PASSWORD: 'strong_prod_password_here_1234!',
        JWT_ACCESS_SECRET: 'production_access_secret_with_more_than_48_bytes_length_2026!',
        JWT_REFRESH_SECRET: 'production_refresh_secret_with_more_than_48_bytes_length_2026!',
        CORS_ORIGIN: 'https://sehirnabiz.com,https://app.sehirnabiz.com',
        REDIS_HOST: 'redis.cluster.internal',
        REDIS_PASSWORD: 'strong_redis_password_1234!',
        STORAGE_ENDPOINT: 'https://s3.eu-central-1.amazonaws.com',
        STORAGE_ACCESS_KEY: 'prod_aws_access_key',
        STORAGE_SECRET_KEY: 'prod_aws_secret_key',
        DIAGNOSTICS_SECRET: 'prod_diagnostics_secret_32_characters_minimum!',
      };

      const result = validateEnvironment(validProdConfig);
      expect(result.NODE_ENV).toBe('production');
      expect(result.DB_HOST).toBe('postgres.cluster.internal');
      expect(result.CORS_ORIGIN).toBe('https://sehirnabiz.com,https://app.sehirnabiz.com');
    });
  });
});
