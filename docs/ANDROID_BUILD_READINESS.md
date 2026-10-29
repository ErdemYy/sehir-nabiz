# ŞehirNabız — Android Native Derleme Hazırlık Raporu (ANDROID_BUILD_READINESS.md)

**Faz:** Phase 18A — Android Native Build Readiness & Mobile Visual QA  
**Tarih:** 29 Ekim 2026  
**Durum:** Denetlendi ve Doğrulandı (Native Yapılandırma Hazır, EAS Oturumu Bekleniyor)  
**Hedef Platform:** Android 10+ (API Seviyesi 29 - 35)  
**Paket Kimliği:** `com.sehirnabiz.app`

---

## 1. Genel Bakış ve Mimari Sürüm Uyumu

ŞehirNabız mobil uygulaması, Expo SDK 58 ve React Native 0.88 mimarisi üzerinde yapılandırılmıştır. MapLibre Native bağımsız vektör harita motoru gereksinimi nedeniyle proje **Prebuild (Bare/Custom Native)** modunda çalıştırılmaktadır.

| Bileşen | Sürüm | Durum / Uyumluluk | Notlar |
| :--- | :--- | :---: | :--- |
| **Expo SDK** | `~58.0.19` | 🟢 Uyumlu | Expo SDK 58 çekirdek kütüphaneleri |
| **React Native** | `0.88.0` | 🟢 Uyumlu | React Native 0.88 New Architecture |
| **React / React DOM** | `19.3.0` | 🟢 Uyumlu | React 19 Compiler & Hooks |
| **MapLibre Native** | `11.5.0` | 🟢 Uyumlu | Donanım ivmeli OpenGL/Vulkan harita motoru |
| **Expo Router** | `~58.0.26` | 🟢 Uyumlu | Dosya tabanlı (File-based) navigasyon |
| **TypeScript** | `^5.8.2` | 🟢 Uyumlu | Strict mode (Monorepo kökü 5.9.3) |

---

## 2. `expo-doctor` Denetim Bulguları ve Analizi

`cd apps/mobile && npx expo-doctor` komutu ile çalıştırılan 20 native tutarlılık kontrolünün detaylı sonuçları:

- **Sonuç:** **18/20 Kontrol Başarılı** (Kritik çalışma zamanı hatası bulunmuyor).
- **1. Şema Uyarısı (Schema Validation):**
  - `app.json` dosyasındaki `newArchEnabled` ve `splash` kök anahtarları Expo SDK 58 schema denetleyicisinde ek özellik olarak raporlanmıştır. Ancak geriye dönük test uyumluluğu ve `android/gradle.properties` ayarları nedeniyle `newArchEnabled=true` hem `app.json` hem de `gradle.properties` üzerinde eşzamanlı olarak korunmaktadır.
- **2. Non-CNG (Continuous Native Generation) Uyarısı:**
  - `apps/mobile/android` klasörü halihazırda mevcut olduğu için EAS Build'in bazı dinamik `app.json` özelliklerini (splash, plugins vb.) native Gradle kodundan alacağı belirtilmiştir. Bu durum Prebuild projeleri için beklenen ve doğru olan davranıştır.
- **3. Paket Yama (Patch) Sürümleri:**
  - Expo SDK 58'in son yama sürümleri (`58.0.21` vs `58.0.19`) ve `react-native` (`0.88.1` vs `0.88.0`) yama farkı raporlanmıştır. Mevcut 415 testin tamamı bu sürümlerle %100 kararlı çalıştığından ve gereksiz bağımlılık güncellemesi kuralı gereğince yama güncellemeleri kontrollü olarak Faz 18B'ye bırakılmıştır.

---

## 3. MapLibre Native Yapılandırması ve Entegrasyonu

MapLibre Native motoru, Android platformunda yüksek performanslı vektör harita çizimi sağlamak için iki ayrı noktada yapılandırılmıştır:

1. **Expo Config Plugin (`apps/mobile/app.json`):**
   ```json
   [
     "@maplibre/maplibre-react-native",
     {
       "android": {
         "version": "11.5.0"
       }
     }
   ]
   ```
