import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private readonly adapterLogger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  constructor(app: any, private readonly configService: ConfigService) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = this.configService.get<number>('REDIS_PORT', 6380);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    try {
      const pubClient = new Redis({
        host,
        port,
        password: password || undefined,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });

      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.adapterLogger.log(`[RedisIoAdapter] Socket.IO Redis Adapter başarıyla bağlandı (${host}:${port})`);
    } catch (err) {
      this.adapterLogger.warn(
        `[RedisIoAdapter] Redis Adapter bağlanamadı, in-memory Socket.IO adaptörüne geri dönülüyor: ${(err as Error).message}`,
      );
      this.adapterConstructor = null;
    }
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor as any);
    }
    return server;
  }
}
