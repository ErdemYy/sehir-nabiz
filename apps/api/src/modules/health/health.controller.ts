import { Controller, Get, Optional, Inject } from '@nestjs/common';
import type { HealthCheckResponse } from '@sehir-nabiz/shared';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';

export interface ReadinessResponse {
  status: 'ok' | 'degraded' | 'error';
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    @Optional() @Inject(DataSource) private readonly dataSource?: DataSource,
    @Optional() private readonly redisService?: RedisService,
  ) {}

  @Get()
  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'sehir-nabiz-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  @Get('ready')
  async getReadiness(): Promise<ReadinessResponse> {
    const isDbConnected = Boolean(this.dataSource?.isInitialized);
    const isRedisConnected = Boolean(this.redisService?.isReady);

    let status: ReadinessResponse['status'] = 'ok';
    if (!isDbConnected) {
      status = 'degraded';
    }

    return {
      status,
      database: isDbConnected ? 'connected' : 'disconnected',
      redis: isRedisConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