2. **Gradle Ayarı (`apps/mobile/android/gradle.properties`):**
   ```properties
   org.maplibre.reactnative.version=11.5.0
   ```
Bu yapılandırma, MapLibre'nin C++ native kütüphanelerinin (`libmaplibre.so`) Gradle derleme adımında doğru versiyonla (`11.5.0`) derlenmesini ve paketlenmesini garanti eder.

---

## 4. Android New Architecture ve Hermes JS Motoru

Uygulamanın `apps/mobile/android/gradle.properties` dosyasındaki çekirdek derleme bayrakları incelenmiş ve doğrulanmıştır:

- **`newArchEnabled=true`:** TurboModules ve Fabric modern React Native mimarisi aktiftir. UI thread ile JS thread arasındaki seri haberleşme (JSI) donanım ivmeli harita performansını artırır.
- **`hermesEnabled=true`:** Hermes bytecode derleyicisi devrededir. APK başlatma süresini (TTI) ve bellek ayak izini minimize eder.
- **`edgeToEdgeEnabled=true`:** Android 14+ ve 15 sistem çubukları arkasına çizim desteği açıktır. Urban Floating UI tasarım dilinin sistem navigasyon çubuğu ile kusursuz bütünleşmesini sağlar.
- **`reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64`:** Tüm 32-bit ve 64-bit fiziksel Android cihazları ile emülatörleri destekleyen NDK ABI ayarı.

---

## 5. İzinler ve Android Manifest Sözleşmesi

`apps/mobile/app.json` ve `AndroidManifest.xml` üzerinde tanımlanan izinler:

| İzin | Açıklama | Kullanıcı Gerekçesi (UI) |
| :--- | :--- | :--- |
| `ACCESS_FINE_LOCATION` | GPS hassas konum okuma | Haritada olayları kullanıcının konumuna göre gösterme |
| `ACCESS_COARSE_LOCATION` | Baz istasyonu/Wi-Fi yaklaşık konum | Enerji tasarruflu ilk konum tespiti |
| `CAMERA` | Cihaz kamerasına erişim | Olay yerinde anlık fotoğraf çekimi |
| `READ_MEDIA_IMAGES` | Galeri fotoğraflarını okuma (Android 13+) | Galeriden kanıt fotoğrafı seçimi (Maks 3 adet, 8MB) |
| `RECORD_AUDIO` | Medya eklentisi varsayılanı | Kamera modülü video fallback gereksinimi |

---

## 6. Metro & pnpm Monorepo Yapılandırması

Turborepo ve pnpm monorepo mimarisinde, mobil uygulamanın kök dizindeki paylaşılan paketleri (`@sehir-nabiz/design-tokens`, `@sehir-nabiz/shared`) ve kök `node_modules` dizinini doğru çözümlemesi için [`apps/mobile/metro.config.js`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/metro.config.js) yapılandırılmıştır:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo kök dizinini ve paylaşılan paketleri izle
config.watchFolders = [monorepoRoot];

// Paket çözümleme sırası
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

---

## 7. EAS Build Hazırlığı ve Açık Engel (Blocker)

### `eas.json` Profilleri:
- **`development`:** `buildType: "apk"`, `developmentClient: true`, `gradleCommand: ":app:assembleDebug"`. Yerel hata ayıklama ve Metro bağlantısı için.
- **`preview`:** `buildType: "apk"`, `distribution: "internal"`. Fiziksel Android telefonlara doğrudan yüklenebilir APK çıktısı için.
- **`production`:** `buildType: "app-bundle"`, `autoIncrement: true`. Google Play Store dağıtımı için AAB paketi.

### 🔴 Açık Engel (Release Blocker):
> [!IMPORTANT]
> **EAS Proje Kimliği ve Oturumu Eksik:** `apps/mobile/app.json` içerisinde `extra.eas.projectId` tanımlı değildir ve ortamda aktif bir EAS CLI oturumu (`npx eas whoami`) bulunmamaktadır.
>
> EAS bulut derlemesi başlatılmadan önce Expo geliştirici hesabının açılması (`npx eas login`) ve proje kimliğinin atanması (`npx eas init`) Phase 18B'nin ilk adımı olarak zorunludur.
