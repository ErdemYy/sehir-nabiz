const { Client } = require('pg');
const Redis = require('ioredis');
const os = require('os');

async function runBenchmark() {
  console.log('=== ŞehirNabız Phase 11 Kontrollü Performans Benchmark Başlatılıyor ===');

  const systemInfo = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpus: os.cpus().length + 'x ' + os.cpus()[0]?.model,
    totalMemoryGB: (os.totalmem() / (1024 ** 3)).toFixed(2),
  };
  console.log('Sistem Donanımı:', systemInfo);

  const pgClient = new Client({
    connectionString: 'postgres://postgres:postgres_secure_dev_password@localhost:5434/sehir_nabiz',
  });
  await pgClient.connect();

  const redis = new Redis({
    host: '127.0.0.1',
    port: 6380,
    password: 'redis_dev_secret',
  });

  const results = {
    systemInfo,
    datasets: {},
    cacheComparison: {},
    conclusions: [],
  };

  try {
    // 1. Benchmark tablosu oluştur
    console.log('\n[1/4] İzole Benchmark tablosu hazırlanıyor...');
    await pgClient.query(`
      DROP TABLE IF EXISTS benchmark_events;
      CREATE TABLE benchmark_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        location GEOMETRY(Point, 4326) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX idx_benchmark_location ON benchmark_events USING GIST(location);
      CREATE INDEX idx_benchmark_created_at ON benchmark_events(created_at DESC);
    `);

    const datasetSizes = [1000, 10000, 100000];

    for (const size of datasetSizes) {
      console.log(`\n--- Test Hacmi: ${size.toLocaleString()} Olay ---`);

      // Veri üretimi
      console.log(`Veriler üretiliyor (${size} kayıt)...`);
      const batchSize = 5000;
      let inserted = 0;
      while (inserted < size) {
        const currentBatch = Math.min(batchSize, size - inserted);
        const rows = [];
        for (let i = 0; i < currentBatch; i++) {
          const isUrban = Math.random() < 0.75; // %75 kentsel yoğunluk
          let lng, lat;
          if (isUrban) {
            // Kayseri merkez [35.46 - 35.52, 38.70 - 38.75]
            lng = 35.46 + Math.random() * 0.06;
            lat = 38.70 + Math.random() * 0.05;
          } else {
            // Çevre ilçeler [35.10 - 35.90, 38.40 - 39.00]
            lng = 35.10 + Math.random() * 0.80;
            lat = 38.40 + Math.random() * 0.60;
          }
          const cat = ['TRAFFIC', 'INFRASTRUCTURE', 'ACCIDENT', 'WEATHER', 'PUBLIC_TRANSPORT'][Math.floor(Math.random() * 5)];
          rows.push(`('Olay ${inserted + i}', 'Sentetik benchmark açıklaması', '${cat}', 'ACTIVE', ST_SetSRID(ST_MakePoint(${lng.toFixed(6)}, ${lat.toFixed(6)}), 4326), NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days')`);
        }

        await pgClient.query(`
          INSERT INTO benchmark_events (title, description, category, status, location, created_at)
          VALUES ${rows.join(', ')}
        `);
        inserted += currentBatch;
      }

      await pgClient.query(`VACUUM ANALYZE benchmark_events;`);

      // 1. Raw BBox Sorgusu (Limit 50)
      console.log('Raw BBox (Limit 50) sorgusu test ediliyor...');
      const rawTimes = [];
      let rawPayloadSize = 0;
      let explainRaw = '';

      for (let i = 0; i < 30; i++) {
        const start = performance.now();
        const res = await pgClient.query(`
          SELECT id, title, category, ST_X(location) AS lng, ST_Y(location) AS lat, created_at
          FROM benchmark_events
          WHERE location && ST_MakeEnvelope(35.45, 38.69, 35.53, 38.76, 4326)
            AND status = 'ACTIVE'
          ORDER BY created_at DESC
          LIMIT 50;
        `);
        const duration = performance.now() - start;
        rawTimes.push(duration);
        if (i === 0) {
          rawPayloadSize = Buffer.byteLength(JSON.stringify(res.rows), 'utf8');
        }
      }

      const explainRawRes = await pgClient.query(`
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT id, title, category, ST_X(location) AS lng, ST_Y(location) AS lat, created_at
        FROM benchmark_events
        WHERE location && ST_MakeEnvelope(35.45, 38.69, 35.53, 38.76, 4326)
          AND status = 'ACTIVE'
        ORDER BY created_at DESC
        LIMIT 50;
      `);
      explainRaw = explainRawRes.rows.map(r => r['QUERY PLAN']).join('\n');

      // 2. Grid Agregasyon / Heatmap Sorgusu
      console.log('Grid Agregasyon (Heatmap ST_SnapToGrid / Rounding) sorgusu test ediliyor...');
      const gridTimes = [];
      let gridPayloadSize = 0;
      let explainGrid = '';
      let totalAggregatedClusters = 0;

      for (let i = 0; i < 30; i++) {
        const start = performance.now();
        const res = await pgClient.query(`
          SELECT 
            ROUND(ST_Y(location)::numeric, 3)::float AS lat,
            ROUND(ST_X(location)::numeric, 3)::float AS lng,
            COUNT(id)::int AS count
          FROM benchmark_events
          WHERE location && ST_MakeEnvelope(35.45, 38.69, 35.53, 38.76, 4326)
            AND status = 'ACTIVE'
          GROUP BY ROUND(ST_Y(location)::numeric, 3), ROUND(ST_X(location)::numeric, 3)
          ORDER BY count DESC
          LIMIT 1000;
        `);
        const duration = performance.now() - start;
        gridTimes.push(duration);
        if (i === 0) {
          gridPayloadSize = Buffer.byteLength(JSON.stringify(res.rows), 'utf8');
          totalAggregatedClusters = res.rows.length;
        }
      }

      const explainGridRes = await pgClient.query(`
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT 
          ROUND(ST_Y(location)::numeric, 3)::float AS lat,
          ROUND(ST_X(location)::numeric, 3)::float AS lng,
          COUNT(id)::int AS count
        FROM benchmark_events
        WHERE location && ST_MakeEnvelope(35.45, 38.69, 35.53, 38.76, 4326)
          AND status = 'ACTIVE'
        GROUP BY ROUND(ST_Y(location)::numeric, 3), ROUND(ST_X(location)::numeric, 3)
        ORDER BY count DESC
        LIMIT 1000;
      `);
      explainGrid = explainGridRes.rows.map(r => r['QUERY PLAN']).join('\n');

      const calcStats = arr => {
        arr.sort((a, b) => a - b);
        const mean = arr.reduce((acc, v) => acc + v, 0) / arr.length;
        const p50 = arr[Math.floor(arr.length * 0.50)];
        const p95 = arr[Math.floor(arr.length * 0.95)];
        const p99 = arr[Math.floor(arr.length * 0.99)];
        return {
          meanMs: Number(mean.toFixed(2)),
          p50Ms: Number(p50.toFixed(2)),
          p95Ms: Number(p95.toFixed(2)),
          p99Ms: Number(p99.toFixed(2)),
        };
      };

      results.datasets[size] = {
        rawBBox: {
          ...calcStats(rawTimes),
          payloadBytes: rawPayloadSize,
          explainPlan: explainRaw,
        },
        gridHeatmap: {
          ...calcStats(gridTimes),
          payloadBytes: gridPayloadSize,
          clusterCount: totalAggregatedClusters,
          explainPlan: explainGrid,
        },
      };

      console.log(`Sonuç (${size}): Raw p50=${results.datasets[size].rawBBox.p50Ms}ms, Grid p50=${results.datasets[size].gridHeatmap.p50Ms}ms`);
    }

    // 3. Redis Cache Hit vs Miss Testi
    console.log('\n[3/4] Redis Cache Hit vs Miss Karşılaştırması ölçülüyor...');
    const cacheKey = 'benchmark:stats:kayseri:7d';
    const samplePayload = JSON.stringify(results.datasets[10000].gridHeatmap);

    // Miss: DB'den sorgula ve Redis'e yaz
    const missTimes = [];
    for (let i = 0; i < 20; i++) {
      await redis.del(cacheKey);
      const start = performance.now();
      // DB sorgusu
      await pgClient.query(`
        SELECT COUNT(id)::int AS total FROM benchmark_events WHERE status = 'ACTIVE';
      `);
      await redis.set(cacheKey, samplePayload, 'EX', 60);
      missTimes.push(performance.now() - start);
    }

    // Hit: Yalnızca Redis'ten oku
    const hitTimes = [];
    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      await redis.get(cacheKey);
      hitTimes.push(performance.now() - start);
    }

    const calcArr = arr => {
      arr.sort((a, b) => a - b);
      return {
        meanMs: Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)),
        p50Ms: Number(arr[Math.floor(arr.length * 0.50)].toFixed(2)),
        p95Ms: Number(arr[Math.floor(arr.length * 0.95)].toFixed(2)),
        p99Ms: Number(arr[Math.floor(arr.length * 0.99)].toFixed(2)),
      };
    };

    results.cacheComparison = {
      cacheMiss: calcArr(missTimes),
      cacheHit: calcArr(hitTimes),
      speedupFactor: Number((calcArr(missTimes).meanMs / calcArr(hitTimes).meanMs).toFixed(1)),
    };
    console.log('Redis Cache Hit Mean:', results.cacheComparison.cacheHit.meanMs, 'ms');
    console.log('Redis Cache Miss Mean:', results.cacheComparison.cacheMiss.meanMs, 'ms');
    console.log('Hızlanma Çarpanı:', results.cacheComparison.speedupFactor, 'kat');

    // 4. Temizlik
    console.log('\n[4/4] Benchmark tablosu temizleniyor...');
    await pgClient.query(`DROP TABLE IF EXISTS benchmark_events;`);
    await redis.del(cacheKey);

    console.log('\n=== Benchmark Tamamlandı ===');
    console.log(JSON.stringify(results, null, 2));

    const fs = require('fs');
    fs.writeFileSync('benchmark_results.json', JSON.stringify(results, null, 2), 'utf8');
    console.log('Sonuçlar benchmark_results.json dosyasına yazıldı.');
  } finally {
    await pgClient.end();
    await redis.quit();
  }
}

runBenchmark().catch(err => {
  console.error('Benchmark Hatası:', err);
  process.exit(1);
});
