import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  NotificationType,
  UserNotificationDto,
  PaginatedNotificationsResponse,
  NotificationPreferencesDto,
} from '@sehir-nabiz/shared';
import { UserNotificationEntity } from '../../database/entities/user-notification.entity';
import { DevicePushTokenEntity } from '../../database/entities/device-push-token.entity';
import { UserNotificationPreferenceEntity } from '../../database/entities/user-notification-preference.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { PushNotificationService } from './push-notification.service';
import {
  NotificationsQueryDto,
  RegisterPushTokenApiDto,
  UpdateNotificationPreferencesDto,
} from './dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserNotificationEntity)
    private readonly notificationRepository: Repository<UserNotificationEntity>,
    @InjectRepository(DevicePushTokenEntity)
    private readonly pushTokenRepository: Repository<DevicePushTokenEntity>,
    @InjectRepository(UserNotificationPreferenceEntity)
    private readonly preferenceRepository: Repository<UserNotificationPreferenceEntity>,
    private readonly realtimeService: RealtimeService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  /**
   * Kullanıcının Bildirimlerini Listeleme (Cursor Pagination Destekli)
   */
  async getUserNotifications(
    userId: string,
    query: NotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    const qb = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere('(n.expiresAt IS NULL OR n.expiresAt > NOW())');

    if (query.unreadOnly) {
      qb.andWhere('n.readAt IS NULL');
    }

    if (query.cursor) {
      const cursorNotification = await this.notificationRepository.findOne({
        where: { id: query.cursor, userId },
        select: { id: true, createdAt: true },
      });
      if (cursorNotification) {
        qb.andWhere('n.createdAt < :cursorDate', {
          cursorDate: cursorNotification.createdAt,
        });
      }
    }

    qb.orderBy('n.createdAt', 'DESC');
    qb.take(query.limit + 1);

    const [items, total] = await Promise.all([
      qb.getMany(),
      this.notificationRepository.count({
        where: { userId },
      }),
    ]);

    const unreadCount = await this.getUnreadCount(userId);

    const hasNext = items.length > query.limit;
    const resultItems = hasNext ? items.slice(0, query.limit) : items;
    const nextCursor = hasNext ? (resultItems[resultItems.length - 1]?.id ?? null) : null;

    return {
      items: resultItems.map(item => this.mapToDto(item)),
      total,
      unreadCount,
      nextCursor,
    };
  }

  /**
   * Okunmamış Bildirim Sayısı
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        readAt: IsNull(),
      },
    });
  }

  /**
   * Tekil Bildirimi Okundu Olarak İşaretleme (Idempotent)
   */
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<UserNotificationDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Bildirim bulunamadı veya yetkiniz yok.');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }

    return this.mapToDto(notification);
  }

  /**
   * Tüm Bildirimleri Okundu Olarak İşaretleme (Idempotent)
   */
  async markAllAsRead(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(UserNotificationEntity)
      .set({ readAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('readAt IS NULL')
      .execute();

    return { affected: result.affected ?? 0 };
  }

  /**
   * Yeni Bildirim Üretme (In-App + Realtime + Push Entegrasyonu)
   */
  async createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    eventId?: string | null;
    expiresAt?: Date | null;
    idempotencyKey?: string | null;
  }): Promise<UserNotificationDto | null> {
    const { userId, type, title, body, eventId, expiresAt, idempotencyKey } = params;

    // İdempotency Denetimi: Aynı idempotencyKey daha önce işlendiyse mükerrer kayıt oluşturma
    if (idempotencyKey) {
      const existing = await this.notificationRepository.findOne({
        where: { idempotencyKey },
      });
      if (existing) {
        return this.mapToDto(existing);
      }
    }

    // Kullanıcı tercihlerini denetle
    const prefs = await this.getPreferences(userId);

    // Kategoriye ve kanala göre bildirim kapatılmışsa es geç
    if (!prefs.inAppEnabled && !prefs.pushEnabled) {
      return null;
    }

    if (type === NotificationType.EVENT_RESOLVED && !prefs.followedEvents) {
      return null;
    }
    if (type === NotificationType.EVENT_FEEDBACK && !prefs.confirmedEvents) {
      return null;
    }
    if (
      (type === NotificationType.EVENT_APPROVED ||
        type === NotificationType.EVENT_REJECTED) &&
      !prefs.reportedEvents
    ) {
      return null;
    }
    if (type === NotificationType.SYSTEM && !prefs.systemNotifications) {
      return null;
    }

    // Kısa süre içindeki birebir aynı mükerrer bildirimleri filtrele (Anti-spam)
    const recentDuplicate = await this.notificationRepository
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere('n.type = :type', { type })
      .andWhere('n.title = :title', { title })
      .andWhere("n.createdAt > NOW() - INTERVAL '30 seconds'")
      .getOne();

    if (recentDuplicate) {
      return this.mapToDto(recentDuplicate);
    }

    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      body,
      eventId: eventId ?? null,
      expiresAt: expiresAt ?? null,
      idempotencyKey: idempotencyKey ?? null,
    });

    let saved: UserNotificationEntity;
    try {
      saved = await this.notificationRepository.save(notification);
    } catch (err: any) {
      if (idempotencyKey && (err.code === '23505' || err.message?.includes('UQ_user_notifications_idempotency'))) {
        const existing = await this.notificationRepository.findOne({ where: { idempotencyKey } });
        if (existing) return this.mapToDto(existing);
      }
      throw err;
    }
    const dto = this.mapToDto(saved);

    // 1. In-App Realtime İletim (WebSocket üzerinden)
    if (prefs.inAppEnabled && this.realtimeService) {
      this.realtimeService.sendNotificationToUser(userId, dto);
    }

    // 2. Push Bildirimi Gönderimi
    if (prefs.pushEnabled) {
      const activeTokens = await this.pushTokenRepository.find({
        where: { userId, isActive: true },
        select: { token: true },
      });

      if (activeTokens.length > 0) {
        const tokens = activeTokens.map(t => t.token);
        await this.pushNotificationService.sendPushNotifications(
          tokens,
          title,
          body,
          {
            notificationId: saved.id,
            eventId: saved.eventId,
            type: saved.type,
          },
        );
      }
    }

    return dto;
  }

  /**
   * Cihaz Push Token Kaydetme / Güncelleme
   */
  async registerPushToken(
    userId: string,
    dto: RegisterPushTokenApiDto,
  ): Promise<DevicePushTokenEntity> {
    let tokenRecord = await this.pushTokenRepository.findOne({
      where: { token: dto.token },
    });

    if (tokenRecord) {
      tokenRecord.userId = userId;
      tokenRecord.platform = dto.platform;
      tokenRecord.deviceIdentifier = dto.deviceIdentifier ?? tokenRecord.deviceIdentifier;
      tokenRecord.isActive = true;
      tokenRecord.lastSeenAt = new Date();
    } else {
      tokenRecord = this.pushTokenRepository.create({
        userId,
        token: dto.token,
        platform: dto.platform,
        deviceIdentifier: dto.deviceIdentifier ?? null,
        isActive: true,
        lastSeenAt: new Date(),
      });
    }

    return this.pushTokenRepository.save(tokenRecord);
  }

  /**
   * Cihaz Push Token Pasifleştirme (Oturum Kapatma Durumunda)
   */
  async deactivatePushToken(
    userId: string,
    token: string,
  ): Promise<{ success: boolean }> {
    await this.pushTokenRepository.update(
      { userId, token },
      { isActive: false },
    );
    return { success: true };
  }

  /**
   * Kullanıcı Bildirim Tercihlerini Getirme (Yoksa varsayılanları oluşturur)
   */
  async getPreferences(userId: string): Promise<UserNotificationPreferenceEntity> {
    let prefs = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!prefs) {
      prefs = this.preferenceRepository.create({
        userId,
        followedEvents: true,
        confirmedEvents: true,
        reportedEvents: true,
        nearbyEvents: false, // Varsayılan kapalı (Gizlilik)
        systemNotifications: true,
        pushEnabled: true,
        inAppEnabled: true,
      });
      prefs = await this.preferenceRepository.save(prefs);
    }

    return prefs;
  }

  /**
   * Kullanıcı Bildirim Tercihlerini Güncelleme
   */
  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    const prefs = await this.getPreferences(userId);

    Object.assign(prefs, dto);
    const saved = await this.preferenceRepository.save(prefs);

    return {
      followedEvents: saved.followedEvents,
      confirmedEvents: saved.confirmedEvents,
      reportedEvents: saved.reportedEvents,
      nearbyEvents: saved.nearbyEvents,
      systemNotifications: saved.systemNotifications,
      pushEnabled: saved.pushEnabled,
      inAppEnabled: saved.inAppEnabled,
    };
  }

  /**
   * Entity -> DTO Dönüştürücü
   */
  private mapToDto(entity: UserNotificationEntity): UserNotificationDto {
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type,
      title: entity.title,
      body: entity.body,
      eventId: entity.eventId,
      readAt: entity.readAt ? entity.readAt.toISOString() : null,
      isRead: Boolean(entity.readAt),
      createdAt: entity.createdAt.toISOString(),
      expiresAt: entity.expiresAt ? entity.expiresAt.toISOString() : null,
    };
  }
}
