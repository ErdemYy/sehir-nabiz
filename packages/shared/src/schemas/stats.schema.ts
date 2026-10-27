import { z } from 'zod';
import { EventCategory, EventStatus } from '../enums';

/**
 * İstatistik Özeti Sorgu Şeması
 */
export const StatsOverviewQuerySchema = z.object({
  city: z.string().optional().default('Kayseri'),
  period: z.enum(['24h', '7d', '30d', 'all']).optional().default('7d'),
});

export type StatsOverviewQuery = z.infer<typeof StatsOverviewQuerySchema>;

/**
 * Yoğunluk / Isı Haritası Sorgu Şeması
 */
export const HeatmapQuerySchema = z.object({
  minLng: z.coerce.number().min(-180).max(180),
  minLat: z.coerce.number().min(-90).max(90),
  maxLng: z.coerce.number().min(-180).max(180),
  maxLat: z.coerce.number().min(-90).max(90),
  category: z.nativeEnum(EventCategory).optional(),
  period: z.enum(['24h', '7d', '30d', 'all']).optional().default('30d'),
  precision: z.coerce.number().min(1).max(5).optional().default(3),
});

export type HeatmapQuery = z.infer<typeof HeatmapQuerySchema>;

/**
 * Olay Arama Sorgu Şeması
 */
export const SearchEventsQuerySchema = z.object({
  q: z.string().min(2, 'Arama terimi en az 2 karakter olmalıdır').max(100),
  category: z.nativeEnum(EventCategory).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  cursor: z.string().optional(),
});

export type SearchEventsQuery = z.infer<typeof SearchEventsQuerySchema>;

/**
 * Kullanıcının Kendi Olayları Sorgu Şeması
 */
export const MyEventsQuerySchema = z.object({
  status: z.nativeEnum(EventStatus).optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  cursor: z.string().optional(),
});

export type MyEventsQuery = z.infer<typeof MyEventsQuerySchema>;
