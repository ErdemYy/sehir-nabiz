import { z } from 'zod';
import { EventCategory, EventSeverity, EventStatus, VerificationType } from '../enums';
import { GeoCoordinateSchema } from './geo.schema';

export const EventSeveritySchema = z.nativeEnum(EventSeverity);
export const EventCategorySchema = z.nativeEnum(EventCategory);
export const EventStatusSchema = z.nativeEnum(EventStatus);
export const VerificationTypeSchema = z.nativeEnum(VerificationType);

export const CreateEventInputSchema = z.object({
  title: z
    .string()
    .min(5, 'Başlık en az 5 karakter olmalıdır')
    .max(120, 'Başlık en fazla 120 karakter olabilir'),
  description: z
    .string()
    .min(10, 'Açıklama en az 10 karakter olmalıdır')
    .max(1500, 'Açıklama en fazla 1500 karakter olabilir'),
  category: EventCategorySchema,
  severity: EventSeveritySchema.default(EventSeverity.MEDIUM),
  coordinate: GeoCoordinateSchema,
  addressText: z.string().max(255).optional(),
  city: z.string().min(2).max(60),
  district: z.string().min(2).max(60),
  mediaKeys: z.array(z.string()).max(3, 'En fazla 3 adet görsel eklenebilir').optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

export const VerifyEventInputSchema = z.object({
  verificationType: VerificationTypeSchema,
  comment: z.string().max(300, 'Yorum en fazla 300 karakter olabilir').optional(),
  userCoordinate: GeoCoordinateSchema.optional(),
});

export type VerifyEventInput = z.infer<typeof VerifyEventInputSchema>;
