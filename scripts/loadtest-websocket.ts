/**
 * ==============================================================================
 * ŞehirNabız — Phase 16: WebSocket Staging Yük ve Dayanıklılık Testi
 * ==============================================================================
 * Profil Basamakları: 50, 100, 250, 500 Eşzamanlı Bağlantı
 * Ölçümler: Başarı oranı, bağlantı süresi, p50/p95/p99, bellek, reconnect ve temizlik
 * ==============================================================================
 */

import { io, Socket } from 'socket.io-client';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface LoadProfileResult {
  profile: number;
  attempted: number;
  successful: number;
  failed: number;
  successRatePct: number;
  connectTimesMs: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  reconnectSuccessCount: number;
  durationMs: number;
  memoryBeforeMb: number;
  memoryAfterMb: number;
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

async function runProfile(targetClients: number, url: string): Promise<LoadProfileResult> {
  console.log(`\n---------------------------------------------------------`);
  console.log(`[WebSocket Load Test] Başlatılıyor: Profil = ${targetClients} Eşzamanlı Bağlantı`);
  console.log(`Hedef URL: ${url}`);
  console.log(`---------------------------------------------------------`);

  const memBefore = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const startTime = Date.now();
  const sockets: Socket[] = [];
  const connectTimes: number[] = [];
  let successful = 0;
  let failed = 0;

  // Bağlantıları partiler halinde kontrollü başlat (Ramp-up)
  const batchSize = Math.min(25, targetClients);
  const totalBatches = Math.ceil(targetClients / batchSize);

  for (let b = 0; b < totalBatches; b++) {
    const currentBatchSize = Math.min(batchSize, targetClients - b * batchSize);
    const batchPromises: Promise<void>[] = [];

    for (let i = 0; i < currentBatchSize; i++) {
      batchPromises.push(
        new Promise<void>((resolve) => {
          const connStart = Date.now();
          const socket = io(url, {
            transports: ['websocket'],
            rejectUnauthorized: false,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            timeout: 7000,
          });

          sockets.push(socket);

          socket.on('connect', () => {
            const elapsed = Date.now() - connStart;
            connectTimes.push(elapsed);
            successful++;
            socket.emit('join_room', { room: `city_istanbul` });
            resolve();
          });

          socket.on('connect_error', () => {
            failed++;
            resolve();
          });
        }),
      );
    }

    await Promise.all(batchPromises);
    // Küçük aralıklarla ramp-up yükü yay
    await new Promise((r) => setTimeout(r, 80));
  }

  // 1 saniye odalarda kal ve mesaj/heartbeat bekle
  await new Promise((r) => setTimeout(r, 1000));

  // Reconnect stres testi (Bağlantıların %10'unu anlık kesip geri bağla)
  const reconnectCandidates = sockets.slice(0, Math.max(5, Math.floor(sockets.length * 0.1)));
  let reconnectSuccessCount = 0;

  const reconnectPromises = reconnectCandidates.map((sock) => {
    return new Promise<void>((resolve) => {
      sock.disconnect();
      setTimeout(() => {
        sock.connect();
        sock.once('connect', () => {
          reconnectSuccessCount++;
          resolve();
        });
        sock.once('connect_error', () => resolve());
      }, 300);
    });
  });

  await Promise.all(reconnectPromises);

  // Kaynak temizliği (Disconnect all)
  for (const s of sockets) {
    if (s.connected) s.disconnect();
  }

  // Socket kuyruklarının boşalması için kısa bekleme
  await new Promise((r) => setTimeout(r, 400));

  const durationMs = Date.now() - startTime;
  const memAfter = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const successRatePct = Math.round((successful / targetClients) * 1000) / 10;
  const metrics = calculatePercentiles(connectTimes);

  console.log(`[Sonuç] ${targetClients} İstemci: Başarılı=${successful}, Başarısız=${failed} (${successRatePct}%)`);
  console.log(`[Gecikme] Min=${metrics.min}ms, Avg=${metrics.avg}ms, p50=${metrics.p50}ms, p95=${metrics.p95}ms, p99=${metrics.p99}ms, Max=${metrics.max}ms`);
  console.log(`[Reconnect] Başarı=${reconnectSuccessCount}/${reconnectCandidates.length}`);
  console.log(`[Bellek] Başlangıç=${memBefore}MB, Bitiş=${memAfter}MB`);

  return {
    profile: targetClients,
    attempted: targetClients,
    successful,
    failed,
    successRatePct,
    connectTimesMs: metrics,
    reconnectSuccessCount,
    durationMs,
    memoryBeforeMb: memBefore,
    memoryAfterMb: memAfter,
  };
}

export async function runAllWebSocketLoadTests(): Promise<LoadProfileResult[]> {
  const url = 'https://localhost/realtime';
  const profiles = [50, 100, 250, 500];
  const results: LoadProfileResult[] = [];

  for (const p of profiles) {
    const res = await runProfile(p, url);
    results.push(res);
    // Profiller arası 1.5 saniye soğuma
    await new Promise((r) => setTimeout(r, 1500));
  }

  return results;
}

if (process.argv[1]?.includes('loadtest-websocket')) {
  runAllWebSocketLoadTests()
    .then((results) => {
      console.log('\n=========================================================');
      console.log('  TÜM WEBSOCKET YÜK TESTLERİ BAŞARIYLA TAMAMLANDI');
      console.log('=========================================================');
      console.table(
        results.map((r) => ({
          Profil: r.profile,
          'Başarı %': `${r.successRatePct}%`,
          'p50 (ms)': r.connectTimesMs.p50,
          'p95 (ms)': r.connectTimesMs.p95,
          'p99 (ms)': r.connectTimesMs.p99,
          'Max (ms)': r.connectTimesMs.max,
          'Reconnect Başarı': r.reconnectSuccessCount,
          'Bellek Değişimi': `${r.memoryAfterMb - r.memoryBeforeMb} MB`,
        })),
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error('Yük testi hatası:', err);
      process.exit(1);
    });
}
