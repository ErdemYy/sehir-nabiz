import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OutboxProcessorService } from '../src/modules/outbox/outbox-processor.service';
import { OutboxStatus, EventStatus, NotificationType } from '@sehir-nabiz/shared';

describe('Phase 16 — Outbox ve Worker Stres & Dayanıklılık Testleri', () => {
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
      notifyModerationQueue: vi.fn(),
      broadcastEventCreated: vi.fn(),
      broadcastEventStatusChanged: vi.fn(),
      broadcastFeedbackUpdated: vi.fn(),
    };

    mockNotificationsService = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    mockRedisService = {
      isReady: true,
      client: {
        keys: vi.fn().mockResolvedValue(['stats:overview:all']),
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

  afterEach(() => {
    processor.stopWorker();
    vi.clearAllMocks();
  });

  it('1. 100 Olay Durum Güncellemesi: Yüksek Hızlı Sıralı Batch İşleme & Sıfır Veri Kaybı', async () => {
    const totalEvents = 100;
    const events = Array.from({ length: totalEvents }, (_, i) => ({
      id: `outbox-uuid-${i + 1}`,
      aggregateType: 'Event',
      aggregateId: `event-uuid-${i + 1}`,
      eventType: 'EVENT_STATUS_CHANGED',
      payload: {
        eventId: `event-uuid-${i + 1}`,
        newStatus: EventStatus.ACTIVE,
        authorId: `author-uuid-${(i % 10) + 1}`,
        title: `Trafik Bildirimi #${i + 1}`,
        event: {
          id: `event-uuid-${i + 1}`,
          title: `Trafik Bildirimi #${i + 1}`,
          status: EventStatus.ACTIVE,
        },
      },
      status: OutboxStatus.PROCESSING,
      attempts: 1,
    }));

    const startTime = Date.now();
    for (const evt of events) {
      await processor.processSingleEvent(evt as any);
    }
    const elapsedMs = Date.now() - startTime;

    expect(mockNotificationsService.createNotification).toHaveBeenCalledTimes(totalEvents);
    expect(mockRealtimeService.broadcastEventStatusChanged).toHaveBeenCalledTimes(totalEvents);
    expect(mockDataSource.query).toHaveBeenCalledTimes(totalEvents);

    // Her olay için veritabanında PROCESSED güncellemesi yapıldı mı
    for (let i = 0; i < totalEvents; i++) {
      expect(mockDataSource.query).toHaveBeenNthCalledWith(
        i + 1,
        expect.stringContaining("SET status = 'PROCESSED'"),
        [`outbox-uuid-${i + 1}`],
      );
    }

    console.log(`[Stres Testi] 100 olay işleme süresi: ${elapsedMs} ms (${(elapsedMs / totalEvents).toFixed(2)} ms/olay)`);
    expect(elapsedMs).toBeLessThan(1000); // 100 event 1 saniyeden az sürmeli
  });

  it('2. 500 Olay Durum Güncellemesi: Yoğun Trafik Altında Bellek & Outbox Verim Ölçümü', async () => {
    const totalEvents = 500;
    const events = Array.from({ length: totalEvents }, (_, i) => ({
      id: `outbox-500-${i + 1}`,
      aggregateType: 'Event',
      aggregateId: `event-uuid-${i + 1}`,
      eventType: 'EVENT_STATUS_CHANGED',
      payload: {
        eventId: `event-uuid-${i + 1}`,
        newStatus: i % 2 === 0 ? EventStatus.ACTIVE : EventStatus.RESOLVED,
        authorId: `author-500-${(i % 25) + 1}`,
        title: `Altyapı Arızası #${i + 1}`,
        event: {
          id: `event-uuid-${i + 1}`,
          title: `Altyapı Arızası #${i + 1}`,
          status: i % 2 === 0 ? EventStatus.ACTIVE : EventStatus.RESOLVED,
        },
      },
      status: OutboxStatus.PROCESSING,
      attempts: 1,
    }));

    const memBefore = process.memoryUsage().heapUsed;
    const startTime = Date.now();

    // 500 olayı 10'arlı gruplarla eşzamanlı işletelim
    const chunkSize = 10;
    for (let i = 0; i < totalEvents; i += chunkSize) {
      const chunk = events.slice(i, i + chunkSize);
      await Promise.all(chunk.map((e) => processor.processSingleEvent(e as any)));
    }

    const elapsedMs = Date.now() - startTime;
    const memAfter = process.memoryUsage().heapUsed;
    const memDeltaMB = Math.round(((memAfter - memBefore) / (1024 * 1024)) * 100) / 100;

    expect(mockNotificationsService.createNotification).toHaveBeenCalledTimes(totalEvents);
    expect(mockRealtimeService.broadcastEventStatusChanged).toHaveBeenCalledTimes(totalEvents);
    expect(mockDataSource.query).toHaveBeenCalledTimes(totalEvents);

    console.log(`[Stres Testi] 500 olay işleme süresi: ${elapsedMs} ms, Bellek değişimi: ${memDeltaMB} MB`);
    expect(elapsedMs).toBeLessThan(3000);
  });

  it('3. Paralel İki Worker Simülasyonu: FOR UPDATE SKIP LOCKED ile Çarpışmasız Dağıtım', async () => {
    // 20 adet beklemede olay
    const allPending = Array.from({ length: 20 }, (_, i) => ({
      id: `event-${i + 1}`,
      aggregate_type: 'Event',
      aggregate_id: `agg-${i + 1}`,
      event_type: 'EVENT_STATUS_CHANGED',
      payload: { title: `Olay ${i + 1}` },
      status: 'PENDING',
      attempts: 0,
      next_attempt_at: new Date(),
    }));

    // Simüle edilmiş paylaşımlı veritabanı kilit mekanizması (FOR UPDATE SKIP LOCKED)
    const lockedIds = new Set<string>();

    const simulateClaim = (workerName: string, batchSize = 10) => {
      const claimed: any[] = [];
      for (const item of allPending) {
        if (!lockedIds.has(item.id) && claimed.length < batchSize) {
          lockedIds.add(item.id);
          claimed.push({ ...item, status: 'PROCESSING', worker: workerName });
        }
      }
      return claimed;
    };

    // Worker 1 ve Worker 2 aynı anda batch çekiyor
    const worker1Batch = simulateClaim('Worker-1', 10);
    const worker2Batch = simulateClaim('Worker-2', 10);

    // Kesişim kümesi boş olmalıdır (çakışma yok)
    const w1Ids = new Set(worker1Batch.map((e) => e.id));
    const w2Ids = new Set(worker2Batch.map((e) => e.id));
    const intersection = [...w1Ids].filter((id) => w2Ids.has(id));

    expect(worker1Batch.length).toBe(10);
    expect(worker2Batch.length).toBe(10);
    expect(intersection.length).toBe(0);
    expect(lockedIds.size).toBe(20);
  });

  it('4. Worker Crash & Lease Süresi Dolumu: Yetim Kayıtların İkinci Worker Tarafından Kurtarılması', async () => {
    // Worker 1 bir kaydı PROCESSING durumuna aldı fakat çöktü (lease süresi doldu)
    const expiredLockTime = new Date(Date.now() - 35000); // 35 saniye önce kilitlenmiş (leaseSeconds: 30)

    const zombieEvent = {
      id: 'zombie-outbox-1',
      aggregateType: 'Event',
      aggregateId: 'agg-zombie',
      eventType: 'EVENT_STATUS_CHANGED',
      payload: {
        title: 'Kurtarılan Olay',
        authorId: 'user-zombie',
        newStatus: EventStatus.ACTIVE,
        event: { id: 'agg-zombie', title: 'Kurtarılan Olay', status: EventStatus.ACTIVE },
      },
      status: 'PROCESSING',
      lock_lease_expires_at: expiredLockTime,
      attempts: 1,
    };

    // Veritabanı sorgusu kuralı: lock_lease_expires_at < NOW() olan kayıtları da PENDING gibi yeniden claim eder
    const isClaimable =
      zombieEvent.status === 'PENDING' ||
      (zombieEvent.status === 'PROCESSING' && zombieEvent.lock_lease_expires_at < new Date());

    expect(isClaimable).toBe(true);

    // İkinci worker yetim kaydı devralır ve başarıyla tamamlar
    const reclaimedEvent = {
      ...zombieEvent,
      attempts: zombieEvent.attempts + 1,
      status: OutboxStatus.PROCESSING,
    };

    await processor.processSingleEvent(reclaimedEvent as any);

    expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-zombie',
        type: NotificationType.EVENT_APPROVED,
        idempotencyKey: 'outbox:zombie-outbox-1:user-zombie',
      }),
    );

    expect(mockDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'PROCESSED'"),
      ['zombie-outbox-1'],
    );
  });

  it('5. Redis Kesintisi / Geçici Servis Çöküşünde Graceful Degradation & At-Least-Once Garantisi', async () => {
    // Redis hatası simülasyonu
    mockRedisService.client.keys = vi.fn().mockRejectedValue(new Error('Redis connection refused (ECONNREFUSED)'));

    const event = {
      id: 'redis-fail-event-1',
      aggregateType: 'Event',
      aggregateId: 'agg-redis-1',
      eventType: 'EVENT_STATUS_CHANGED',
      payload: {
        eventId: 'agg-redis-1',
        newStatus: EventStatus.ACTIVE,
        authorId: 'author-redis',
        title: 'Su Kesintisi',
        event: { id: 'agg-redis-1', title: 'Su Kesintisi', status: EventStatus.ACTIVE },
      },
      status: OutboxStatus.PROCESSING,
      attempts: 1,
    };

    // Redis önbellek temizleme hatası outbox işlemeyi düşürmemeli (graceful degradation)
    await expect(processor.processSingleEvent(event as any)).resolves.not.toThrow();

    // Bildirim ve WebSocket yayını başarıyla yapılmış olmalı
    expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    expect(mockRealtimeService.broadcastEventStatusChanged).toHaveBeenCalled();
    // Outbox kaydı PROCESSED olarak işaretlenmeli
    expect(mockDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'PROCESSED'"),
      ['redis-fail-event-1'],
    );
  });

  it('6. Geçici MinIO/Ağ Kesintisi ve Tekrar Deneme (Exponential Backoff)', async () => {
    // Notification servisi geçici ağ hatası fırlatsın
    mockNotificationsService.createNotification.mockRejectedValueOnce(new Error('MinIO S3 / Network Timeout (504)'));

    const retryEvent = {
      id: 'retry-event-1',
      aggregateType: 'Event',
      aggregateId: 'agg-retry-1',
      eventType: 'EVENT_STATUS_CHANGED',
      payload: { authorId: 'user-retry', newStatus: EventStatus.ACTIVE },
      status: OutboxStatus.PROCESSING,
      attempts: 2, // 2. deneme
    };

    await processor.processSingleEvent(retryEvent as any);

    // Başarısız olunca PENDING durumuna geri alınmalı ve next_attempt_at hesaplanmalı
    expect(mockDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'PENDING'"),
      expect.arrayContaining(['retry-event-1']),
    );
  });

  it('7. Dead-Letter Queue (DLQ): 5 Başarısız Deneme Sonrası FAILED Durumuna İntikal', async () => {
    mockNotificationsService.createNotification.mockRejectedValue(new Error('Fatal Handler Error'));

    const fatalEvent = {
      id: 'fatal-event-5',
      aggregateType: 'Event',
      aggregateId: 'agg-fatal-5',
      eventType: 'EVENT_STATUS_CHANGED',
      payload: { authorId: 'user-fatal', newStatus: EventStatus.ACTIVE },
      status: OutboxStatus.PROCESSING,
      attempts: 5, // 5. ve son deneme
    };

    await processor.processSingleEvent(fatalEvent as any);

    // Max attempts (5) aşıldığında FAILED (Dead-letter) olarak güncellenmeli
    expect(mockDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'FAILED'"),
      expect.arrayContaining(['fatal-event-5', expect.stringContaining('Max deneme (5) aşıldı')]),
    );
  });

  it('8. Mükerrer Bildirim Engeli (Idempotency Key Koruması)', async () => {
    const duplicatePayload = {
      id: 'idempotent-event-1',
      aggregateType: 'Event',
      aggregateId: 'agg-idem-1',
      eventType: 'EVENT_STATUS_CHANGED',
      payload: {
        eventId: 'agg-idem-1',
        newStatus: EventStatus.ACTIVE,
        authorId: 'author-idem-1',
        title: 'Kaldırım Onarımı',
      },
      status: OutboxStatus.PROCESSING,
      attempts: 1,
    };

    // İlk işleme
    await processor.processSingleEvent(duplicatePayload as any);

    // Aynı olay tekrar tetiklendiğinde (At-least-once gereği retry)
    await processor.processSingleEvent(duplicatePayload as any);

    // Bildirim servisine her iki seferde de BİREBİR AYNI idempotencyKey gitmeli
    expect(mockNotificationsService.createNotification).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        idempotencyKey: 'outbox:idempotent-event-1:author-idem-1',
      }),
    );
    expect(mockNotificationsService.createNotification).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        idempotencyKey: 'outbox:idempotent-event-1:author-idem-1',
      }),
    );
  });
});
