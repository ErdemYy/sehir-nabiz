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
 * Olay Kategorisi
 */
export enum EventCategory {
  TRAFFIC_ACCIDENT = 'TRAFFIC_ACCIDENT',
  ROAD_WORK = 'ROAD_WORK',
  INFRASTRUCTURE_FAILURE = 'INFRASTRUCTURE_FAILURE',
  FIRE_OR_NATURAL_HAZARD = 'FIRE_OR_NATURAL_HAZARD',
  PUBLIC_SAFETY = 'PUBLIC_SAFETY',
  CULTURAL_EVENT = 'CULTURAL_EVENT',
  WEATHER_WARNING = 'WEATHER_WARNING',
  OTHER = 'OTHER',
}

/**
 * Olay Yaşam Döngüsü Durumu
 */
export enum EventStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  REJECTED_SPAM = 'REJECTED_SPAM',
  EXPIRED = 'EXPIRED',
}

/**
 * Topluluk Teyit / Oylama Türü
 */
export enum VerificationType {
  CONFIRM = 'CONFIRM',
  DENY = 'DENY',
  RESOLVED = 'RESOLVED',
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
}
