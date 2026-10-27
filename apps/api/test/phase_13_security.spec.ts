import { describe, it, expect } from 'vitest';
import { validateEnvironment } from '../src/config/env.validation';

describe('Phase 13 — Production Ortamı Güvenlik ve Yapılandırma Denetimi', () => {
  const validDevConfig = {
    NODE_ENV: 'development',
    PORT: 3001,
    API_PREFIX: '/api/v1',
    CORS_ORIGIN: '*',
    DATABASE_URL: 'postgresql://postgres:postgres_secure_dev_password@localhost:5434/sehir_nabiz',
    JWT_ACCESS_SECRET: 'sehir_nabiz_default_access_jwt_secret_key_32chars_min!',
    JWT_REFRESH_SECRET: 'sehir_nabiz_default_refresh_jwt_secret_key_32chars_min!',
  };

  it('development ortamında varsayılan JWT anahtarları ve wildcard CORS geçerli olmalı', () => {
    const validated = validateEnvironment(validDevConfig);
    expect(validated.NODE_ENV).toBe('development');
    expect(validated.CORS_ORIGIN).toBe('*');
  });

  it('production ortamında varsayılan JWT anahtarı kullanıldığında SecurityError fırlatılmalı', () => {
    const invalidProdConfig = {
      ...validDevConfig,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://sehirnabiz.com',
      JWT_ACCESS_SECRET: 'sehir_nabiz_default_access_jwt_secret_key_32chars_min!',
      JWT_REFRESH_SECRET: 'a_very_secure_custom_refresh_secret_that_is_at_least_48_bytes_long_123456',
    };

    expect(() => validateEnvironment(invalidProdConfig)).toThrow(
      /Üretim \(production\) ortamında varsayılan JWT gizli anahtarları kullanılamaz/,
    );
  });

  it('production ortamında CORS_ORIGIN="*" wildcard bırakıldığında SecurityError fırlatılmalı', () => {
    const invalidCorsProdConfig = {
      ...validDevConfig,
      NODE_ENV: 'production',
      CORS_ORIGIN: '*',
      JWT_ACCESS_SECRET: 'a_very_secure_custom_access_secret_that_is_at_least_48_bytes_long_123456',
      JWT_REFRESH_SECRET: 'a_very_secure_custom_refresh_secret_that_is_at_least_48_bytes_long_123456',
    };

    expect(() => validateEnvironment(invalidCorsProdConfig)).toThrow(
      /Üretim \(production\) ortamında CORS_ORIGIN="\*" kullanılamaz/,
    );
  });

  it('production ortamında güçlü rastgele anahtarlar ve spesifik CORS alan adı ile doğrulama başarılı olmalı', () => {
    const validProdConfig = {
      ...validDevConfig,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://sehirnabiz.com,https://app.sehirnabiz.com',
      JWT_ACCESS_SECRET: 'super_secure_production_access_secret_key_minimum_48_bytes_long_abcd1234',
      JWT_REFRESH_SECRET: 'super_secure_production_refresh_secret_key_minimum_48_bytes_long_abcd1234',
    };

    const validated = validateEnvironment(validProdConfig);
    expect(validated.NODE_ENV).toBe('production');
    expect(validated.CORS_ORIGIN).toBe('https://sehirnabiz.com,https://app.sehirnabiz.com');
  });
});
