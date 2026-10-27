import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OutboxEventEntity } from '../../database/entities/outbox-event.entity';
import { NotificationType, EventStatus } from '@sehir-nabiz/shared';
import { RealtimeService } from '../realtime/realtime.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OutboxProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private isShuttingDown = false;

  // Konfigürasyon
  private readonly batchSize = 10;
  private readonly maxAttempts = 5;
  private readonly leaseSeconds = 30;
  private readonly pollIntervalMs = 2000;

  constructor(
    private readonly dataSource: DataSource,
    @Optional() private readonly realtimeService?: RealtimeService,
    @Optional() private readonly notificationsService?: NotificationsService,
    @Optional() private readonly redisService?: RedisService,
  ) {}

  onModuleInit(): void {
    this.startWorker();
  }

  onModuleDestroy(): void {
    this.stopWorker();
  }

  /**
   * Arka plan worker döngüsünü başlatır
   */
  startWorker(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.processBatch().catch(err => {
        this.logger.error(`[Outbox Worker] Hata: ${err.message}`);
      });
    }, this.pollIntervalMs);
    this.logger.log(`[Outbox Worker] Başlatıldı (Interval: ${this.pollIntervalMs}ms, Lease: ${this.leaseSeconds}s)`);
  }

  /**
   * Worker döngüsünü durdurur
   */
  stopWorker(): void {
    this.isShuttingDown = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Yeni bir event eklendiğinde beklemeden anında tetikler
   */
  triggerProcess(): void {
    if (this.isShuttingDown) return;
    setImmediate(() => {
      this.processBatch().catch(() => {});
    });
  }

  /**
   * PostgreSQL FOR UPDATE SKIP LOCKED ile atomik batch çekme ve işleme
   */
  async processBatch(): Promise<number> {
    if (this.isProcessing || this.isShuttingDown) return 0;
    this.isProcessing = true;

    try {
      // 1. Atomik olarak PENDING veya süresi dolmuş PROCESSING kayıtları kilitle ve claim et
      const claimedEvents = await this.claimPendingEvents();
      if (!claimedEvents || claimedEvents.length === 0) {
        return 0;
      }

      this.logger.debug(`[Outbox Worker] ${claimedEvents.length} adet olay işleniyor...`);

      // 2. Her bir olayı işle
      for (const event of claimedEvents) {
        if (this.isShuttingDown) break;
        await this.processSingleEvent(event);
      }

      return claimedEvents.length;
    } catch (err: any) {
      this.logger.error(`[Outbox Worker] Batch işleme hatası: ${err.message}`);
      return 0;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Güvenli FOR UPDATE SKIP LOCKED sorgusuyla kayıtları claim eder
   */
  private async claimPendingEvents(): Promise<OutboxEventEntity[]> {
    return this.dataSource.transaction(async manager => {
      const rawRows = await manager.query(
        `
        UPDATE outbox_events
        SET status = 'PROCESSING',
            lock_lease_expires_at = NOW() + ($1 || ' seconds')::interval,
            attempts = attempts + 1
        WHERE id IN (
          SELECT id FROM outbox_events
          WHERE (status = 'PENDING' AND next_attempt_at <= NOW())
             OR (status = 'PROCESSING' AND lock_lease_expires_at < NOW())
          ORDER BY next_attempt_at ASC
          LIMIT $2
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
        `,
        [this.leaseSeconds, this.batchSize],
      );

      const rows = Array.isArray(rawRows?.[0]) ? rawRows[0] : (rawRows || []);
      return rows.map((row: any) => manager.create(OutboxEventEntity, {
        id: row.id,
        aggregateType: row.aggregate_type,
        aggregateId: row.aggregate_id,
        eventType: row.event_type,
        payload: row.payload,
        status: row.status,
        attempts: row.attempts,
        nextAttemptAt: row.next_attempt_at,
        processedAt: row.processed_at,
        lockLeaseExpiresAt: row.lock_lease_expires_at,
        lastError: row.last_error,
        createdAt: row.created_at,
      }));
    });
  }

  /**
   * Tekil outbox kaydını güvenli bir şekilde tüketiciye iletir
   */
  async processSingleEvent(event: OutboxEventEntity): Promise<void> {
    try {
      await this.dispatchToHandlers(event);

      // Başarılı: PROCESSED olarak işaretle
      await this.dataSource.query(
        `
        UPDATE outbox_events
        SET status = 'PROCESSED',
            processed_at = NOW(),
            lock_lease_expires_at = NULL,
            last_error = NULL
        WHERE id = $1;
        `,
        [event.id],
      );

      this.logger.debug(`[Outbox Worker] Başarıyla işlendi: ID=${event.id}, Type=${event.eventType}`);
    } catch (err: any) {
      const errorMsg = err?.message || 'Bilinmeyen outbox işleme hatası';
      this.logger.warn(`[Outbox Worker] Olay işleme hatası (ID=${event.id}, Attempt=${event.attempts}): ${errorMsg}`);

      if (event.attempts >= this.maxAttempts) {
        // Dead-letter / Kalıcı Başarısızlık
        await this.dataSource.query(
          `
          UPDATE outbox_events
          SET status = 'FAILED',
              lock_lease_expires_at = NULL,
              last_error = $2
          WHERE id = $1;
          `,
          [event.id, `Max deneme (${this.maxAttempts}) aşıldı: ${errorMsg}`],
        );
        this.logger.error(`[Outbox Worker] Olay FAILED (Dead-letter) durumuna alındı: ID=${event.id}`);
      } else {
        // Exponential backoff + jitter
        const backoffMs = Math.min(
          60000,
          Math.pow(2, event.attempts) * 1000 + Math.floor(Math.random() * 500),
        );

        await this.dataSource.query(
          `
          UPDATE outbox_events
          SET status = 'PENDING',
              next_attempt_at = NOW() + ($2 || ' milliseconds')::interval,
              lock_lease_expires_at = NULL,
              last_error = $3
          WHERE id = $1;
          `,
          [event.id, backoffMs, errorMsg],
        );
      }
    }
  }

  /**
   * EventType'a göre ilgili domain servislerini (WebSocket, Notifications, Redis Cache) tetikler
   */
  private async dispatchToHandlers(event: OutboxEventEntity): Promise<void> {
    const { eventType, payload, id: outboxId } = event;

    switch (eventType) {
      case 'EVENT_CREATED': {
        if (payload.event) {
          this.realtimeService?.notifyModerationQueue(payload.event);
          if (payload.event.status === EventStatus.ACTIVE) {
            this.realtimeService?.broadcastEventCreated(payload.event);
          }
        }
        break;
      }

      case 'EVENT_STATUS_CHANGED':
      case 'EVENT_PUBLISHED':
      case 'EVENT_REJECTED':
      case 'EVENT_RESOLVED':
      case 'EVENT_DISPUTED': {
        const updatedEvent = payload.event;
        const newStatus = payload.newStatus || updatedEvent?.status;
        const authorId = payload.authorId || updatedEvent?.author?.id;
        const eventTitle = payload.title || updatedEvent?.title || 'Kentsel Olay';
        const reason = payload.reason;

        // 1. Gerçek zamanlı WebSocket yayını
        if (updatedEvent) {
          this.realtimeService?.broadcastEventStatusChanged(updatedEvent);
        }

        // 2. İdempotent Kullanıcı Bildirimi
        if (this.notificationsService && authorId) {
          let notifType = NotificationType.SYSTEM;
          let title = 'Olay Durumu Güncellendi';
          let body = `"${eventTitle}" başlıklı olay güncellendi.`;

          if (newStatus === EventStatus.ACTIVE) {
            notifType = NotificationType.EVENT_APPROVED;
            title = 'Bildiriminiz yayınlandı';
            body = `"${eventTitle}" başlıklı bildiriminiz onaylandı ve yayına alındı.`;
          } else if (newStatus === EventStatus.REJECTED) {
            notifType = NotificationType.EVENT_REJECTED;
            title = 'Bildiriminiz hakkında bir moderasyon kararı verildi';
            body = `"${eventTitle}" başlıklı bildiriminiz onaylanmadı.${reason ? ` Gerekçe: ${reason}` : ''}`;
          } else if (newStatus === EventStatus.RESOLVED) {
            notifType = NotificationType.EVENT_RESOLVED;
            title = 'Takip ettiğiniz gelişme çözüldü olarak işaretlendi';
            body = `"${eventTitle}" başlıklı aksaklık çözüldü olarak işaretlendi.`;
          } else if (newStatus === EventStatus.DISPUTED) {
            notifType = NotificationType.EVENT_DISPUTED;
            title = 'Katkıda bulunduğunuz olaya itiraz edildi';
            body = `"${eventTitle}" başlıklı olay hakkında ihtilaf kaydı oluşturuldu.`;
          }

          await this.notificationsService.createNotification({
            userId: authorId,
            type: notifType,
            title,
            body,
            eventId: event.aggregateId,
            idempotencyKey: `outbox:${outboxId}:${authorId}`,
          });
        }

        // 3. İstatistik Redis Önbellek Temizliği (Cache Invalidation)
        if (this.redisService?.isReady && (newStatus === EventStatus.ACTIVE || newStatus === EventStatus.RESOLVED)) {
          try {
            const client = (this.redisService as any).client;
            if (client) {
              const keys = await client.keys('stats:overview:*');
              if (keys && keys.length > 0) {
                await client.del(...keys);
                this.logger.debug(`[Outbox Worker] İstatistik önbelleği temizlendi (${keys.length} anahtar)`);
              }
            }
          } catch (cacheErr) {
            this.logger.warn(`[Outbox Worker] Önbellek temizleme uyarısı: ${(cacheErr as Error).message}`);
          }
        }
        break;
      }

      case 'EVENT_FEEDBACK_SUBMITTED': {
        this.realtimeService?.broadcastFeedbackUpdated({
          id: event.aggregateId,
          confirmationCount: payload.confirmationCount ?? 0,
          disputeCount: payload.disputeCount ?? payload.denialCount ?? 0,
          resolvedReportCount: payload.resolvedReportCount ?? 0,
          reliabilityScore: 1.0,
        });

        if (this.notificationsService && payload.eventAuthorId && payload.voterId !== payload.eventAuthorId) {
          const feedbackType = payload.feedbackType;
          let title = 'Olayınıza yeni bir değerlendirme yapıldı';
          let body = `Bir vatandaş olayınız hakkında geri bildirim paylaştı.`;

          if (feedbackType === 'CONFIRM') {
            title = 'Olayınız teyit edildi';
            body = `Bir vatandaş olayınızı gördüğünü teyit etti.`;
          } else if (feedbackType === 'DISPUTE') {
            title = 'Olayınıza itiraz edildi';
            body = `Bir vatandaş olayınız hakkında itiraz bildiriminde bulundu.`;
          }

          await this.notificationsService.createNotification({
            userId: payload.eventAuthorId,
            type: feedbackType === 'DISPUTE' ? NotificationType.EVENT_DISPUTED : NotificationType.EVENT_FEEDBACK,
            title,
            body,
            eventId: event.aggregateId,
            idempotencyKey: `outbox:${outboxId}:${payload.eventAuthorId}`,
          });
        }
        break;
      }

      default:
        this.logger.warn(`[Outbox Worker] Tanımlanamayan eventType: ${eventType}`);
    }
  }
}
