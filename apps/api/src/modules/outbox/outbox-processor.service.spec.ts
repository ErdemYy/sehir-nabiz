import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OutboxProcessorService } from './outbox-processor.service';
import { OutboxStatus, EventStatus, NotificationType } from '@sehir-nabiz/shared';

describe('OutboxProcessorService (Unit Tests)', () => {
  let service: OutboxProcessorService;
  let mockDataSource: any;
  let mockRealtimeService: any;
  let mockNotificationsService: any;
  let mockRedisService: any;

  beforeEach(() => {
    mockDataSource = {
      query: vi.fn(),
      transaction: vi.fn(async (cb: any) =>
        cb({
          query: vi.fn().mockResolvedValue([]),
          create: vi.fn((_cls: any, obj: any) => obj),
        }),
      ),
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
        keys: vi.fn().mockResolvedValue(['stats:overview:kayseri:7d']),
        del: vi.fn().mockResolvedValue(1),
      },
    };

    service = new OutboxProcessorService(
      mockDataSource,
      mockRealtimeService,
      mockNotificationsService,
      mockRedisService,
    );
  });

  afterEach(() => {
    service.stopWorker();
  });

  describe('processSingleEvent', () => {
    it('başarılı EVENT_STATUS_CHANGED olayını PROCESSED olarak işaretlemeli ve bildirim üretmeli', async () => {
      const mockEvent: any = {
        id: 'outbox-uuid-1',
        aggregateType: 'Event',
        aggregateId: 'event-uuid-100',
        eventType: 'EVENT_STATUS_CHANGED',
        payload: {
          eventId: 'event-uuid-100',
          newStatus: EventStatus.ACTIVE,
          authorId: 'author-uuid-1',
          title: 'Yol Çökmesi',
        },
        status: OutboxStatus.PROCESSING,
        attempts: 1,
      };

      await service.processSingleEvent(mockEvent);

      // 1. Notification çağrıldı mı (idempotency key ile)
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'author-uuid-1',
          type: NotificationType.EVENT_APPROVED,
          eventId: 'event-uuid-100',
          idempotencyKey: 'outbox:outbox-uuid-1:author-uuid-1',
        }),
      );

      // 2. DB'de PROCESSED yapıldı mı
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining(`UPDATE outbox_events`),
        ['outbox-uuid-1'],
      );
    });

    it('hata durumunda exponential backoff ile PENDING durumuna geri almalı', async () => {
      const mockEvent: any = {
        id: 'outbox-uuid-2',
        aggregateType: 'Event',
        aggregateId: 'event-uuid-200',
        eventType: 'EVENT_STATUS_CHANGED',
        payload: {
          authorId: 'author-uuid-2',
        },
        status: OutboxStatus.PROCESSING,
        attempts: 2, // 2. deneme
      };

      mockNotificationsService.createNotification.mockRejectedValueOnce(
        new Error('Push ağ hatası'),
      );

      await service.processSingleEvent(mockEvent);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining(`SET status = 'PENDING'`),
        expect.arrayContaining(['outbox-uuid-2', expect.any(Number), 'Push ağ hatası']),
      );
    });

    it('maksimum deneme sayısına (5) ulaşıldığında olayı FAILED (dead-letter) durumuna almalı', async () => {
      const mockEvent: any = {
        id: 'outbox-uuid-dead',
        aggregateType: 'Event',
        aggregateId: 'event-uuid-300',
        eventType: 'EVENT_STATUS_CHANGED',
        payload: {
          authorId: 'author-uuid-3',
        },
        status: OutboxStatus.PROCESSING,
        attempts: 5, // 5. deneme (sınır)
      };

      mockNotificationsService.createNotification.mockRejectedValueOnce(
        new Error('Kalıcı veritabanı kilitlenme hatası'),
      );

      await service.processSingleEvent(mockEvent);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining(`SET status = 'FAILED'`),
        expect.arrayContaining(['outbox-uuid-dead', expect.stringContaining('Max deneme (5) aşıldı')]),
      );
    });
  });

  describe('Worker Yaşam Döngüsü', () => {
    it('startWorker ve stopWorker metotları güvenle çağrılabilmeli', () => {
      service.startWorker();
      service.stopWorker();
      expect(true).toBe(true);
    });
  });
});
