# ŞehirNabız — Bilinen Sorunlar ve Teknik Borç Envanteri (Known Issues)

**Tarih:** 29 Ekim 2026  
**Faz:** Phase 17 — Distributed Reliability, Outbox Delivery Assurance & Deployment Hardening  
**Son Durum:** Dağıtık Outbox Güvencesi, Çoklu Instance Gerçek Zamanlı Dağıtım ve Dağıtım Sertleştirmesi Tamamlandı  

---

## 1. Öncelik ve Şiddet Sınıflandırması

Bu belge, ŞehirNabız projesinde mevcut bilinen sınırları, ertelenen maddeleri ve canlı mağaza (App Store / Play Store) öncesi çözülmesi gereken teknik borçları dürüst ve şeffaf bir şekilde listeler.

---

## 2. Sorun ve Eksiklik Envanteri

### 🔴 Kalan Blockerlar (Canlı Mağaza ve Açık Beta Öncesi Zorunlu)

#### 1. Fiziksel Cihaz Donanım Doğrulaması Yapılmadı
- **Açıklama:** Uygulama Expo Dev Client, Metro bundler ve simülatör/web ortamlarında test edilmiştir. Farklı ekran boyutlarına, GPU yongalarına (Adreno, Mali) ve RAM kısıtlarına sahip gerçek fiziksel Android ve iOS cihazlarında kapsamlı alan testleri henüz gerçekleştirilmemiştir.
- **Risk:** Eski donanımlı Android cihazlarda MapLibre GPU yükü altında FPS düşüşü veya batarya tüketimi yaşanabilir.
- **Çözüm Planı:** Faz 18 veya mağaza yayını öncesinde fiziksel Android ve iOS cihazlarında termal ve bellek profillemesi (Android Studio Profiler / Xcode Instruments) yapılmalıdır.
- **Geçici Çözüm:** Beta testleri kontrollü simülatör veya yüksek güçlü test cihazlarıyla sınırlandırılmalıdır.

#### 2. Bağımsız Android APK / AAB ve iOS IPA Üretimi Ertelendi
- **Açıklama:** Kapsam sınırları uyarınca APK/AAB/IPA oluşturulmamış, mağazalara gönderilmemiştir.
- **Risk:** Üretim (production) derleme bayraklarında ProGuard veya Hermes bytecode optimizasyonlarından kaynaklanan beklenmedik kütüphane çakışmaları oluşabilir.
- **Çözüm Planı:** EAS Build veya yerel Gradle pipeline (`cd apps/mobile/android && ./gradlew assembleRelease`) çalıştırılarak imzalı ilk paketler üretilmelidir.

#### 3. Gerçek Push Bildirim (FCM / APNs) Canlı Teslimatı Ertelendi
- **Açıklama:** Push bildirim veritabanı şeması, token kaydı, outbox entegrasyonu ve geliştirici simülasyon adaptörü hazırdır; ancak Apple Developer Program ve Google Firebase Cloud Messaging canlı üretim sertifikaları / anahtarları henüz yüklenmemiştir.
- **Risk:** Uygulama kapalıyken (arka planda) kullanıcının kilit ekranına bildirim düşmesi fiziksel olarak doğrulanamamıştır.
- **Çözüm Planı:** Canlı sunucu ortam değişkenlerine `FIREBASE_SERVICE_ACCOUNT` ve `APNS_KEY_ID` tanımlanarak uçtan uca bildirim iletimi test edilmelidir.

#### 4. Canlı API ve Web Alan Adı DNS/SSL Kurulumu
- **Açıklama:** Üretim HTTPS API (`api.sehirnabiz.com`) DNS/SSL provizyonu yapılmamıştır. Staging reverse proxy yapılandırması (`docker/staging/nginx.conf`) ve `.env.staging` yerel kendinden imzalı sertifikayla doğrulanmış ancak harici canlı sunucuya kurulmamıştır.

---

### 🟢 Çözülen Blockerlar ve İyileştirmeler (Phase 14, 15, 16 & 17)

