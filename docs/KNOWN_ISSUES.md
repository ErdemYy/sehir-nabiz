# ŞehirNabız — Bilinen Sorunlar ve Teknik Borç Envanteri (Known Issues)

**Tarih:** 29 Ekim 2026  
**Faz:** Phase 18A — Android Native Build Readiness & Mobile Visual QA  
**Son Durum:** Android Native Derleme Hazırlığı, Metro Monorepo ve Mobil Görsel Kalite Denetimi Tamamlandı  

---

## 1. Öncelik ve Şiddet Sınıflandırması

Bu belge, ŞehirNabız projesinde mevcut bilinen sınırları, ertelenen maddeleri ve canlı mağaza (App Store / Play Store) öncesi çözülmesi gereken teknik borçları dürüst ve şeffaf bir şekilde listeler.

---

## 2. Sorun ve Eksiklik Envanteri

### 🔴 Kalan Blockerlar (Canlı Mağaza ve Açık Beta Öncesi Zorunlu)

#### 1. Fiziksel Cihaz Donanım Doğrulaması Yapılmadı
- **Açıklama:** Uygulama Expo Dev Client, Metro bundler ve simülatör/web ortamlarında test edilmiştir. Farklı ekran boyutlarına, GPU yongalarına (Adreno, Mali) ve RAM kısıtlarına sahip gerçek fiziksel Android ve iOS cihazlarında kapsamlı alan testleri henüz gerçekleştirilmemiştir.
- **Risk:** Eski donanımlı Android cihazlarda MapLibre GPU yükü altında FPS düşüşü veya batarya tüketimi yaşanabilir.
- **Çözüm Planı:** Faz 18B'de üretilecek ilk test APK'sı ile fiziksel Android telefon üzerinde termal ve bellek profillemesi (Android Studio Profiler) yapılmalıdır.
- **Geçici Çözüm:** Beta testleri kontrollü simülatör veya yüksek güçlü test cihazlarıyla sınırlandırılmalıdır.

#### 2. Bağımsız Android APK / AAB ve iOS IPA Üretimi Ertelendi
- **Açıklama:** Kapsam sınırları uyarınca henüz bağımsız APK/AAB/IPA oluşturulmamış, mağazalara gönderilmemiştir.
- **Risk:** Üretim (production) derleme bayraklarında ProGuard veya Hermes bytecode optimizasyonlarından kaynaklanan beklenmedik kütüphane çakışmaları oluşabilir.
- **Çözüm Planı:** Faz 18B'de `eas build --platform android --profile preview` veya yerel Gradle pipeline (`cd apps/mobile/android && ./gradlew assembleRelease`) çalıştırılarak imzalı ilk paket üretilmelidir.

#### 3. EAS Proje Kimliği (`extra.eas.projectId`) ve Oturumu Eksik
- **Açıklama:** `apps/mobile/app.json` dosyasında `extra.eas.projectId` tanımlı değildir ve ortamda aktif bir EAS CLI oturumu bulunmamaktadır.
- **Risk:** `eas build` komutu proje kimliği ve kullanıcı kimlik doğrulaması olmadan çalıştırılamaz.
- **Çözüm Planı:** Faz 18B'de `npx eas login` ile giriş yapılmalı ve `npx eas init` ile proje kimliği oluşturulup `app.json`'a yazılmalıdır.

#### 4. Gerçek Push Bildirim (FCM / APNs) Canlı Teslimatı Ertelendi
- **Açıklama:** Push bildirim veritabanı şeması, token kaydı, outbox entegrasyonu ve geliştirici simülasyon adaptörü hazırdır; ancak Apple Developer Program ve Google Firebase Cloud Messaging canlı üretim sertifikaları / anahtarları henüz yüklenmemiştir.
- **Risk:** Uygulama kapalıyken (arka planda) kullanıcının kilit ekranına bildirim düşmesi fiziksel olarak doğrulanamamıştır.
- **Çözüm Planı:** Canlı sunucu ortam değişkenlerine `FIREBASE_SERVICE_ACCOUNT` ve `APNS_KEY_ID` tanımlanarak uçtan uca bildirim iletimi test edilmelidir.

