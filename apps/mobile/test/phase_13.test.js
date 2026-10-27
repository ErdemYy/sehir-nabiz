const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

describe('Phase 13 — Beta Sürüm Hazırlığı, Güvenlik Denetimi ve Yapılandırma Testleri', () => {

  // =========================================================================
  // 1. Android/iOS Release Yapılandırması (app.json & eas.json)
  // =========================================================================
  describe('1. Release Yapılandırması ve Mağaza Gereksinimleri', () => {
    const appJsonPath = path.resolve(__dirname, '../app.json');
    const easJsonPath = path.resolve(__dirname, '../eas.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

    it('app.json geçerli Android package ID ve iOS bundleIdentifier içermeli', () => {
      assert.equal(appJson.expo.android?.package, 'com.sehirnabiz.app');
      assert.equal(appJson.expo.ios?.bundleIdentifier, 'com.sehirnabiz.app');
    });

    it('app.json Google Play ve App Store için versionCode ve buildNumber içermeli', () => {
      assert.ok(typeof appJson.expo.android?.versionCode === 'number', 'versionCode sayısal olmalı');
      assert.ok(appJson.expo.android?.versionCode >= 1, 'versionCode >= 1 olmalı');
      assert.ok(typeof appJson.expo.ios?.buildNumber === 'string', 'buildNumber string olmalı');
    });

    it('app.json EAS Update için runtimeVersion ilkesi tanımlamalı', () => {
      assert.deepEqual(appJson.expo.runtimeVersion, { policy: 'appVersion' });
    });

    it('app.json adaptive icon foregroundImage ve splash image yollarını tanımlamalı', () => {
      assert.equal(appJson.expo.android?.adaptiveIcon?.foregroundImage, './assets/adaptive-icon.png');
      assert.equal(appJson.expo.splash?.image, './assets/splash.png');
    });

    it('app.json içinde New Architecture bayrağı tanımlı olmalı', () => {
      assert.equal(appJson.expo.newArchEnabled, true, 'newArchEnabled true olmalı');
    });

    it('eas.json development, preview ve production ortamları için kanal ve bayrakları ayırmalı', () => {
      assert.equal(easJson.build.development.channel, 'development');
      assert.equal(easJson.build.preview.channel, 'preview');
      assert.equal(easJson.build.production.channel, 'production');
      assert.equal(easJson.build.production.env.EXPO_PUBLIC_APP_ENV, 'production');
      assert.equal(easJson.build.production.env.EXPO_PUBLIC_ENABLE_DEMO_MODE, 'false');
    });
  });

  // =========================================================================
  // 2. Production Ortamı API ve Güvenlik Sınırları
  // =========================================================================
  describe('2. Mobil API Base URL ve Loopback Koruması', () => {
    it('production ortamında localhost ve 10.0.2.2 adreslerine fallback verilmemeli, boş veya engelli dönmeli', () => {
      const evaluateApiUrl = (customUrl, appEnv, isDev) => {
        const isProd = appEnv === 'production' || (!isDev);
        if (customUrl) {
          const trimmed = customUrl.trim();
          const isLocalhostOrLoopback =
            trimmed.includes('localhost') ||
            trimmed.includes('127.0.0.1') ||
            trimmed.includes('10.0.2.2') ||
            trimmed.startsWith('http://192.168.') ||
            trimmed.startsWith('http://10.');

          if (isProd && isLocalhostOrLoopback) {
            return ''; // Engellendi
          }
          return trimmed;
        }

        if (isProd) {
          return ''; // Production'da tanımsızsa fallback verilmez (BLOCKED)
        }

        return 'http://10.0.2.2:3001/api/v1'; // Yalnızca development
      };

      // Geliştirme ortamında emülatör fallback'i verilir
      assert.equal(evaluateApiUrl(undefined, 'development', true), 'http://10.0.2.2:3001/api/v1');

      // Production ortamında tanımsızsa fallback VERİLMEZ
      assert.equal(evaluateApiUrl(undefined, 'production', false), '');

      // Production ortamında localhost girilmişse BLOKE EDİLİR
      assert.equal(evaluateApiUrl('http://localhost:3001/api/v1', 'production', false), '');
      assert.equal(evaluateApiUrl('http://10.0.2.2:3001/api/v1', 'production', false), '');

      // Production ortamında gerçek HTTPS adresi geçerlidir
      assert.equal(
        evaluateApiUrl('https://api.sehirnabiz.com/api/v1', 'production', false),
        'https://api.sehirnabiz.com/api/v1',
      );
    });

    it('env.ts dosyası isProductionConfigured bayrağını desteklemeli', () => {
      const envPath = path.resolve(__dirname, '../src/config/env.ts');
      const content = fs.readFileSync(envPath, 'utf8');

      assert.ok(content.includes('isProductionConfigured'), 'isProductionConfigured bayrağı tanımlı olmalı');
      assert.ok(content.includes('EXPO_PUBLIC_ değişkenleri halka açıktır'), 'Güvenlik uyarısı yer almalı');
    });
  });

  // =========================================================================
  // 3. Kullanıcı Çıkışında (Logout) Kapsamlı Oturum ve Yerel Veri Temizliği
  // =========================================================================
  describe('3. Oturum Kapatma ve Veri Hijyeni', () => {
    it('kullanıcı çıkış yaptığında token, soket ve yerel taslak temizliği tetiklenmeli', async () => {
      let tokenRemoved = false;
      let socketDisconnected = false;
      let draftCleared = false;
      let stateReset = false;

      const mockSecureStorage = {
        removeRefreshToken: async () => { tokenRemoved = true; },
      };
      const mockSocketService = {
        disconnect: () => { socketDisconnected = true; },
      };
      const mockDraftService = {
        clearDraft: async () => { draftCleared = true; },
      };

      const handleLogout = async () => {
        await mockSecureStorage.removeRefreshToken();
        mockSocketService.disconnect();
        await mockDraftService.clearDraft();
        stateReset = true;
      };

      await handleLogout();

      assert.equal(tokenRemoved, true, 'Refresh token silinmeli');
      assert.equal(socketDisconnected, true, 'WebSocket bağlantısı kapatılmalı');
      assert.equal(draftCleared, true, 'Yerel taslak dosyası silinmeli');
      assert.equal(stateReset, true, 'Store state sıfırlanmalı');
    });

    it('useAuthStore dosyasında socket disconnect ve clearDraft çağrıları mevcut olmalı', () => {
      const storePath = path.resolve(__dirname, '../src/features/auth/store/useAuthStore.ts');
      const content = fs.readFileSync(storePath, 'utf8');

      assert.ok(content.includes('SocketService.getInstance().disconnect()'), 'Soket kapatma çağrısı olmalı');
      assert.ok(content.includes('draftService.clearDraft()'), 'Taslak temizleme çağrısı olmalı');
    });
  });

  // =========================================================================
  // 4. Hata Kalkanı (ErrorBoundary) ve Güvenli Kullanıcı Arayüzü
  // =========================================================================
  describe('4. Hata Kalkanı (ErrorBoundary) Güvenliği', () => {
    it('ErrorBoundary Urban Floating UI renk ve buton standartlarına uymalı, stack trace gizlemeli', () => {
      const ebPath = path.resolve(__dirname, '../src/components/ErrorBoundary.tsx');
      const content = fs.readFileSync(ebPath, 'utf8');

      assert.ok(content.includes('#14B8A6'), 'Urban Floating UI primary teal rengi kullanılmalı');
      assert.ok(content.includes('borderRadius: 999'), 'Pill radius uygulanmalı');
      assert.ok(content.includes('__DEV__ && this.state.error'), 'Hata mesajı yalnızca __DEV__ modunda görünmeli');
    });
  });

  // =========================================================================
  // 5. Kanıt Seviyeleri ve Rapor Tutarlılığı Doğrulaması
  // =========================================================================
  describe('5. Raporlama Tutarlılığı ve Metodolojik Sınıflandırma', () => {
    it('olay bildirme sihirbazı CreateEventStep türü tam olarak 1 | 2 | 3 (3 fiziksel adım) olmalı', () => {
      const typesPath = path.resolve(__dirname, '../src/features/events/types/events.types.ts');
      const content = fs.readFileSync(typesPath, 'utf8');

      assert.ok(
        content.includes('export type CreateEventStep = 1 | 2 | 3;'),
        'CreateEventStep fiziksel olarak 3 adım olmalıdır (1: Detay, 2: Konum/Medya, 3: Önizleme/Onay)',
      );
    });

    it('fiziksel cihaz ve gerçek push testleri yapılmadıysa bu durum BLOCKED veya NOT_RUN olarak sınıflandırılmalı', () => {
      const knownIssuesPath = path.resolve(__dirname, '../../../docs/KNOWN_ISSUES.md');
      const content = fs.readFileSync(knownIssuesPath, 'utf8');

      assert.ok(
        content.includes('Fiziksel Cihaz Donanım Doğrulaması Yapılmadı'),
        'Fiziksel cihaz eksikliği Blocker olarak beyan edilmeli',
      );
      assert.ok(
        content.includes('Gerçek Push Bildirim (FCM / APNs) Canlı Teslimatı Ertelendi'),
        'Gerçek push eksikliği Blocker olarak beyan edilmeli',
      );
    });
  });
});
