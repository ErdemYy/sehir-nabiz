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
