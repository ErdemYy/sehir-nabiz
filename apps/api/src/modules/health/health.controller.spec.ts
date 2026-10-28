import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('controller tanımlı olmalı', () => {
    expect(controller).toBeDefined();
  });

  it('sağlık durumu başarılı (ok) dönmeli', () => {
    const health = controller.getHealth();
    expect(health.status).toBe('ok');
    expect(health.service).toBe('sehir-nabiz-api');
    expect(typeof health.uptimeSeconds).toBe('number');
    expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('readiness endpoint hazır olma durumunu raporlamalı', async () => {
    const ready = await controller.getReadiness();
    expect(ready).toBeDefined();
    expect(['ok', 'degraded', 'error']).toContain(ready.status);
    expect(['connected', 'disconnected']).toContain(ready.database);
    expect(['connected', 'disconnected']).toContain(ready.redis);
    expect(['connected', 'disconnected']).toContain(ready.storage);
  });

  it('diagnostics endpoint operasyonel metrikleri PII içermeden dönmeli', async () => {
    const mockDataSource = {
      isInitialized: true,
      query: (sql: string) => {
        if (sql.includes('outbox_events')) {
          return Promise.resolve([
            { status: 'PENDING', count: '3' },
            { status: 'PROCESSED', count: '10' },
          ]);
        }
        if (sql.includes('account_deletion_requests')) {
          return Promise.resolve([
            { status: 'PENDING', count: '1' },
            { status: 'COMPLETED', count: '5' },
          ]);
        }
        return Promise.resolve([]);
      },
    };
    const mockRedis = { isReady: true };
    const mockStorage = { checkHealth: () => Promise.resolve(true) };
    const mockRealtime = { getConnectedCount: () => 4 };

    const diagController = new HealthController(
      mockDataSource as any,
      mockRedis as any,
      mockStorage as any,
      mockRealtime as any,
    );

    const diag = await diagController.getDiagnostics();
    expect(diag.status).toBe('ok');
    expect(diag.services.database).toBe(true);
    expect(diag.services.redis).toBe(true);
    expect(diag.services.storage).toBe(true);
    expect(diag.metrics.websocketConnectedClients).toBe(4);
    expect(diag.metrics.outbox.pending).toBe(3);
    expect(diag.metrics.outbox.processed).toBe(10);
    expect(diag.metrics.accountDeletion.pending).toBe(1);
    expect(diag.metrics.accountDeletion.completed).toBe(5);
  });
});
