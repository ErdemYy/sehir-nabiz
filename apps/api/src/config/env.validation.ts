import { z } from 'zod';

export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),
  DIAGNOSTICS_SECRET: z.string().optional().default('default_internal_diagnostics_secret'),

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

  // Object Storage (MinIO / Cloudflare R2)
  STORAGE_PROVIDER: z.enum(['minio', 'r2', 's3']).default('minio'),
  STORAGE_ENDPOINT: z.string().default('http://127.0.0.1:9000'),
  STORAGE_REGION: z.string().default('auto'),
  STORAGE_ACCESS_KEY: z.string().default('minio_admin_user'),
  STORAGE_SECRET_KEY: z.string().default('minio_secure_dev_password'),
  STORAGE_BUCKET: z.string().default('sehir-nabiz-media'),
  STORAGE_PUBLIC_URL: z.string().optional().default('http://127.0.0.1:9000/sehir-nabiz-media'),
  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
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

  // Üretim Ortamı Güvenlik Denetimi (Fail-Closed Production Policy)
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

    if (parsed.data.CORS_ORIGIN === '*' || !parsed.data.CORS_ORIGIN) {
      throw new Error(
        '[SecurityError] Üretim (production) ortamında CORS_ORIGIN="*" kullanılamaz! Lütfen izin verilen alan adlarını virgülle ayrılmış olarak belirtin (örn: https://sehirnabiz.com,https://app.sehirnabiz.com).',
      );
    }

    // Veritabanı Üretim Denetimi: Localhost ve varsayılan geliştirici şifresi engellenir
    const explicitDbHost = config['DB_HOST'];
    const isLocalhostDb =
      explicitDbHost === '127.0.0.1' ||
      explicitDbHost === 'localhost' ||
      explicitDbHost === '::1';

    if (isLocalhostDb) {
      throw new Error(
        '[ProductionSecurityError] Üretim ortamında veritabanı adresi (DB_HOST) localhost/127.0.0.1 olamaz! Yönetilen veya izole veritabanı kümesi adresi belirtilmelidir.',
      );
    }

    const explicitDbPassword = config['DB_PASSWORD'];
    if (
      explicitDbPassword === 'postgres_secure_dev_password'
    ) {
      throw new Error(
        '[ProductionSecurityError] Üretim ortamında varsayılan PostgreSQL şifresi kullanılamaz! Güçlü bir DB_PASSWORD tanımlanmalıdır.',
      );
    }

    // Redis Üretim Denetimi
    const explicitRedisPassword = config['REDIS_PASSWORD'];
    if (
      explicitRedisPassword === 'redis_dev_secret'
    ) {
      throw new Error(
        '[ProductionSecurityError] Üretim ortamında Redis şifresiz veya varsayılan dev şifresiyle çalıştırılamaz! Güçlü bir REDIS_PASSWORD gereklidir.',
      );
    }

    // Depolama (S3 / R2) Üretim Denetimi: Yerel MinIO varsayılanları engellenir
    const explicitStorageEndpoint = config['STORAGE_ENDPOINT'] as string | undefined;
    if (
      explicitStorageEndpoint &&
      (explicitStorageEndpoint.includes('127.0.0.1') || explicitStorageEndpoint.includes('localhost'))
    ) {
      throw new Error(
        '[ProductionSecurityError] Üretim ortamında nesne depolama (STORAGE_ENDPOINT) localhost olamaz! Cloudflare R2 veya AWS S3 uç noktası tanımlanmalıdır.',
      );
    }

    const explicitStorageKey = config['STORAGE_ACCESS_KEY'];
    const explicitStorageSecret = config['STORAGE_SECRET_KEY'];
    if (
      explicitStorageKey === 'minio_admin_user' ||
      explicitStorageSecret === 'minio_secure_dev_password'
    ) {
      throw new Error(
        '[ProductionSecurityError] Üretim ortamında varsayılan MinIO geliştirici anahtarları kullanılamaz! STORAGE_ACCESS_KEY ve STORAGE_SECRET_KEY tanımlanmalıdır.',
      );
    }

    // Diagnostics Secret Üretim Denetimi
    const explicitDiagSecret = config['DIAGNOSTICS_SECRET'] as string | undefined;
    if (
      explicitDiagSecret &&
      (explicitDiagSecret === 'default_internal_diagnostics_secret' || explicitDiagSecret.length < 32)
    ) {
      throw new Error(
        '[ProductionSecurityError] Üretim ortamında DIAGNOSTICS_SECRET en az 32 karakterlik güçlü ve gizli bir token olmalıdır.',
      );
    }
  }

  return parsed.data;
}