#### 5. Canlı API ve Web Alan Adı DNS/SSL Kurulumu
- **Açıklama:** Üretim HTTPS API (`api.sehirnabiz.com`) DNS/SSL provizyonu yapılmamıştır. Staging reverse proxy yapılandırması (`docker/staging/nginx.conf`) ve `.env.staging` yerel kendinden imzalı sertifikayla doğrulanmış ancak harici canlı sunucuya kurulmamıştır.

---

### 🟢 Çözülen Blockerlar ve İyileştirmeler (Phase 14 - 18A)

#### [ÇÖZÜLDÜ - Phase 18A] Android Native Derleme Hazırlığı & Metro Monorepo Yapılandırması
- MapLibre Native 11.5.0 plugin ve Gradle ayarları doğrulandı.
- `apps/mobile/metro.config.js` oluşturularak monorepo kök dizini izleme (`watchFolders`) ve `nodeModulesPaths` pnpm çözümleme sıralaması güvenceye alındı.
- `expo-doctor` ile 18/20 kontrol doğrulandı; Prebuild ve patch sürümleri belgelendi.

#### [ÇÖZÜLDÜ - Phase 18A] Presigned S3/MinIO İmza Güvenliği & LAN Rehberi
- S3 AWS V4 HMAC imzasının `Host` başlığına bağlı olduğu, istemci tarafında URL mutasyonunun imza hatası (`403 SignatureDoesNotMatch`) doğuracağı tespit edilerek backend `STORAGE_ENDPOINT` LAN IP hizalama politikası belgelendi.
- WebSocket `/realtime` soket adresinin API base URL'sinden otomatik türetildiği kanıtlandı.

#### [ÇÖZÜLDÜ - Phase 18A] Mobil Bağımsız Ekranlarda Safe Area Standardizasyonu
- Olay Detayı (`/events/[id]`), İstatistikler (`/stats`), Ayarlar (`/profile/settings`) ve Olaylarım (`/profile/my-events`) ekranlarında gesture navigation bar'ı için `Math.max(insets.bottom + 32, 60)` alt kenar payı standardı uygulandı.

#### [ÇÖZÜLDÜ - Phase 17] Redis Kesintisinde Outbox Teslimat Semantiği & Güvence Mimarisi
- 5 bağımsız teslimat kanalı ayrıştırıldı; `inAppNotification` zorunlu kılındı. Redis kesintisinde yerel yayın korunarak `DEGRADED` durumu uygulandı. `idempotencyKey` ile worker crash sonrası mükerrer bildirim riski sıfırlandı.

#### [ÇÖZÜLDÜ - Phase 17] Çoklu API Instance (Dual-Instance) Socket.IO & Redis Adapter Doğrulaması
- Çift API instance'ı ile gerçek Redis adapter üzerinden çapraz yayın (4 ms teslimat gecikmesi) ve failover reconnect doğrulandı.

#### [ÇÖZÜLDÜ - Phase 17] Reverse Proxy 127.0.0.1 Bind ve Readiness Bilgi Sızıntısı Engeli
- Nginx portları strictly `127.0.0.1:80/443`'e bağlandı; kamusal `/health/ready` iç altyapı ifşası kapatıldı; timing-safe secret rotasyonu sağlandı.

#### [ÇÖZÜLDÜ - Phase 16] Yerel Staging Mimarisinin Fiilen Çalıştırılması (Dry-Run) & Yük Testi
- İzole Docker staging ortamı ayağa kaldırıldı, 500 eşzamanlı WebSocket bağlantısı test edildi (%100 başarı).

---

### 🟠 High (Yüksek Öncelikli İyileştirmeler)

#### 6. Web Tarayıcılarında MapLibre WebGL Uyumluluğu
- **Açıklama:** Proje birincil olarak mobil odaklıdır (React Native + Expo). Masaüstü tarayıcılarda (`pnpm run web`) MapLibre native modülü yerine canvas veya fallback katmanı gerekmektedir.
