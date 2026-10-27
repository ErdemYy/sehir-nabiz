import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import {
  RealtimeEventName,
  EventResponseDto,
  UserNotificationDto,
} from '@sehir-nabiz/shared';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  /**
   * Yeni olay yayını (aktif olduğunda)
   */
  broadcastEventCreated(event: EventResponseDto & { version?: number }): void {
    this.gateway.broadcastEventUpdate(RealtimeEventName.EVENT_CREATED, event);
    this.logger.log(`[RealtimeService] Event Created yayımlandı: ${event.id}`);
  }

  /**
   * Olay durumu değişikliği yayını (örn: PENDING_REVIEW -> ACTIVE, ACTIVE -> RESOLVED)
   */
  broadcastEventStatusChanged(
    event: EventResponseDto & { version?: number },
  ): void {
    this.gateway.broadcastEventUpdate(
      RealtimeEventName.EVENT_STATUS_CHANGED,
      event,
    );
    this.logger.log(
      `[RealtimeService] Event Status Changed yayımlandı: ${event.id} -> ${event.status}`,
    );
  }

  /**
   * Olay genel güncellemesi yayını
   */
  broadcastEventUpdated(event: EventResponseDto & { version?: number }): void {
    this.gateway.broadcastEventUpdate(RealtimeEventName.EVENT_UPDATED, event);
  }

  /**
   * Olay geri bildirim sayaçları güncellemesi yayını
   */
  broadcastFeedbackUpdated(data: {
    id: string;
    confirmationCount: number;
    disputeCount: number;
    resolvedReportCount: number;
    reliabilityScore: number;
    version?: number;
  }): void {
    this.gateway.broadcastEventUpdate(
      RealtimeEventName.EVENT_FEEDBACK_UPDATED,
      data,
    );
  }

  /**
   * Moderatör kuyruğuna yeni olay bildirimi
   */
  notifyModerationQueue(event: any): void {
    this.gateway.broadcastToModerators(
      RealtimeEventName.MODERATION_EVENT_ADDED,
      event,
    );
    this.logger.log(
      `[RealtimeService] Moderasyon odasına yeni olay iletildi: ${event.id}`,
    );
  }

  /**
   * Tekil kullanıcıya anlık bildirim iletimi
   */
  sendNotificationToUser(userId: string, notification: UserNotificationDto): void {
    this.gateway.sendToUser(
      userId,
      RealtimeEventName.NOTIFICATION_NEW,
      notification,
    );
  }
}
