import { Controller, Get, Optional, Inject, Logger, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { HealthCheckResponse } from '@sehir-nabiz/shared';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { DiagnosticsGuard } from './guards/diagnostics.guard';

export interface ReadinessResponse {
  status: 'ok' | 'degraded' | 'error';
  database?: 'connected' | 'disconnected';
  redis?: 'connected' | 'disconnected';
  storage?: 'connected' | 'disconnected';
  timestamp: string;
}

export interface DiagnosticsResponse {
  status: 'ok' | 'warning' | 'critical';
  uptimeSeconds: number;
  services: {
    database: boolean;
    redis: boolean;
    storage: boolean;
  };
  metrics: {
    websocketConnectedClients: number;
    outbox: {
      pending: number;
      processing: number;
      processed: number;
      failed: number;
    };
    accountDeletion: {
      pending: number;
      processing: number;
      completed: number;
      failed: number;
      cancelled: number;
    };
  };
  timestamp: string;
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly startTime = Date.now();

  constructor(
    @Optional() @Inject(DataSource) private readonly dataSource?: DataSource,
    @Optional() private readonly redisService?: RedisService,
    @Optional() private readonly storageService?: StorageService,
    @Optional() private readonly realtimeGateway?: RealtimeGateway,
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
  async getReadiness(@Req() req?: Request): Promise<ReadinessResponse> {
    const isDbConnected = Boolean(this.dataSource?.isInitialized);
    const isRedisConnected = Boolean(this.redisService?.isReady);

    let isStorageConnected = false;
    if (this.storageService) {
      try {
        isStorageConnected = await this.storageService.checkHealth();
      } catch {
        isStorageConnected = false;
      }
    }

    let status: ReadinessResponse['status'] = 'ok';
    if (!isDbConnected) {
      status = 'error';
    } else if (!isRedisConnected || !isStorageConnected) {
      status = 'degraded';
    }

    // Bilgi ifşasını önleme (Information Leakage Prevention):
    // Kamusal ters vekil üzerinden gelen isteklere altyapı bileşenleri (DB, Redis, S3)
    // ifşa edilmez; yalnızca üst düzey 'status' döndürülür.
    const hasDiagnosticsKey = req?.headers?.['x-diagnostics-key'] || req?.headers?.['x-internal-token'];
    const isExternalPublic = Boolean(req?.headers?.['x-forwarded-for']) && !hasDiagnosticsKey;

    if (isExternalPublic) {
      return {
        status,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status,
      database: isDbConnected ? 'connected' : 'disconnected',
      redis: isRedisConnected ? 'connected' : 'disconnected',
      storage: isStorageConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Operasyonel Görünürlük ve Teşhis Paneli (GET /health/diagnostics)
   * Kişisel veri (PII) içermeyen, sistem sağlığı ve kuyruk metriklerini sunar.
   * Yalnızca ADMIN yetkisi veya x-diagnostics-key ile erişilebilir.
   */
  @Get('diagnostics')
  @UseGuards(DiagnosticsGuard)
  async getDiagnostics(): Promise<DiagnosticsResponse> {
    const isDbConnected = Boolean(this.dataSource?.isInitialized);
    const isRedisConnected = Boolean(this.redisService?.isReady);

    let isStorageConnected = false;
    if (this.storageService) {
      try {
        isStorageConnected = await this.storageService.checkHealth();
      } catch {
        isStorageConnected = false;
      }
    }

    const outboxCounts = { pending: 0, processing: 0, processed: 0, failed: 0 };
    const deletionCounts = { pending: 0, processing: 0, completed: 0, failed: 0, cancelled: 0 };

    if (isDbConnected && this.dataSource) {
      try {
        const outboxRows: Array<{ status: string; count: string }> = await this.dataSource.query(
          `SELECT "status", COUNT(*)::text as count FROM "outbox_events" GROUP BY "status";`,
        );
        for (const row of outboxRows) {
          const s = row.status?.toLowerCase();
          if (s in outboxCounts) {
            (outboxCounts as any)[s] = parseInt(row.count, 10);
          }
        }

        const deletionRows: Array<{ status: string; count: string }> = await this.dataSource.query(
          `SELECT "status", COUNT(*)::text as count FROM "account_deletion_requests" GROUP BY "status";`,
        );
        for (const row of deletionRows) {
          const s = row.status?.toLowerCase();
          if (s in deletionCounts) {
            (deletionCounts as any)[s] = parseInt(row.count, 10);
          }
        }
      } catch (dbErr) {
        this.logger.warn(`Diagnostics sorgu hatası: ${(dbErr as Error).message}`);
      }
    }

    const wsClients = this.realtimeGateway?.getConnectedCount?.() ?? 0;

    let overallStatus: DiagnosticsResponse['status'] = 'ok';
    if (!isDbConnected) {
      overallStatus = 'critical';
    } else if (!isRedisConnected || !isStorageConnected || outboxCounts.failed > 0 || deletionCounts.failed > 0) {
      overallStatus = 'warning';
    }

    return {
      status: overallStatus,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      services: {
        database: isDbConnected,
        redis: isRedisConnected,
        storage: isStorageConnected,
      },
      metrics: {
        websocketConnectedClients: wsClients,
        outbox: outboxCounts,
        accountDeletion: deletionCounts,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
