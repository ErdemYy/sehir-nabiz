import { describe, it, expect } from 'vitest';
import * as net from 'net';
import { execSync } from 'child_process';

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

describe('Phase 16 — PostGIS Uzamsal İndeks ve Analytics Performans Benchmark', async () => {
  const isUp = await isPortListening(443);
  if (!isUp) {
    it.skip('Staging 443 portu kapalı, test atlandı', () => {});
    return;
  }

  const BASE_URL = 'https://localhost/api/v1';

  it('1. PostGIS BBox Uzamsal İndeks (GIST) Kullanımı ve Query Plan Doğrulaması', () => {
    const query = "EXPLAIN (ANALYZE, BUFFERS) SELECT id, title, location FROM events WHERE status = 'ACTIVE' AND ST_Within(location, ST_MakeEnvelope(28.90, 40.95, 29.10, 41.08, 4326)) LIMIT 100;";

    const explainOut = execSync(
      `docker exec sehir_nabiz_staging_postgres psql -U sehir_nabiz_staging_user -d sehir_nabiz_staging -c "${query}"`,
      { encoding: 'utf-8' },
    );

    console.log('\n[PostGIS Query Plan — EXPLAIN ANALYZE]:\n', explainOut);

    // İndeks taraması doğrulaması (Bitmap Index Scan veya Index Scan)
    expect(explainOut).toContain('idx_events_location_gist');
    expect(explainOut).toContain('Execution Time:');
  });

  it('2. GET /events/bbox Benchmark (Kontrollü Hız & Rate-Limit Uyumu)', async () => {
    const west = 28.95;
    const south = 40.95;
    const east = 29.08;
    const north = 41.05;

    const latencies: number[] = [];
    let payloadBytes = 0;

    // 20 istek (Nginx 30r/s burst=20 sınırında kalacak şekilde 40ms aralıklarla)
    for (let i = 0; i < 20; i++) {
      const start = Date.now();
      const res = await fetch(
        `${BASE_URL}/events/bbox?west=${west}&south=${south}&east=${east}&north=${north}&limit=50`,
      );
      expect(res.status).toBe(200);
      const text = await res.text();
      latencies.push(Date.now() - start);
      if (i === 0) payloadBytes = text.length;
      await new Promise((r) => setTimeout(r, 40));
    }

    const m = calculatePercentiles(latencies);
    console.table([
      {
        Endpoint: 'GET /events/bbox',
        Örneklem: 20,
        'p50 (ms)': `${m.p50} ms`,
        'p95 (ms)': `${m.p95} ms`,
        'p99 (ms)': `${m.p99} ms`,
        'Avg (ms)': `${m.avg} ms`,
        'Payload (KB)': (payloadBytes / 1024).toFixed(2),
      },
    ]);

    expect(m.p95).toBeLessThan(200);
  });

  it('3. GET /events/search Benchmark (Full-text Arama & 15 İstek)', async () => {
    const latencies: number[] = [];
    let payloadBytes = 0;

    for (let i = 0; i < 15; i++) {
      const q = i % 2 === 0 ? 'kaza' : 'yoğunluk';
      const start = Date.now();
      const res = await fetch(`${BASE_URL}/events/search?q=${encodeURIComponent(q)}&limit=20`);
      expect(res.status).toBe(200);
      const text = await res.text();
      latencies.push(Date.now() - start);
      if (i === 0) payloadBytes = text.length;
      await new Promise((r) => setTimeout(r, 40));
    }

    const m = calculatePercentiles(latencies);
    console.table([
      {
        Endpoint: 'GET /events/search',
        Örneklem: 15,
        'p50 (ms)': `${m.p50} ms`,
        'p95 (ms)': `${m.p95} ms`,
        'p99 (ms)': `${m.p99} ms`,
        'Avg (ms)': `${m.avg} ms`,
        'Payload (KB)': (payloadBytes / 1024).toFixed(2),
      },
    ]);

    expect(m.p95).toBeLessThan(150);
  });

  it('4. GET /stats/overview ve GET /stats/heatmap Benchmark (15 İstek)', async () => {
    const overviewTimes: number[] = [];
    const heatmapTimes: number[] = [];
    let heatmapPayload = 0;

    for (let i = 0; i < 15; i++) {
      const startOverview = Date.now();
      const resOverview = await fetch(`${BASE_URL}/stats/overview`);
      expect(resOverview.status).toBe(200);
      overviewTimes.push(Date.now() - startOverview);
      await new Promise((r) => setTimeout(r, 40));

      const startHeatmap = Date.now();
      const resHeatmap = await fetch(
        `${BASE_URL}/stats/heatmap?minLng=28.85&minLat=40.90&maxLng=29.20&maxLat=41.15&period=all`,
      );
      expect(resHeatmap.status).toBe(200);
      const heatmapText = await resHeatmap.text();
      heatmapTimes.push(Date.now() - startHeatmap);
      if (i === 0) heatmapPayload = heatmapText.length;
      await new Promise((r) => setTimeout(r, 40));
    }

    const mOverview = calculatePercentiles(overviewTimes);
    const mHeatmap = calculatePercentiles(heatmapTimes);

    console.table([
      {
        Endpoint: 'GET /stats/overview',
        Örneklem: 15,
        'p50 (ms)': `${mOverview.p50} ms`,
        'p95 (ms)': `${mOverview.p95} ms`,
        'p99 (ms)': `${mOverview.p99} ms`,
        'Avg (ms)': `${mOverview.avg} ms`,
      },
      {
        Endpoint: 'GET /stats/heatmap',
        Örneklem: 15,
        'p50 (ms)': `${mHeatmap.p50} ms`,
        'p95 (ms)': `${mHeatmap.p95} ms`,
        'p99 (ms)': `${mHeatmap.p99} ms`,
        'Avg (ms)': `${mHeatmap.avg} ms`,
        'Payload (KB)': (heatmapPayload / 1024).toFixed(2),
      },
    ]);

    expect(mOverview.p95).toBeLessThan(100);
    expect(mHeatmap.p95).toBeLessThan(150);
  });
});
