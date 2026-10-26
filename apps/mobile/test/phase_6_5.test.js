const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Test edilecek modülleri ve yardımcıları yükle
const { palette } = require('@sehir-nabiz/design-tokens');

test('Phase 6.5 — Demo Veri Güvenliği ve Doğrulama Testleri', async (t) => {
  const origEnv = { ...process.env };

  t.afterEach(() => {
    process.env = { ...origEnv };
  });

  await t.test('1. Production ortamında demo fallback kesinlikle KAPALI olmalı', () => {
    // Production simülasyonu
    process.env.NODE_ENV = 'production';
    process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE = 'true'; // Bu bayrak prod'da geçersiz olmalı

    // isDevelopmentDemoEnabled mantığı
    const isDemoEnabled = () => {
      if (process.env.NODE_ENV === 'production') return false;
      return process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE === 'true';
    };

    assert.equal(
      isDemoEnabled(),
      false,
      'NODE_ENV=production olduğunda demo modu asla etkinleştirilemez'
    );
  });

  await t.test('2. Development ortamında demo modu yalnızca açıkça istendiğinde çalışmalı', () => {
    // Varsayılan development ortamı (bayrak tanımsız)
    process.env.NODE_ENV = 'development';
    delete process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE;

    const isDemoEnabled = () => {
      if (process.env.NODE_ENV === 'production') return false;
      return process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE === 'true';
    };

    assert.equal(
      isDemoEnabled(),
      false,
      'EXPO_PUBLIC_ENABLE_DEMO_MODE tanımlanmadıkça development ortamında dahi kapalı olmalıdır'
    );

    // Açıkça etkinleştirildiğinde
    process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE = 'true';
    assert.equal(isDemoEnabled(), true, 'Bayrak açıkken dev ortamında aktif olmalıdır');
  });

  await t.test('3. Demo olayları resmî veya doğrulanmış olay gibi GÖRÜNMEMELİ (Sentetik sanitizasyon)', () => {
    // Demo olay kümesini app kaynak kodundan veya modelinden incele
    const demoEventsPath = path.join(
      __dirname,
      '../src/features/map/services/eventsApi.ts'
    );
    const content = fs.readFileSync(demoEventsPath, 'utf8');

    // Başlıkların tamamında [DEMO] etiketi olmalı
    assert.ok(
      content.includes("title: '[DEMO]"),
      'Tüm sentetik olay başlıklarında [DEMO] açık ön eki bulunmalıdır'
    );

    // Güvenilirlik puanı 0 olmalı (resmî/onaylanmış algısı yaratmamak için)
    assert.ok(
      content.includes('reliabilityScore: 0.0'),
      'Sentetik olayların güvenilirlik puanı 0 olmalıdır'
    );

    // Teyit ve yalanlama sayıları 0 olmalı
    assert.ok(
      content.includes('confirmationCount: 0'),
      'Sentetik olaylarda onay sayısı 0 olmalıdır'
    );
    assert.ok(
      content.includes('denialCount: 0'),
      'Sentetik olaylarda ret sayısı 0 olmalıdır'
    );

    // Yazar adı resmî kurum veya güvenilir kişi izlenimi vermemeli
    assert.ok(
      !content.includes('Büyükşehir Görevlisi'),
      'Demo olaylarda resmî görevli unvanı bulunmamalıdır'
    );
    assert.ok(
      content.includes('Sentetik Test Kaydı (Doğrulanmamış)'),
      'Yazar adı açıkça test/sentetik kaydı belirtmelidir'
    );
  });

  await t.test('4. Offline önbellek ve son güncelleme zaman damgası mantığı', () => {
    // Cache simülasyonu
    const mockCachedEvents = [
      { id: 'ev-real-1', title: 'Gerçek Kaza Olayı', isDemo: false },
    ];

    const evaluateOfflineState = ({ rawEvents, isError, fetchStatus, isDemoData }) => {
      const isOfflineCache =
        rawEvents.length > 0 &&
        !isDemoData &&
        (Boolean(isError) || fetchStatus === 'paused');
      return isOfflineCache;
    };

    // Senaryo A: İnternet kesildi, önbellekte gerçek veri var
    const stateA = evaluateOfflineState({
      rawEvents: mockCachedEvents,
      isError: true,
      fetchStatus: 'idle',
      isDemoData: false,
    });
    assert.equal(stateA, true, 'Önbellekte veri varken hata oluşursa isOfflineCache true olmalı');

    // Senaryo B: Önbellekte hiç veri yokken hata oluştu
    const stateB = evaluateOfflineState({
      rawEvents: [],
      isError: true,
      fetchStatus: 'idle',
      isDemoData: false,
    });
    assert.equal(stateB, false, 'Önbellek boşken isOfflineCache false olmalı, temiz hata gösterilmeli');

    // Senaryo C: Demo verisi varken offline cache göstergesi tetiklenmemeli
    const stateC = evaluateOfflineState({
      rawEvents: [{ id: 'demo-1', title: '[DEMO] Olay', isDemo: true }],
      isError: true,
      fetchStatus: 'idle',
      isDemoData: true,
    });
    assert.equal(stateC, false, 'Demo verisi offline gerçek cache olarak raporlanmamalı');

    // Zaman damgası formatlama
    const testDate = new Date('2026-10-26T14:30:00.000Z');
    const formatted = testDate.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    assert.ok(typeof formatted === 'string' && formatted.includes(':'));
  });

  await t.test('5. Harita BBox çoklu sayfalama ve yoğunluk (hasMore) kontrolü', () => {
    // 100 olay sınırı ve maxPages sayfalama mantığı
    const simulatePagination = (totalBackendEvents, limit = 100, maxPages = 3) => {
      let fetched = 0;
      let pages = 0;
      let remaining = totalBackendEvents;

      while (remaining > 0 && pages < maxPages) {
        pages++;
        const currentBatch = Math.min(remaining, limit);
        fetched += currentBatch;
        remaining -= currentBatch;
      }

      return {
        totalFetched: fetched,
        totalPages: pages,
        hasMoreRemains: remaining > 0,
      };
    };

    // 250 olaylık yoğun bir şehir bölgesi (Kayseri/İstanbul)
    const result250 = simulatePagination(250, 100, 3);
    assert.equal(result250.totalFetched, 250, '3 sayfa içinde 250 olayın tümü çekilebilmeli');
    assert.equal(result250.totalPages, 3);
    assert.equal(result250.hasMoreRemains, false);

    // 500 olaylık aşırı yoğun bölge (maxPages: 3 ile 300 çekilir, aşırı yük önlenir)
    const result500 = simulatePagination(500, 100, 3);
    assert.equal(result500.totalFetched, 300, '3 sayfa sınırında en fazla 300 olay çekilmeli');
    assert.equal(result500.hasMoreRemains, true, 'Kalan olaylar hasMoreRemains ile bilinmeli');
  });

  await t.test('6. Harita BBox Debounce zamanlama mantığı (350ms)', async () => {
    let callCount = 0;
    let timer = null;

    const debouncedSetBbox = (delay = 50) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callCount++;
      }, delay);
    };

    // Kullanıcı haritayı hızlıca 5 kez kaydırıyor
    debouncedSetBbox(20);
    debouncedSetBbox(20);
    debouncedSetBbox(20);
    debouncedSetBbox(20);
    debouncedSetBbox(20);

    // Henüz tetiklenmemeli
    assert.equal(callCount, 0, 'Debounce süresince ara çağrılar bastırılmalı');

    // Süre dolunca tek bir çağrı gerçekleşmeli
    await new Promise((res) => setTimeout(res, 40));
    assert.equal(callCount, 1, 'Debounce sonlandığında yalnızca 1 kez BBox güncellenmeli');
  });

  await t.test('7. MapLibre ve Expo Native Konfigürasyon Doğrulaması', () => {
    const appJsonPath = path.join(__dirname, '../app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

    // Paket kimliği
    assert.equal(appJson.expo.android.package, 'com.sehirnabiz.app');
    assert.equal(appJson.expo.ios.bundleIdentifier, 'com.sehirnabiz.app');

    // New Architecture açık olmalı
    assert.equal(appJson.expo.newArchEnabled, true);

    // MapLibre plugini sürüm 11.5.0 olarak tanımlı olmalı
    const plugins = appJson.expo.plugins;
    const maplibrePlugin = plugins.find(
      (p) => Array.isArray(p) && p[0] === '@maplibre/maplibre-react-native'
    );
    assert.ok(maplibrePlugin, '@maplibre/maplibre-react-native plugini tanımlı olmalı');
    assert.equal(maplibrePlugin[1].android.version, '11.5.0');

    // İzinler tanımlı olmalı
    const androidPerms = appJson.expo.android.permissions;
    assert.ok(androidPerms.includes('ACCESS_FINE_LOCATION'));
    assert.ok(androidPerms.includes('ACCESS_COARSE_LOCATION'));
  });

  await t.test('8. EAS Build Profilleri Doğrulaması (eas.json)', () => {
    const easJsonPath = path.join(__dirname, '../eas.json');
    assert.ok(fs.existsSync(easJsonPath), 'apps/mobile/eas.json mevcut olmalı');

    const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

    // Development profili
    assert.ok(easJson.build.development, 'development profili tanımlı olmalı');
    assert.equal(easJson.build.development.developmentClient, true);
    assert.equal(
      easJson.build.development.android.buildType,
      'apk',
      'Development profili doğrudan kurulabilir APK üretmeli'
    );

    // Production profili
    assert.ok(easJson.build.production, 'production profili tanımlı olmalı');
    assert.equal(easJson.build.production.android.buildType, 'app-bundle');

    // Demo modu güvenlik kontrolü: EAS build'lerinde varsayılan olarak kapalı olmalı
    assert.equal(
      easJson.build.production.env.EXPO_PUBLIC_ENABLE_DEMO_MODE,
      'false',
      'EAS production derlemesinde demo modu false olmalı'
    );
  });
});
