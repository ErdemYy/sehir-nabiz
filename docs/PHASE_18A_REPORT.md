# ŞehirNabız — Phase 18A Kapanış Raporu (PHASE_18A_REPORT.md)

**Faz:** Phase 18A — Android Native Build Readiness & Mobile Visual QA  
**Tarih:** 29 Ekim 2026  
**Önceki Commit:** `9ec55c1` (Phase 17)  
**Başlangıç Test Sayısı:** 409  
**Final Test Sayısı:** **415 test** (%100 Başarılı, 0 Hata)  
**Tasarım Dili:** Urban Floating UI (Minimal, Harita Odaklı, WCAG AA)  
**Durum:** 🟢 **BAŞARIYLA TAMAMLANDI (Fiziksel Cihaz ve APK Derlemesi Phase 18B'ye Hazırlandı)**

---

## 1. Expo / Native Uyumluluk

- **Expo SDK & React Native:** Expo SDK `~58.0.19`, React Native `0.88.0` ve React `19.3.0` sürümleri monorepo genelinde tam uyumlulukla doğrulanmıştır.
- **`expo-doctor` Sonucu:** 20 denetimin **18'i başarılı** geçmiştir.
  - Non-CNG uyarısı, projenin MapLibre Native bağımsız C++ kütüphaneleri nedeniyle `apps/mobile/android` prebuild klasörünü kullanmasından kaynaklanmaktadır ve beklenen normal davranıştır.
  - Paket yama farkları (`58.0.21` vs `58.0.19`) belgelenmiş olup, 415 testin tamamı mevcut sürümlerle kararlı şekilde çalıştığı için yapay yükseltmelerden kaçınılmıştır.
- **Hermes JS Motoru:** `apps/mobile/android/gradle.properties` içinde `hermesEnabled=true` tanımlıdır.
- **Android New Architecture:** `android/gradle.properties` içinde `newArchEnabled=true` ve `app.json` içinde `newArchEnabled: true` olarak yapılandırılmıştır. TurboModules ve Fabric render mimarisi devrededir.
- **Metro Monorepo Entegrasyonu:** [`apps/mobile/metro.config.js`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/mobile/metro.config.js) oluşturularak monorepo kök dizini izleme (`watchFolders`) ve `nodeModulesPaths` pnpm çözümleme sıralaması garanti altına alınmıştır.

---

## 2. MapLibre Native Kontrolü

- **Plugin Yapılandırması:** `apps/mobile/app.json` dosyasında `["@maplibre/maplibre-react-native", { "android": { "version": "11.5.0" } }]` tanımlıdır.
- **Native Gradle Sürümü:** `apps/mobile/android/gradle.properties` dosyasında `org.maplibre.reactnative.version=11.5.0` olarak belirtilmiştir.
- **Donanım İvmesi:** OpenGL/Vulkan tabanlı vektör harita motoru bağımsız MapLibre döşeme sunucusu (`https://demotiles.maplibre.org/style.json`) ile entegredir.

---

## 3. EAS Readiness & Açık Engel (Blocker)

- **`eas.json` Profilleri:**
  - `development`: `buildType: "apk"`, `developmentClient: true`, `gradleCommand: ":app:assembleDebug"`.
  - `preview`: `buildType: "apk"`, `distribution: "internal"`.
  - `production`: `buildType: "app-bundle"`, `autoIncrement: true`.
- **🔴 Açık Engel (Blocker):** `apps/mobile/app.json` dosyasında `extra.eas.projectId` tanımlı değildir ve ortamda aktif EAS oturumu bulunmamaktadır. EAS Build başlatmadan önce Phase 18B'de `npx eas login` ve `npx eas init` yapılması zorunludur.

---

## 4. Mobil Ağ Bağlantısı Hazırlığı (LAN / Wi-Fi)

[`docs/DEVICE_NETWORK_SETUP.md`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/DEVICE_NETWORK_SETUP.md) kılavuzu oluşturulmuştur:
- Fiziksel telefonun `localhost` veya `10.0.2.2`'ye erişemeyeceği tespit edilmiştir.
- Bilgisayarın yerel ağ IP'si (`192.168.x.x`) kullanılarak `EXPO_PUBLIC_API_URL=http://<LAN_IP>:3000/api/v1` ayarı tanımlanmıştır.
- Windows Güvenlik Duvarı için `3000` (API), `8081` (Metro) ve `9000` (MinIO) port kuralları belgelenmiştir.
- WebSocket `/realtime` soket adresinin API base URL'sinden otomatik türetildiği doğrulanmıştır.

---

## 5. Presigned MinIO URL Güvenliği ve Kriptografik İmza Koruması

- **AWS SigV4 HMAC Bütünlüğü:** S3 / MinIO presigned URL'leri üretilirken `Host` başlığı (`X-Amz-SignedHeaders=host`) imzanın ayrılmaz bir parçasıdır.
- **İstemci Manipülasyon Yasağı:** Mobil istemcinin telefon üzerinde presigned URL'deki host adresini değiştirmesi durumunda MinIO'nun `403 SignatureDoesNotMatch` hatası vereceği mimari olarak kanıtlanmıştır.
- **Çözüm:** Backend `.env` dosyasındaki `STORAGE_ENDPOINT` ve `STORAGE_PUBLIC_URL` değişkenleri doğrudan bilgisayarın LAN IP'si (`http://192.168.x.x:9000`) ile yapılandırılacaktır; böylece backend URL'yi baştan doğru host ile imzalar ve mobil istemci sıfır manipülasyon ile yüklemeyi tamamlar.

---

## 6. Mobil UI ve Görsel Kalite Denetimi

10 ana ekran kod düzeyinde denetlenmiş ve [`docs/MOBILE_VISUAL_QA_PLAN.md`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/MOBILE_VISUAL_QA_PLAN.md) hazırlanmıştır:

1. **Harita (`/(tabs)/index`):** Arama çubuğu, kategori çipleri, sağ yüzer butonlar ve alt BottomSheet katmanları hiyerarşik `zIndex` ile düzenlendi.
2. **Akış (`/(tabs)/feed`):** 100px alt kenar payı (`paddingBottom: 100`) ile FloatingTabBar çakışması önlendi.
3. **Bildir (`/(tabs)/create`):** 3 adımlı sihirbaz, `KeyboardAvoidingView` ve 110px alt kenar payı doğrulandı.
4. **Bildirimler (`/(tabs)/notifications`):** 120px alt kenar payı, Bugün/Dün/Daha Önce gruplaması ve Empty/Error state'leri doğrulandı.
5. **Profil (`/(tabs)/profile`):** 100px alt kenar payı, itibar seviyesi göstergesi ve misafir kullanıcı akışı doğrulandı.
6. **Olay Detayı (`/events/[id]`):** Dinamik safe area alt kenar payı (`Math.max(insets.bottom + 32, 60)`) uygulandı; 3'lü teyit butonları korundu.
7. **Fotoğraf Yükleme (`PhotoPickerSection`):** Maks 3 adet, 8MB dosya sınırı, HEIC format uyarısı ve tekrar deneme butonları doğrulandı.
8. **İstatistikler (`/stats`):** `useSafeAreaInsets` ile dinamik alt boşluk ve `minHeight: 44` dokunma hedefleri uygulandı.
9. **Ayarlar (`/profile/settings`):** `useSafeAreaInsets` ile dinamik alt boşluk ve parola korumalı hesap silme modalı korundu.
10. **Moderasyon (`/moderation`):** `insets.bottom + 60` alt kenar payı ve `UserRole` rol denetimi doğrulandı.

> *Not: Gerçek fiziksel telefon ekran görüntüleri olmadan görsel kalite "fiziksel olarak %100 onaylandı" kabul edilmemiştir.*

---

## 7. Test Sonuçları ve Kalite Doğrulaması

Önceki 409 testin tamamı korunmuş, Phase 18A'da **6 yeni test** eklenmiştir:

| Test Paketi | Test Sayısı | Başarılı | Başarısız | Kapsam |
| :--- | :---: | :---: | :---: | :--- |
| **API Birim ve Entegrasyon Testleri** | 274 | 274 | 0 | Phase 17 dağıtık outbox, çift instance, fail-closed env |
| **Mobil Bileşen ve Hook Testleri** | 122 | 122 | 0 | +6 Yeni Test (`phase_18a_build_readiness.test.js`) |
| **Tasarım Tokenları Testleri** | 11 | 11 | 0 | Urban Floating UI renk, tipografi, 4px grid |
| **Shared Paketi Testleri** | 8 | 8 | 0 | Ortak enum'lar, DTO'lar, outbox channel tipleri |
| **TOPLAM** | **415** | **415** | **0** | **%100 PASS, SIFIR HATA** |

### Pipeline Durumu:
- `pnpm turbo run typecheck`: **6/6 başarılı** (Strict mode uyumlu).
- `pnpm turbo run lint`: **6/6 başarılı**.
- `pnpm turbo run build`: **3/3 başarılı** (Full Turbo).

---

## 8. Graphify Metrikleri

- **Graf Durumu:** `graphify-out/graph.json` güncel.
- **Düğüm (Nodes):** 3118 düğüm
- **Kenar (Edges):** 6814 kenar
- **Topluluklar (Communities):** 178 topluluk

---

## 9. Commit Bilgisi

- **Önceki Commit:** `9ec55c1`
- **Hedeflenen Commit:** `feat(phase-18a): android native build readiness, metro monorepo & mobile visual qa`

---

## 10. Açık Native Riskler

1. **EAS Oturumu:** Proje henüz bir Expo / EAS organizasyonuna bağlanmamıştır.
2. **Fiziksel Cihaz Eksikliği:** MapLibre GPU render hızı ve bellek tüketimi fiziksel donanımda ölçülmemiştir.
3. **Canlı Push Sertifikaları:** FCM Service Account ve APNs AuthKey eklenmemiştir.

---

## 11. Phase 18B İçin Gereken Adımlar

1. Geliştirici EAS hesabıyla oturum açılması (`npx eas login`).
2. EAS Proje Kimliğinin atanması (`npx eas init`).
3. Geliştirici bilgisayarı LAN IP'sinin `.env` dosyalarına tanımlanması.
4. İlk dahili test APK'sının derlenmesi (`eas build --platform android --profile preview` veya yerel Gradle derlemesi).
5. APK'nın fiziksel Android telefona yüklenmesi, ekran görüntülerinin alınması ve görsel QA denetiminin tamamlanması.
