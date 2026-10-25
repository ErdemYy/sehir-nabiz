import { z } from 'zod';

export const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),
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

  return parsed.data;
}
