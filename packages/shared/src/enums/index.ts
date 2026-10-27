/**
 * Olay Şiddet Derecesi
 */
export enum EventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * 11 Temel Olay Kategorisi
 */
export enum CategoryCode {
  TRAFFIC = 'TRAFFIC',
  ACCIDENT = 'ACCIDENT',
  ROAD_WORK = 'ROAD_WORK',
  WATER_OUTAGE = 'WATER_OUTAGE',
  POWER_OUTAGE = 'POWER_OUTAGE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  WEATHER = 'WEATHER',
  DISASTER = 'DISASTER',
  EVENT = 'EVENT',
  OTHER = 'OTHER',
}

/**
 * Olay Kategorisi (CategoryCode ile eşdeğer + geriye uyumluluk)
 */
export enum EventCategory {
  TRAFFIC = 'TRAFFIC',
  ACCIDENT = 'ACCIDENT',
  ROAD_WORK = 'ROAD_WORK',
  WATER_OUTAGE = 'WATER_OUTAGE',
  POWER_OUTAGE = 'POWER_OUTAGE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  WEATHER = 'WEATHER',
  DISASTER = 'DISASTER',
  EVENT = 'EVENT',
  OTHER = 'OTHER',

  // Geriye uyumluluk takma adları
  TRAFFIC_ACCIDENT = 'TRAFFIC_ACCIDENT',
  INFRASTRUCTURE_FAILURE = 'INFRASTRUCTURE_FAILURE',
  FIRE_OR_NATURAL_HAZARD = 'FIRE_OR_NATURAL_HAZARD',
  PUBLIC_SAFETY = 'PUBLIC_SAFETY',
  CULTURAL_EVENT = 'CULTURAL_EVENT',
  WEATHER_WARNING = 'WEATHER_WARNING',
}

/**
 * Olay Yaşam Döngüsü Durumu
 */
export enum EventStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  DISPUTED = 'DISPUTED',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',

  // Geriye dönük uyumluluk
  PENDING_VERIFICATION = 'PENDING_REVIEW',
  REJECTED_SPAM = 'REJECTED',
}

/**
 * Topluluk Teyit / Oylama Türü (Geriye dönük uyumluluk)
 */
export enum VerificationType {
  CONFIRM = 'CONFIRM',
  DENY = 'DENY',
  RESOLVED = 'RESOLVED',
}

/**
 * Topluluk Geri Bildirim Türü (Phase 8)
 * - CONFIRM: Ben de gördüm
 * - DISPUTE: Bilgi yanlış veya yanıltıcı
 * - RESOLVED_REPORT: Sorun çözülmüş olabilir
 */
export enum FeedbackType {
  CONFIRM = 'CONFIRM',
  DISPUTE = 'DISPUTE',
  RESOLVED_REPORT = 'RESOLVED_REPORT',
}

/**
 * Kullanıcı Rolleri
 */
export enum UserRole {
  CITIZEN = 'CITIZEN',
  TRUSTED_REPORTER = 'TRUSTED_REPORTER',
  MUNICIPAL_OFFICER = 'MUNICIPAL_OFFICER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

/**
 * Kullanıcı Hesap Durumları
 */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PENDING_DELETION = 'PENDING_DELETION',
  DELETED = 'DELETED',
}

/**
 * Hesap Silme Talebi Yaşam Döngüsü Durumu (Phase 14)
 */
export enum DeletionRequestStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

/**
 * Hesap Silme Talebi Kaynağı (Phase 14)
 */
export enum DeletionClientSource {
  MOBILE_APP = 'MOBILE_APP',
  WEB_REQUEST = 'WEB_REQUEST',
  ADMIN_ACTION = 'ADMIN_ACTION',
}

/**
 * Medya / Fotoğraf Yaşam Döngüsü Durumu
 */
export enum MediaStatus {
  PENDING_UPLOAD = 'PENDING_UPLOAD',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  REJECTED = 'REJECTED',
  DELETED = 'DELETED',
}

/**
 * Bildirim Türleri (Phase 9)
 */
export enum NotificationType {
  EVENT_APPROVED = 'EVENT_APPROVED',
  EVENT_REJECTED = 'EVENT_REJECTED',
  EVENT_RESOLVED = 'EVENT_RESOLVED',
  EVENT_DISPUTED = 'EVENT_DISPUTED',
  EVENT_FEEDBACK = 'EVENT_FEEDBACK',
  MODERATION_QUEUE = 'MODERATION_QUEUE',
  SYSTEM = 'SYSTEM',
}

/**
 * Cihaz Push Bildirim Platformu (Phase 9)
 */
export enum PushPlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

/**
 * Gerçek Zamanlı WebSocket Olay Adları (Phase 9)
 */
export enum RealtimeEventName {
  EVENT_CREATED = 'event:created',
  EVENT_UPDATED = 'event:updated',
  EVENT_STATUS_CHANGED = 'event:status_changed',
  EVENT_FEEDBACK_UPDATED = 'event:feedback_updated',
  MODERATION_EVENT_ADDED = 'moderation:event_added',
  NOTIFICATION_NEW = 'notification:new',
}

/**
 * Gerçek Zamanlı WebSocket Odaları (Phase 9)
 */
export enum RealtimeRoom {
  EVENTS_GLOBAL = 'events:global',
  MODERATION_QUEUE = 'moderation:queue',
}

