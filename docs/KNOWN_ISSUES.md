# ŞehirNabız — Bilinen Sorunlar ve Teknik Borç Envanteri (Known Issues)

**Tarih:** 28 Ekim 2026  
**Faz:** Phase 16 — Staging Dry-Run, Load Testing, Security Verification & Production Hardening  
**Son Durum:** Yerel Staging Ortamı ve Yük Testleri Tamamlandı; Üretim Öncesi Kalan Blockerlar Açıkça Belgelendi  

---

## 1. Öncelik ve Şiddet Sınıflandırması

Bu belge, ŞehirNabız projesinde mevcut bilinen sınırları, ertelenen maddeleri ve canlı mağaza (App Store / Play Store) öncesi çözülmesi gereken teknik borçları dürüst ve şeffaf bir şekilde listeler.

---

## 2. Sorun ve Eksiklik Envanteri

### 🔴 Kalan Blockerlar (Canlı Mağaza ve Açık Beta Öncesi Zorunlu)

#### 1. Fiziksel Cihaz Donanım Doğrulaması Yapılmadı
- **Açıklama:** Uygulama Expo Dev Client, Metro bundler ve simülatör/web ortamlarında test edilmiştir. Farklı ekran boyutlarına, GPU yongalarına (Adreno, Mali) ve RAM kısıtlarına sahip gerçek fiziksel Android ve iOS cihazlarında kapsamlı alan testleri henüz gerçekleştirilmemiştir.
- **Risk:** Eski donanımlı Android cihazlarda MapLibre GPU yükü altında FPS düşüşü veya batarya tüketimi yaşanabilir.
- **Çözüm Planı:** Faz 17 veya mağaza yayını öncesinde fiziksel Android ve iOS cihazlarında termal ve bellek profillemesi (Android Studio Profiler / Xcode Instruments) yapılmalıdır.
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

### 🟢 Çözülen Blockerlar ve İyileştirmeler (Phase 14, 15 & 16)

#### [ÇÖZÜLDÜ - Phase 16] Yerel Staging Mimarisinin Fiilen Çalıştırılması (Dry-Run)
- İzole Docker staging ortamı (Nginx, API, PostgreSQL 16/PostGIS, Redis, MinIO) dev konteynerlerine zarar vermeden ayağa kaldırıldı, tüm migration'lar çalıştırıldı ve 12 adımlı yaşam döngüsü E2E testi başarıyla tamamlandı.

#### [ÇÖZÜLDÜ - Phase 16] WebSocket Yük ve PostGIS Performans Doğrulaması
- 50'den 500'e kadar eşzamanlı WebSocket bağlantısı test edildi (%100 başarı, p95: 108ms).
- 1.000 tohum olay ile PostGIS BBox sorgusu (0.45 ms GIST indeks taraması) ve analitik benchmark'ları tamamlandı.

#### [ÇÖZÜLDÜ - Phase 16] Diagnostics Uç Noktası Güvenlik Kalkanı
- `GET /health/diagnostics` verileri `DiagnosticsGuard` ile admin rolü ve `x-diagnostics-key` şartına bağlandı; yetkisiz erişimler 403 ile engellendi.

#### [ÇÖZÜLDÜ - Phase 16] Hesap Silme İptal Güvenliği ve Süresi Dolan Token Kurtarması
- Access token süresi dolmuş kullanıcının silme iptali için `POST /auth/reauthenticate-deletion` kısıtlı oturumu tasarlandı. Parola hash uyumluluğu (Bcrypt) doğrulandı.

#### [ÇÖZÜLDÜ - Phase 16] Kamusal Olaylarda Metin İçi Kişisel Veri Arındırma (PII Scrubbing)
- Hesap silme sırasında kullanıcının `ACTIVE`/`RESOLVED` olaylarının açıklamasındaki telefon numaraları ve e-postalar regex ile `[Telefon Gizlendi]` ve `[E-posta Gizlendi]` şeklinde maskelendi.

#### [ÇÖZÜLDÜ - Phase 14 & 15] Gerçek MinIO Fiziksel Medya Temizliği ve @AllowPendingDeletion Kalkanı
- Gerçek S3 nesnelerinin fiziksel olarak silindiği ve 404 NoSuchKey döndüğü E2E ile kanıtlandı.

---

### 🟠 High (Yüksek Öncelikli İyileştirmeler)

#### 5. Web Tarayıcılarında MapLibre WebGL Uyumluluğu
- **Açıklama:** Proje birincil olarak mobil odaklıdır (React Native + Expo). Masaüstü tarayıcılarda (`pnpm run web`) MapLibre native modülü yerine canvas veya fallback katmanı gerekmektedir.