#### [ÇÖZÜLDÜ - Phase 17] Redis Kesintisinde Outbox Teslimat Semantiği & Güvence Mimarisi
- 5 bağımsız teslimat kanalı ayrıştırıldı (`inAppNotification`, `websocketBroadcast`, `redisPubSub`, `pushNotification`, `cacheInvalidation`).
- `inAppNotification` zorunlu kılındı; DB hatasında Outbox ASLA `PROCESSED` yapılmaz, exponential backoff ile tekrar denenir.
- Redis kesintisinde yerel soket yayını korunur, kanal `DEGRADED` olarak işaretlenir ve veri kaybı önlenir.
- `idempotencyKey` koruması ile worker crash sonrası mükerrer bildirim riski tamamen ortadan kaldırıldı.

#### [ÇÖZÜLDÜ - Phase 17] Çoklu API Instance (Dual-Instance) Socket.IO & Redis Adapter Doğrulaması
- Port 3181 ve 3182 üzerinde iki bağımsız instance ile gerçek Redis adapter üzerinden çapraz yayın (4 ms teslimat gecikmesi) doğrulandı.
- Oda bazlı izolasyon (kullanıcıya özel odalar ve moderatör odası yetkilendirmesi) ve failover reconnect kanıtlandı.
- WebSocket-only ve Polling taşıma ayrımı ile Nginx `ip_hash` sticky-session gereksinimi analiz edildi ve belgelendi.

#### [ÇÖZÜLDÜ - Phase 17] Yerel Reverse Proxy Port Güvenliği (127.0.0.1 Bind)
- Staging Nginx portları `0.0.0.0` yerine strictly `127.0.0.1:80` ve `127.0.0.1:443`'e bağlandı.
- PostgreSQL, Redis ve MinIO portları Docker host'una kapatıldı; yerel ağ sızıntısı engellendi.

#### [ÇÖZÜLDÜ - Phase 17] Kamuya Açık Readiness Bilgi Sızıntısının Kapatılması
- `GET /health/ready` uç noktasında kamusal istemcilere iç altyapı topology ayrıntılarının dönülmesi engellendi; yalnızca `{ status: "ok" }` sunuluyor.
- `GET /health/diagnostics` uç noktası `crypto.timingSafeEqual` timing attack koruması, sıfır kesintili virgüllü secret rotasyonu ve log sanitizasyonu ile sertleştirildi.

#### [ÇÖZÜLDÜ - Phase 17] TCKN ve Sabit Hatları Kapsayan Gelişmiş PiiScrubber & Regex Sınır Yönetimi
- `PiiScrubber` sınıfı ile Türkiye cep telefonları, sabit hatları, 11 haneli TCKN ve e-posta adresleri maskelendi; koordinat ve tarih false-positive koruması sağlandı.
- Regex sınırları (açık adresler, şahıs adları) belgelenerek ihbar, gizleme, silme ve inceleme kuyruğu ile güvence altına alındı.

#### [ÇÖZÜLDÜ - Phase 17] Canlı Üretime Yönelik Fail-Closed Ortam Doğrulayıcısı
- `NODE_ENV === 'production'` modunda localhost DB/Redis/S3, zayıf/varsayılan parolalar ve wildcard CORS'a karşı API'nin başlamasını engelleyen fail-closed doğrulayıcı (`env.validation.ts`) devreye alındı.

#### [ÇÖZÜLDÜ - Phase 16] Yerel Staging Mimarisinin Fiilen Çalıştırılması (Dry-Run)
- İzole Docker staging ortamı ayağa kaldırıldı, tüm migration'lar çalıştırıldı ve 12 adımlı yaşam döngüsü E2E testi başarıyla tamamlandı.

#### [ÇÖZÜLDÜ - Phase 16] WebSocket Yük ve PostGIS Performans Doğrulaması
- 500 eşzamanlı WebSocket bağlantısı test edildi (%100 başarı, p95: 108ms). PostGIS BBox sorgusu 0.45 ms ile tamamlandı.

#### [ÇÖZÜLDÜ - Phase 14 & 15] Gerçek MinIO Fiziksel Medya Temizliği ve @AllowPendingDeletion Kalkanı
- Gerçek S3 nesnelerinin fiziksel olarak silindiği ve 404 NoSuchKey döndüğü E2E ile kanıtlandı.

---

### 🟠 High (Yüksek Öncelikli İyileştirmeler)

#### 5. Web Tarayıcılarında MapLibre WebGL Uyumluluğu
- **Açıklama:** Proje birincil olarak mobil odaklıdır (React Native + Expo). Masaüstü tarayıcılarda (`pnpm run web`) MapLibre native modülü yerine canvas veya fallback katmanı gerekmektedir.
