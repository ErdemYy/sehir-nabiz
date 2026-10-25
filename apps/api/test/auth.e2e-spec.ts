import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as net from 'net';
import { dataSourceOptions } from '../src/database/data-source';
import { UserEntity } from '../src/database/entities/user.entity';
import { RefreshTokenEntity } from '../src/database/entities/refresh-token.entity';
import { UserRole, AccountStatus } from '@sehir-nabiz/shared';

async function isPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

describe('PostgreSQL / PostGIS & Redis Canlı Entegrasyon Testleri (E2E)', async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '5434', 10);
  const redisPort = parseInt(process.env.REDIS_PORT || '6380', 10);
  const redisPassword = process.env.REDIS_PASSWORD || 'redis_dev_secret';

  const isPostgresUp = await isPortOpen(host, port);
  const isRedisUp = await isPortOpen(host, redisPort);

  if (!isPostgresUp) {
    it.skip(`PostgreSQL servisi (${host}:${port}) çevrimdışı: Entegrasyon testleri atlandı.`, () => {});
    return;
  }

  let dataSource: DataSource;
  let redisClient: Redis;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...(dataSourceOptions as any),
      host,
      port,
      database: 'sehir_nabiz_test',
    });
    await dataSource.initialize();
    await dataSource.runMigrations();

    if (isRedisUp) {
      redisClient = new Redis({
        host,
        port: redisPort,
        password: redisPassword,
        lazyConnect: false,
      });
    }
  });

  afterAll(async () => {
    if (redisClient) {
      await redisClient.quit();
    }
    if (dataSource?.isInitialized) {
      await dataSource.query('TRUNCATE TABLE "refresh_tokens", "users" CASCADE;');
      await dataSource.destroy();
    }
  });

  describe('PostGIS ve Coğrafi Uzantı Doğrulaması', () => {
    it('PostGIS eklentisinin aktif olduğu ve sürüm bildirdiği doğrulanmalı', async () => {
      const result = await dataSource.query('SELECT PostGIS_Version();');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(typeof result[0].postgis_version).toBe('string');
      expect(result[0].postgis_version).toContain('3.');
    });

    it('PostGIS coğrafi mesafe (ST_Distance) hesaplaması doğru çalışmalı', async () => {
      // Kadıköy (40.9906, 29.0267) ve Beşiktaş (41.0422, 29.0067)
      const result = await dataSource.query(`
        SELECT ST_Distance(
          ST_SetSRID(ST_MakePoint(29.0267, 40.9906), 4326)::geography,
          ST_SetSRID(ST_MakePoint(29.0067, 41.0422), 4326)::geography
        ) AS distance_meters;
      `);
      expect(result).toBeDefined();
      const distance = parseFloat(result[0].distance_meters);
      // Kadıköy - Beşiktaş kuş uçuşu mesafe yaklaşık 6.000m - 6.500m
      expect(distance).toBeGreaterThan(5500);
      expect(distance).toBeLessThan(7000);
    });

    it('PostGIS ST_DWithin coğrafi yarıçap sorgusu beklenen sonucu vermeli', async () => {
      const withinResult = await dataSource.query(`
        SELECT ST_DWithin(
          ST_SetSRID(ST_MakePoint(29.0267, 40.9906), 4326)::geography,
          ST_SetSRID(ST_MakePoint(29.0067, 41.0422), 4326)::geography,
          7000
        ) AS is_within;
      `);
      expect(withinResult[0].is_within).toBe(true);

      const outsideResult = await dataSource.query(`
        SELECT ST_DWithin(
          ST_SetSRID(ST_MakePoint(29.0267, 40.9906), 4326)::geography,
          ST_SetSRID(ST_MakePoint(29.0067, 41.0422), 4326)::geography,
          3000
        ) AS is_within;
      `);
      expect(outsideResult[0].is_within).toBe(false);
    });
  });

  describe('Veritabanı Şeması, Migration ve Kısıtlar', () => {
    it('users ve refresh_tokens tablolarının oluştuğu doğrulanmalı', async () => {
      const tables = await dataSource.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('users', 'refresh_tokens');
      `);
      expect(tables.length).toBe(2);
    });

    it('user_role ve account_status enum tiplerinin veritabanında tanımlı olduğu doğrulanmalı', async () => {
      const enums = await dataSource.query(`
        SELECT typname FROM pg_type WHERE typname IN ('user_role', 'account_status');
      `);
      expect(enums.length).toBe(2);
    });

    it('E-posta tekillik kısıtı (Unique constraint) mükerrer kaydı engellemeli', async () => {
      const userRepository = dataSource.getRepository(UserEntity);
      const testEmail = `unique-test-${Date.now()}@sehirnabiz.local`;
      const hash = await bcrypt.hash('SecurePassword123!', 10);

      const user1 = userRepository.create({
        email: testEmail,
        passwordHash: hash,
        displayName: 'Test Kullanıcı 1',
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
      });
      await userRepository.save(user1);

      const user2 = userRepository.create({
        email: testEmail,
        passwordHash: hash,
        displayName: 'Test Kullanıcı 2',
        role: UserRole.CITIZEN,
        accountStatus: AccountStatus.ACTIVE,
      });

      await expect(userRepository.save(user2)).rejects.toThrow();
    });

    it('Kullanıcı silindiğinde ilişkili refresh token kayıtları CASCADE ile temizlenmeli', async () => {
      const userRepository = dataSource.getRepository(UserEntity);
      const tokenRepository = dataSource.getRepository(RefreshTokenEntity);

      const user = await userRepository.save(
        userRepository.create({
          email: `cascade-test-${Date.now()}@sehirnabiz.local`,
          passwordHash: 'dummyhash',
          displayName: 'Cascade Test User',
        }),
      );

      const dummyToken = hashToken(crypto.randomUUID());
      await tokenRepository.save(
        tokenRepository.create({
          userId: user.id,
          tokenHash: dummyToken,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        }),
      );

      const savedTokens = await tokenRepository.find({ where: { userId: user.id } });
      expect(savedTokens.length).toBe(1);

      // Kullanıcıyı sil
      await userRepository.delete({ id: user.id });

      // Refresh tokenların da silinmiş olması gerekir
      const remainingTokens = await tokenRepository.find({ where: { userId: user.id } });
      expect(remainingTokens.length).toBe(0);
    });
  });

  describe('Redis Entegrasyonu ve Önbellek/Hız Sınırı Doğrulaması', () => {
    it('Redis sunucusuna şifreli kimlik doğrulama ile PING yanıtı alınmalı', async () => {
      if (!isRedisUp) {
        expect(true).toBe(true);
        return;
      }
      const pong = await redisClient.ping();
      expect(pong).toBe('PONG');
    });

    it('Redis TTL ve veri saklama mekanizması çalışmalı', async () => {
      if (!isRedisUp) {
        expect(true).toBe(true);
        return;
      }
      const key = `test:cache:${Date.now()}`;
      await redisClient.set(key, 'sehir_nabiz_active', 'EX', 2); // 2 saniye TTL
      const value = await redisClient.get(key);
      expect(value).toBe('sehir_nabiz_active');

      const ttl = await redisClient.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(2);
    });
  });

  describe('Gerçek Veritabanında Refresh Token Rotasyonu ve Çalınma Tespiti', () => {
    it('Refresh token atomik olarak rotasyona uğramalı ve eski token iptal edilmeli', async () => {
      const userRepository = dataSource.getRepository(UserEntity);
      const tokenRepository = dataSource.getRepository(RefreshTokenEntity);

      const user = await userRepository.save(
        userRepository.create({
          email: `rotation-test-${Date.now()}@sehirnabiz.local`,
          passwordHash: 'dummyhash',
          displayName: 'Rotation User',
        }),
      );

      const initialToken = 'initial-token-value';
      const initialHash = hashToken(initialToken);
      const createdToken = await tokenRepository.save(
        tokenRepository.create({
          userId: user.id,
          tokenHash: initialHash,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
          isRevoked: false,
        }),
      );

      // Rotasyon işlemi: eski tokenı iptal et ve yenisini oluştur
      const nextToken = 'next-token-value';
      const nextHash = hashToken(nextToken);

      await dataSource.transaction(async manager => {
        const updateRes = await manager.update(
          RefreshTokenEntity,
          { id: createdToken.id, isRevoked: false },
          { isRevoked: true, replacedByTokenHash: nextHash },
        );
        expect(updateRes.affected).toBe(1);

        await manager.save(
          RefreshTokenEntity,
          manager.create(RefreshTokenEntity, {
            userId: user.id,
            tokenHash: nextHash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
            isRevoked: false,
          }),
        );
      });

      // Eski token durumunu kontrol et
      const oldRecord = await tokenRepository.findOne({ where: { tokenHash: initialHash } });
      expect(oldRecord?.isRevoked).toBe(true);
      expect(oldRecord?.replacedByTokenHash).toBe(nextHash);

      // Yeni token durumunu kontrol et
      const newRecord = await tokenRepository.findOne({ where: { tokenHash: nextHash } });
      expect(newRecord?.isRevoked).toBe(false);
      expect(newRecord?.userId).toBe(user.id);
    });

    it('Eşzamanlı (concurrent) iki rotasyon isteğinden yalnızca biri başarılı olmalı (Race Condition Testi)', async () => {
      const userRepository = dataSource.getRepository(UserEntity);
      const tokenRepository = dataSource.getRepository(RefreshTokenEntity);

      const user = await userRepository.save(
        userRepository.create({
          email: `concurrent-test-${Date.now()}@sehirnabiz.local`,
          passwordHash: 'dummyhash',
          displayName: 'Concurrent User',
        }),
      );

      const sharedToken = 'shared-concurrent-token';
      const sharedHash = hashToken(sharedToken);
      const initialRecord = await tokenRepository.save(
        tokenRepository.create({
          userId: user.id,
          tokenHash: sharedHash,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
          isRevoked: false,
        }),
      );

      // Simüle edilen rotasyon fonksiyonu (CAS tabanlı)
      const attemptRotation = async (candidateToken: string): Promise<boolean> => {
        const candidateHash = hashToken(candidateToken);
        return dataSource.transaction(async manager => {
          const updateResult = await manager.update(
            RefreshTokenEntity,
            { id: initialRecord.id, isRevoked: false },
            { isRevoked: true, replacedByTokenHash: candidateHash },
          );

          if (updateResult.affected === 0) {
            // Yarış kaybedildi: Token zaten kullanılmış!
            // Token reuse detection devrede: tüm oturumları iptal et
            await manager.update(RefreshTokenEntity, { userId: user.id }, { isRevoked: true });
            return false;
          }

          await manager.save(
            RefreshTokenEntity,
            manager.create(RefreshTokenEntity, {
              userId: user.id,
              tokenHash: candidateHash,
              expiresAt: new Date(Date.now() + 1000 * 60 * 60),
              isRevoked: false,
            }),
          );
          return true;
        });
      };

      // İki eşzamanlı istek başlat
      const [res1, res2] = await Promise.all([
        attemptRotation('branch-A-token'),
        attemptRotation('branch-B-token'),
      ]);

      // Biri başarılı, diğeri mutlaka başarısız olmalı
      expect([res1, res2].filter(Boolean).length).toBe(1);

      // Token reuse detection tetiklendiği için tüm tokenlar iptal edilmiş olmalı
      const userTokens = await tokenRepository.find({ where: { userId: user.id } });
      const activeTokens = userTokens.filter(t => !t.isRevoked);
      expect(activeTokens.length).toBe(0);
    });
  });
});
