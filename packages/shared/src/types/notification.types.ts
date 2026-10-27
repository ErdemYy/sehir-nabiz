import { NotificationType, PushPlatform } from '../enums';

/**
 * Kullanıcı Bildirim DTO Modeli
 */
export interface UserNotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  eventId?: string | null;
  readAt?: string | null;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string | null;
}

/**
 * Sayfalanmış Bildirim Listesi Yanıtı
 */
export interface PaginatedNotificationsResponse {
  items: UserNotificationDto[];
  total: number;
  unreadCount: number;
  nextCursor?: string | null;
}

/**
 * Cihaz Push Token Kayıt DTO
 */
export interface RegisterPushTokenDto {
  token: string;
  platform: PushPlatform;
  deviceIdentifier?: string | null;
}

/**
 * Bildirim Tercihleri Modeli
 */
export interface NotificationPreferencesDto {
  followedEvents: boolean;
  confirmedEvents: boolean;
  reportedEvents: boolean;
  nearbyEvents: boolean;
  systemNotifications: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

/**
 * Gerçek Zamanlı WebSocket Olay Veri Yükü (Payload)
 */
export interface RealtimeEventPayload<T = Record<string, unknown>> {
  serverEventId: string;
  eventVersion: number;
  eventName: string;
  eventId: string;
  data: T;
  timestamp: string;
}
