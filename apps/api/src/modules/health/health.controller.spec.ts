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
  });
});
