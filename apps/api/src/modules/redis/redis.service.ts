import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;
  // Güvenlik: Redis çalışmadığında hız sınırlamasının sessizce kapanmasını önleyen bellek içi fallback
  private inMemoryFallback = new Map<string, { count: number; expiresAt: number }>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    try {
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        retryStrategy: times => {
          if (times > 3) {
            this.logger.warn(
              `[RedisService] Redis bağlantısı kurulamadı. Bellek içi (in-memory) güvenlik fallback'i devrede.`,
            );
            return null; // Yeniden denemeyi durdur
          }
          return Math.min(times * 200, 1000);
        },
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`[RedisService] Redis bağlantısı başarıyla sağlandı (${host}:${port})`);
      });

      this.client.on('error', err => {
        this.isConnected = false;
        this.logger.warn(`[RedisService] Redis bağlantı uyarısı: ${err.message}`);
      });

      // Arka planda bağlanmayı dene
      this.client.connect().catch(() => {
        this.isConnected = false;
        this.logger.warn(
          `[RedisService] Redis sunucusuna erişilemedi. Güvenlik önlemleri in-memory depolama ile korunuyor.`,
        );
      });
    } catch (error) {
      this.isConnected = false;
      this.logger.error('[RedisService] Redis başlatma hatası:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
    this.inMemoryFallback.clear();
  }

  get isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Güvenli Hız Sınırlaması Kontrolü (Rate Limiting)
   * Redis aktifse atomic INCR/EXPIRE; erişilemezse in-memory sliding window kullanır.
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();

    if (this.isConnected && this.client) {
      try {
        const fullKey = `ratelimit:${key}`;
        const current = await this.client.incr(fullKey);
        if (current === 1) {
          await this.client.expire(fullKey, windowSeconds);
        }
        return {
          allowed: current <= limit,
          remaining: Math.max(0, limit - current),
        };
      } catch (err) {
        this.logger.warn(
          `[RedisService] Redis rate limit sorgu hatası, bellek fallback'ine geçiliyor: ${(err as Error).message}`,
        );
      }
    }

    // In-memory Güvenlik Fallback'i
    const record = this.inMemoryFallback.get(key);
    if (!record || now > record.expiresAt) {
      this.inMemoryFallback.set(key, {
        count: 1,
        expiresAt: now + windowSeconds * 1000,
      });
      return { allowed: true, remaining: limit - 1 };
    }

    record.count += 1;
    return {
      allowed: record.count <= limit,
      remaining: Math.max(0, limit - record.count),
    };
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        return null;
      }
    }
    return null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
      } catch {}
    }
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch {}
    }
  }
}
