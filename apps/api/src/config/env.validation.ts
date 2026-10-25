import { z } from 'zod';

export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),

  // PostgreSQL Veritabanı
  DATABASE_URL: z
    .string()
    .optional()
    .default('postgresql://postgres:postgres_secure_dev_password@localhost:5434/sehir_nabiz'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().default(5434),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres_secure_dev_password'),
  DB_DATABASE: z.string().default('sehir_nabiz'),
  DB_LOGGING: z.coerce.boolean().default(false),
  DB_SYNCHRONIZE: z.coerce.boolean().default(false),

  // Redis
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().default(6380),
  REDIS_PASSWORD: z.string().optional().default('redis_dev_secret'),

  // JWT Gizli Anahtarları (En az 32 karakter)
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET en az 32 karakter olmalıdır')
    .default('sehir_nabiz_default_access_jwt_secret_key_32chars_min!'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET en az 32 karakter olmalıdır')
    .default('sehir_nabiz_default_refresh_jwt_secret_key_32chars_min!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().default(60),
  THROTTLE_LIMIT: z.coerce.number().default(20),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export function validateEnvironment(config: Record<string, unknown>): Environment {
  const parsed = EnvironmentSchema.safeParse(config);

  if (!parsed.success) {
    const errorMessages = parsed.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`[EnvValidationError] Çevre değişkenleri doğrulanamadı: ${errorMessages}`);
  }

  // Üretim Ortamı Güvenlik Denetimi: Varsayılan JWT Secret'ların Engellenmesi
  if (parsed.data.NODE_ENV === 'production') {
    const defaultSecretPrefix = 'sehir_nabiz_default_';
    if (
      parsed.data.JWT_ACCESS_SECRET.startsWith(defaultSecretPrefix) ||
      parsed.data.JWT_REFRESH_SECRET.startsWith(defaultSecretPrefix)
    ) {
      throw new Error(
        '[SecurityError] Üretim (production) ortamında varsayılan JWT gizli anahtarları kullanılamaz! Lütfen en az 48 baytlık rastgele bir anahtar belirleyin.',
      );
    }
  }

  return parsed.data;
}
