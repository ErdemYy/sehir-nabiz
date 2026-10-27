import { z } from 'zod';
import { UserRole, AccountStatus } from '../enums';

export const UserRoleSchema = z.nativeEnum(UserRole);
export const AccountStatusSchema = z.nativeEnum(AccountStatus);

// Şifre: En az 8 karakter, en az bir büyük harf, bir küçük harf ve bir rakam
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const RegisterInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Geçerli bir e-posta adresi giriniz')
    .max(255, 'E-posta en fazla 255 karakter olabilir'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .max(100, 'Şifre en fazla 100 karakter olabilir')
    .regex(
      passwordRegex,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
    ),
  displayName: z
    .string()
    .trim()
    .min(2, 'Görünen ad en az 2 karakter olmalıdır')
    .max(50, 'Görünen ad en fazla 50 karakter olabilir'),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre zorunludur'),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(10, 'Geçersiz refresh token formatı'),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

/**
 * Mobil Uygulama İçi Hesap Silme Şeması (Phase 14)
 */
export const DeleteAccountInputSchema = z.object({
  password: z.string().min(1, 'Mevcut şifrenizi girmeniz zorunludur'),
  reason: z.string().max(500, 'Silme gerekçesi en fazla 500 karakter olabilir').optional(),
  immediate: z.boolean().optional().default(false),
});

export type DeleteAccountInput = z.infer<typeof DeleteAccountInputSchema>;

/**
 * Web Üzerinden Hesap Silme Şeması (Phase 14)
 */
export const WebDeleteAccountInputSchema = z.object({
  email: z.string().trim().toLowerCase().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre zorunludur'),
  reason: z.string().max(500, 'Silme gerekçesi en fazla 500 karakter olabilir').optional(),
  immediate: z.boolean().optional().default(false),
});

export type WebDeleteAccountInput = z.infer<typeof WebDeleteAccountInputSchema>;

/**
 * Silme İsteğini İptal Etme Şeması (Phase 14)
 */
export const CancelDeletionInputSchema = z.object({
  password: z.string().min(1, 'İptal işlemi için şifre zorunludur'),
});

export type CancelDeletionInput = z.infer<typeof CancelDeletionInputSchema>;
