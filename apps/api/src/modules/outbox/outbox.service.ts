import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OutboxEventEntity } from '../../database/entities/outbox-event.entity';
import { OutboxStatus } from '@sehir-nabiz/shared';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  /**
   * Transaction içerisinde atomik outbox kaydı oluşturur.
   * Eğer transaction rollback olursa outbox kaydı da geri alınır.
   * Payload kişisel şifre, token veya aşırı büyük binary verilerden arındırılır.
   */
  async createOutboxEvent(
    manager: EntityManager,
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<OutboxEventEntity> {
    const sanitizedPayload = this.sanitizePayload(payload);

    const outboxRepo = manager.getRepository(OutboxEventEntity);
    const outboxEvent = outboxRepo.create({
      aggregateType,
      aggregateId,
      eventType,
      payload: sanitizedPayload,
      status: OutboxStatus.PENDING,
      attempts: 0,
      nextAttemptAt: new Date(),
    });

    const saved = await outboxRepo.save(outboxEvent);
    this.logger.debug(
      `[Outbox] Event eklendi: ID=${saved.id}, Type=${eventType}, Aggregate=${aggregateType}:${aggregateId}`,
    );
    return saved;
  }

  /**
   * Hassas token, şifre ve ham veri arındırması
   */
  private sanitizePayload(data: Record<string, any>): Record<string, any> {
    const copy = { ...data };
    delete copy.password;
    delete copy.passwordHash;
    delete copy.refreshToken;
    delete copy.accessToken;
    delete copy.buffer;
    return copy;
  }
}
