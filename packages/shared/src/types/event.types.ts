import { EventCategory, EventSeverity, EventStatus, CategoryCode, FeedbackType } from '../enums';
import { GeoCoordinate } from './geo.types';

/**
 * Kategori DTO
 */
export interface CategoryDto {
  id: string;
  code: CategoryCode | string;
  nameTr: string;
  descriptionTr: string;
  icon: string;
  colorHex: string;
  defaultDurationHours: number;
  isActive: boolean;
}

/**
 * Genel Olay Yanıtında Yazar Profili (Hassas Bilgilerden Arındırılmış)
 */
export interface PublicAuthorDto {
  id: string;
  displayName: string;
  reputationScore: number;
}

/**
 * Mükerrer Olay Uyarı Bilgisi
 */
export interface DuplicateWarningDto {
  isDuplicateSuspected: boolean;
  message?: string;
  candidateId?: string;
  candidateTitle?: string;
  distanceMeters?: number;
  createdAt?: string;
}

/**
 * Tam Olay Yanıt DTO'su
 */
export interface EventResponseDto {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  status: EventStatus;
  category: CategoryDto;
  location: {
    latitude: number;
    longitude: number;
  };
  addressText?: string;
  city?: string;
  district?: string;
  distanceMeters?: number;
  confirmationCount: number;
  denialCount: number;
  reliabilityScore: number;
  author: PublicAuthorDto;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  resolvedAt?: string;
  duplicateWarning?: DuplicateWarningDto;
}

/**
 * Sayfalanmış Olay Listesi Yanıtı (Cursor-based)
 */
export interface PaginatedEventsResponse {
  items: EventResponseDto[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

/**
 * Harita ve Liste Görünümü İçin Optimize Edilmiş Olay Özeti (EventSummary)
 */
export interface EventSummary {
  id: string;
  title: string;
  category: EventCategory;
  severity: EventSeverity;
  status: EventStatus;
  coordinate: GeoCoordinate;
  addressText?: string;
  reliabilityScore: number;
  upvotesCount: number;
  downvotesCount: number;
  thumbnailUrl?: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Detaylı Olay Görünümü
 */
export interface EventDetail extends EventSummary {
  description: string;
  city: string;
  district: string;
  mediaUrls: string[];
  reporterReputation: number;
  isCurrentUserVerified?: boolean;
}

/**
 * Kullanıcı Geri Bildirim Bilgisi (Phase 8)
 */
export interface UserFeedbackDto {
  type: FeedbackType;
  reason?: string | null;
  createdAt: string;
}

/**
 * Topluluk Geri Bildirim Özeti DTO'su (Phase 8)
 */
export interface FeedbackSummaryDto {
  eventId: string;
  confirmCount: number;
  disputeCount: number;
  resolvedReportCount: number;
  totalCount: number;
  userFeedback: UserFeedbackDto | null;
  hasSufficientSample: boolean;
  communityAssessment: string;
  disclaimer: string;
}

/**
 * Moderasyon Olay Listesi Öğesi DTO'su (Phase 8)
 */
export interface ModerationEventItemDto extends EventResponseDto {
  feedbackSummary?: {
    confirmCount: number;
    disputeCount: number;
    resolvedReportCount: number;
    totalCount: number;
  };
}

/**
 * Sayfalanmış Moderasyon Olayları Yanıtı (Cursor-based)
 */
export interface PaginatedModerationEventsResponse {
  items: ModerationEventItemDto[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}
