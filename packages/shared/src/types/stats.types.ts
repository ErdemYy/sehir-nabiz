import { CategoryCode, EventSeverity, EventStatus } from '../enums';

/**
 * İstatistik Zaman Aralığı
 */
export type StatsPeriod = '24h' | '7d' | '30d' | 'all';

/**
 * Kategori İstatistik Dökümü
 */
export interface CategoryStatDto {
  categoryCode: CategoryCode | string;
  categoryName: string;
  colorHex: string;
  count: number;
  percentage: number;
}

/**
 * Zaman Çizelgesi / Trend Noktası
 */
export interface TimelineStatDto {
  date: string; // YYYY-MM-DD
  count: number;
  resolvedCount: number;
}

/**
 * İlçe Bazlı İstatistik
 */
export interface DistrictStatDto {
  district: string;
  count: number;
  resolvedCount: number;
  percentage: number;
}

/**
 * Şehir Genel İstatistik Özeti
 */
export interface StatsOverviewDto {
  city: string;
  period: StatsPeriod;
  totalEvents: number;
  activeEvents: number;
  resolvedEvents: number;
  disputedEvents: number;
  averageConfirmations: number;
  resolutionRate: number; // 0 - 100
  categoryDistribution: CategoryStatDto[];
  timeline: TimelineStatDto[];
  districtComparison: DistrictStatDto[];
  disclaimer: string;
}

/**
 * Coğrafi Yoğunluk / Isı Haritası Noktası
 */
export interface HeatmapPointDto {
  latitude: number;
  longitude: number;
  weight: number; // 0.1 - 1.0 yoğunluk katsayısı
  count: number;
  categoryCode?: string;
}

/**
 * Isı Haritası Yanıt Modeli
 */
export interface HeatmapResponseDto {
  totalPoints: number;
  aggregatedClusterCount: number;
  points: HeatmapPointDto[];
  disclaimer: string;
}

/**
 * Kullanıcı Katkı İstatistikleri
 */
export interface UserStatsDto {
  reportedCount: number;
  confirmedCount: number;
  resolvedCount: number;
  disputedCount: number;
  reputationScore: number;
  reputationLevel: string;
}

/**
 * Kullanıcının Kendi Olayı Yanıt Modeli (Red gerekçesi dahil)
 */
export interface MyEventResponseDto {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  status: EventStatus;
  categoryCode: string;
  categoryName: string;
  categoryColor: string;
  location: {
    latitude: number;
    longitude: number;
  };
  addressText?: string | null;
  city?: string | null;
  district?: string | null;
  confirmationCount: number;
  disputeCount: number;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}
