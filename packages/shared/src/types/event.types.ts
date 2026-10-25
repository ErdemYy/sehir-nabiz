import { EventCategory, EventSeverity, EventStatus } from '../enums';
import { GeoCoordinate } from './geo.types';

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
