import { z } from 'zod';
import { NotificationType, PushPlatform } from '../enums';

/**
 * Cihaz Push Token Doğrulama Şeması
 */
export const RegisterPushTokenSchema = z.object({
  token: z
    .string({ required_error: 'Push token zorunludur' })
    .min(10, 'Push token çok kısa')
    .max(255, 'Push token çok uzun'),
  platform: z.nativeEnum(PushPlatform, {
    errorMap: () => ({ message: 'Geçersiz cihaz platformu (ios, android, web)' }),
  }),
  deviceIdentifier: z
    .string()
    .max(128, 'Cihaz kimliği en fazla 128 karakter olabilir')
    .optional()
    .nullable(),
});

export type RegisterPushTokenInput = z.infer<typeof RegisterPushTokenSchema>;

/**
 * Bildirim Tercihlerini Güncelleme Şeması
 */
export const UpdateNotificationPreferencesSchema = z.object({
  followedEvents: z.boolean().optional(),
  confirmedEvents: z.boolean().optional(),
  reportedEvents: z.boolean().optional(),
  nearbyEvents: z.boolean().optional(),
  systemNotifications: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof UpdateNotificationPreferencesSchema
>;

/**
 * Bildirim Listesi Sorgu Parametreleri Şeması
 */
export const NotificationsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  unreadOnly: z.coerce.boolean().default(false),
});

export type NotificationsQueryInput = z.infer<typeof NotificationsQuerySchema>;

/**
 * Bildirim Türü Şeması
 */
export const NotificationTypeSchema = z.nativeEnum(NotificationType);
