import { describe, it, expect } from 'vitest';
import { io, Socket } from 'socket.io-client';
import * as net from 'net';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function isPortListening(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const s = new net.Socket();
    s.setTimeout(1500);
    s.once('connect', () => {
      s.destroy();
      resolve(true);
    });
    s.once('timeout', () => {
      s.destroy();
      resolve(false);
    });
    s.once('error', () => {
      s.destroy();
      resolve(false);
    });
    s.connect(port, host);
  });
}

function calculatePercentiles(values: number[]) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = Math.round((sum / sorted.length) * 100) / 100;
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  return { min, max, avg, p50, p95, p99 };
}

describe('Phase 16 — WebSocket Staging Yük ve Dayanıklılık Ölçümleri', async () => {
  const isUp = await isPortListening(443);
  if (!isUp) {
    it.skip('Staging 443 portu kapalı, test atlandı', () => {});
    return;
  }

  const url = 'https://localhost/realtime';

  async function benchmarkProfile(targetClients: number) {
    const memBefore = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const sockets: Socket[] = [];
    const connectTimes: number[] = [];
    let successful = 0;
    let failed = 0;

    const batchSize = Math.min(25, targetClients);
    const totalBatches = Math.ceil(targetClients / batchSize);

    for (let b = 0; b < totalBatches; b++) {
      const currentBatch = Math.min(batchSize, targetClients - b * batchSize);
      const batchPromises = Array.from({ length: currentBatch }).map(() => {
        return new Promise<void>((resolve) => {
          const start = Date.now();
          const socket = io(url, {
            transports: ['websocket'],
            rejectUnauthorized: false,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 500,
            timeout: 6000,
          });
          sockets.push(socket);

          socket.once('connect', () => {
            connectTimes.push(Date.now() - start);
            successful++;
            socket.emit('join_room', { room: 'city_istanbul' });
            resolve();
          });

          socket.on('connect_error', () => {
            failed++;
            resolve();
          });
        });
      });

      await Promise.all(batchPromises);
      await new Promise((r) => setTimeout(r, 60));
    }

    // Kısa bekleme
    await new Promise((r) => setTimeout(r, 800));

    // Reconnect test: İlk %10'u disconnect yap ve yeniden bağlanmasını doğrula
    const reconnectCount = Math.max(5, Math.floor(sockets.length * 0.1));
    let reconnected = 0;
    const reconnectPromises = sockets.slice(0, reconnectCount).map((s) => {
      return new Promise<void>((resolve) => {
        s.disconnect();
        setTimeout(() => {
          s.connect();
          s.once('connect', () => {
            reconnected++;
            resolve();
          });
          s.once('connect_error', () => resolve());
        }, 200);
      });
    });
    await Promise.all(reconnectPromises);

    // Temizlik
    for (const s of sockets) {
      if (s.connected) s.disconnect();
    }
    await new Promise((r) => setTimeout(r, 300));

    const memAfter = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const metrics = calculatePercentiles(connectTimes);
    const successRate = (successful / targetClients) * 100;

    return {
      profile: targetClients,
      successful,
      failed,
      successRate: `${successRate.toFixed(1)}%`,
      p50: `${metrics.p50} ms`,
      p95: `${metrics.p95} ms`,
      p99: `${metrics.p99} ms`,
      max: `${metrics.max} ms`,
      reconnectSuccess: `${reconnected}/${reconnectCount}`,
      memoryDelta: `${memAfter - memBefore} MB`,
      raw: { successful, targetClients, metrics, reconnected, reconnectCount },
    };
  }

  it('1. Profil: 50 Eşzamanlı WebSocket Bağlantısı', async () => {
    const res = await benchmarkProfile(50);
    console.table([res]);
    expect(res.raw.successful).toBe(50);
    expect(res.raw.reconnected).toBe(res.raw.reconnectCount);
  }, 15000);

  it('2. Profil: 100 Eşzamanlı WebSocket Bağlantısı', async () => {
    const res = await benchmarkProfile(100);
    console.table([res]);
    expect(res.raw.successful).toBeGreaterThanOrEqual(95);
    expect(res.raw.reconnected).toBeGreaterThanOrEqual(res.raw.reconnectCount - 1);
  }, 20000);

  it('3. Profil: 250 Eşzamanlı WebSocket Bağlantısı', async () => {
    const res = await benchmarkProfile(250);
    console.table([res]);
    expect(res.raw.successful).toBeGreaterThanOrEqual(235);
  }, 35000);

  it('4. Profil: 500 Eşzamanlı WebSocket Bağlantısı', async () => {
    const res = await benchmarkProfile(500);
    console.table([res]);
    expect(res.raw.successful).toBeGreaterThanOrEqual(470);
  }, 60000);
});
