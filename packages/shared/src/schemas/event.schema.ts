import { z } from 'zod';
import { EventCategory, EventSeverity, EventStatus, VerificationType, CategoryCode } from '../enums';
import { GeoCoordinateSchema } from './geo.schema';

export const EventSeveritySchema = z.nativeEnum(EventSeverity);
export const CategoryCodeSchema = z.nativeEnum(CategoryCode);
export const EventCategorySchema = z.nativeEnum(EventCategory);
export const EventStatusSchema = z.nativeEnum(EventStatus);
export const VerificationTypeSchema = z.nativeEnum(VerificationType);

/**
 * Phase 3: Olay Oluşturma Giriş Şeması
 */
export const CreateEventDtoSchema = z.object({
  categoryId: z.string().uuid('Geçerli bir kategori seçilmelidir'),
  title: z
    .string()
    .trim()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(150, 'Başlık en fazla 150 karakter olabilir'),
  description: z
    .string()
    .trim()
    .min(10, 'Açıklama en az 10 karakter olmalıdır')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  severity: EventSeveritySchema.default(EventSeverity.MEDIUM),
  latitude: z
    .number()
    .min(-90, 'Enlem -90 ile 90 arasında olmalıdır')
    .max(90, 'Enlem -90 ile 90 arasında olmalıdır'),
  longitude: z
    .number()
    .min(-180, 'Boylam -180 ile 180 arasında olmalıdır')
    .max(180, 'Boylam -180 ile 180 arasında olmalıdır'),
  addressText: z.string().trim().max(255).optional(),
  city: z.string().trim().max(60).optional(),
  district: z.string().trim().max(60).optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventDtoSchema>;

/**
 * Phase 3: Yakındaki Olaylar Sorgu Şeması (Nearby)
 */
export const NearbyEventsQuerySchema = z.object({
  latitude: z.coerce
    .number()
    .min(-90, 'Geçerli bir enlem giriniz')
    .max(90, 'Geçerli bir enlem giriniz'),
  longitude: z.coerce
    .number()
    .min(-180, 'Geçerli bir boylam giriniz')
    .max(180, 'Geçerli bir boylam giriniz'),
  radiusMeters: z.coerce
    .number()
    .min(50, 'Yarıçap en az 50 metre olmalıdır')
    .max(50000, 'Yarıçap en fazla 50 km (50.000 metre) olabilir')
    .default(5000),
  category: z.string().optional(),
  severity: EventSeveritySchema.optional(),
  status: EventStatusSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type NearbyEventsQueryInput = z.infer<typeof NearbyEventsQuerySchema>;

/**
 * Phase 3: Harita Bounding Box Sorgu Şeması (BBox)
 */
export const BBoxEventsQuerySchema = z.object({
  west: z.coerce.number().min(-180).max(180),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  north: z.coerce.number().min(-90).max(90),
  category: z.string().optional(),
  severity: EventSeveritySchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type BBoxEventsQueryInput = z.infer<typeof BBoxEventsQuerySchema>;

/**
 * Phase 3: Durum Güncelleme ve Moderasyon Şeması
 */
export const UpdateEventStatusSchema = z.object({
  status: EventStatusSchema,
  reason: z.string().trim().max(500, 'Gerekçe en fazla 500 karakter olabilir').optional(),
});

export type UpdateEventStatusInput = z.infer<typeof UpdateEventStatusSchema>;

/**
 * Geriye dönük uyumluluk şeması
 */
export const CreateEventInputSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(150, 'Başlık en fazla 150 karakter olabilir'),
  description: z
    .string()
    .min(10, 'Açıklama en az 10 karakter olmalıdır')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  category: EventCategorySchema.optional(),
  categoryId: z.string().uuid().optional(),
  severity: EventSeveritySchema.default(EventSeverity.MEDIUM),
  coordinate: GeoCoordinateSchema.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  addressText: z.string().max(255).optional(),
  city: z.string().min(2).max(60).optional(),
  district: z.string().min(2).max(60).optional(),
  mediaKeys: z.array(z.string()).max(3, 'En fazla 3 adet görsel eklenebilir').optional(),
});

export const VerifyEventInputSchema = z.object({
  verificationType: VerificationTypeSchema,
  comment: z.string().max(300, 'Yorum en fazla 300 karakter olabilir').optional(),
  userCoordinate: GeoCoordinateSchema.optional(),
});

export type VerifyEventInput = z.infer<typeof VerifyEventInputSchema>;
