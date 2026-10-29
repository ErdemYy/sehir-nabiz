# ŞehirNabız — Beta Sürüm Geçiş Kapısı (Beta Release Gate)

**Tarih:** 29 Ekim 2026  
**Faz:** Phase 18A — Android Native Build Readiness & Mobile Visual QA  
**Sonuç:** 🔴 **KAPI KAPALI (BLOCKED) — 3 Kritik Önkoşul Karşılanmayı Bekliyor (Android Native Derleme Hazırlığı ve Mobil Görsel QA Tamamlandı)**  

---

## 1. Geçiş Kapısı (Release Gate) Amacı ve Metodolojisi

Beta Sürüm Geçiş Kapısı; uygulamanın geliştirme ve simülatör aşamasından çıkarılarak gerçek kullanıcılara (Google Play Kapalı Test / Apple TestFlight) dağıtılabilmesi için sağlanması zorunlu teknik, yasal ve operasyonel kabul kriterlerini belirler.

> [!IMPORTANT]
> **Temel İlke:** Karşılanmayan kabul kriterleri asla zorla "PASS" yapılmaz. Simülatör veya birim testinde doğrulanmış bir davranış, fiziksel donanımda veya canlı mağazada doğrulanmış gibi sunulamaz.

---

## 2. 13 Beta Release Gate Kabul Kriteri Matrisi

| # | Kabul Kriteri | Gerekli Kanıt Türü | Mevcut Durum | Notlar ve Gerekçe |
| :---: | :--- | :--- | :--- :--- | :--- |
| **1** | **Monorepo Testleri** | CI / Turborepo Otomasyonu | 🟢 **PASS** | **415 testin tamamı (%100) yeşil geçti.** (API: 274, Mobil: 122, Tokens: 11, Shared: 8). Sıfır hata. |
| **2** | **TypeScript, Lint & Build** | Turborepo Build Pipeline | 🟢 **PASS** | Strict mode tam uyumlu, lint ve paket derlemeleri hatasız. |
| **3** | **Native Android APK/AAB Derlemesi** | Gradle / EAS Build Çıktısı | 🔴 **BLOCKED** | EAS hesap girişi ve proje kimliği bekleniyor; APK derlemesi Phase 18B'ye devredildi. |
| **4** | **Fiziksel Android Cihaz Doğrulaması** | Gerçek Donanım Çalışma Günlüğü | 🔴 **BLOCKED** | Gerçek Android telefon üzerinde termal ve bellek testi henüz yapılmadı. |
| **5** | **Harita Render ve Etkileşim** | MapLibre GPU / Vektör Katmanı | 🟡 **KOŞULLU PASS** | MapLibre 11.5.0 plugin ve native Gradle ayarları hazır; fiziksel telefon testi bekliyor. |
| **6** | **Oturum Açma/Çıkış & Veri Hijyeni** | SecureStore + Soket + Taslak | 🟢 **PASS** | Token silme, soket kapatma ve taslak temizliği doğrulandı. |
| **7** | **Olay Oluşturma ve Medya Yükleme** | Presigned S3 + Sharp WebP | 🟢 **PASS** | MinIO SigV4 imza bütünlüğü ve LAN ağ rehberi (`DEVICE_NETWORK_SETUP.md`) doğrulandı. |
| **8** | **Moderatör Paneli ve Onay/Red** | Role Guards + Gerekçe Kalkanı | 🟢 **PASS** | `MODERATOR`/`ADMIN` yetkilendirmesi ve audit trail doğrulandı. |
| **9** | **WebSocket Reconnect & Çift Instance** | Redis Adapter + REST Snapshot | 🟢 **PASS** | Çift instance çapraz yayını (4 ms latency), el sıkışma vs teslimat ayrımı, failover reconnect doğrulandı. |
| **10** | **Gerçek Kilit Ekranı Push Teslimatı** | FCM / APNs Canlı Teslimatı | 🔴 **BLOCKED** | Firebase ve Apple üretim sertifikaları tanımlanmadı (Ertelenmiştir). |
| **11** | **Hesap ve Veri Silme İş Akışı** | KVKK / Store Account Deletion | 🟢 **PASS** | 12 adımlı yaşam döngüsü E2E testi, süresi dolan token kurtarması, `PiiScrubber` ve MinIO fiziksel temizliği tamamlandı. |
| **12** | **Staging Ortamı Doğrulaması** | Docker Compose + Nginx TLS | 🟢 **PASS** | 5/5 staging konteyneri izole ortamda sağlıklı çalıştırıldı, `127.0.0.1` reverse proxy bind, rate limit ve SSL simülasyonu doğrulandı. |
| **13** | **Kritik Güvenlik Açıklarının Kapatılması** | Security Audit & Rate Limiting | 🟢 **PASS** | Zero-leakage readiness, timing-safe diagnostics secret rotasyonu, fail-closed production env validation kanıtlandı. |

---

## 3. Kapının Açılması İçin Giderilmesi Zorunlu Kalan 3 Engel (Blocker)

### 🔴 Kalan Engel 1: Bağımsız Release / Preview APK Derlemesi (EAS Oturumu)
- **Durum:** Native Android yapılandırması (`app.json`, `gradle.properties`, `metro.config.js`) hazırlandı; ancak `extra.eas.projectId` ve EAS oturumu eksiktir.
- **Çözüm:** Faz 18B'de `npx eas login` ve `npx eas init` çalıştırılarak ilk `preview` APK paketi üretilmelidir.

### 🔴 Kalan Engel 2: Gerçek Fiziksel Cihazda Donanım ve Görsel QA Doğrulaması
- **Durum:** Arayüz bileşenleri ve responsive kuralları kod düzeyinde denetlendi; ancak fiziksel Android telefon ekran görüntüsü alınmamıştır.
- **Çözüm:** Faz 18B'de üretilecek APK en az bir fiziksel Android telefona kurulmalı, MapLibre GPU/FPS akıcılığı ve Urban Floating UI ekranları doğrulanmalıdır.

### 🔴 Kalan Engel 3: Canlı FCM / APNs Push Sertifikalarının Eksikliği
- **Durum:** Push bildirim veritabanı ve dev adaptörü çalışmakta; ancak Google Cloud ve Apple Developer canlı push sertifikaları henüz eklenmemiştir.
- **Çözüm:** Firebase Service Account JSON dosyası sunucu ortamına tanımlanmalıdır.

---

## 4. Karar ve Sonuç

ŞehirNabız projesinin mimari, kod kalitesi ve birim/entegrasyon testleri mükemmel durumdadır (**415/415 başarılı test, sıfır hata**). Android native derleme hazırlıkları, Metro monorepo entegrasyonu, LAN bağlantı rehberi ve mobil görsel QA planı tamamlanmıştır.

Ancak yukarıdaki 3 kritik blocker (canlı APK derlemesi, fiziksel cihaz QA ve push sertifikaları) karşılanmadan **mağazalara veya genel açık betaya geçiş ONAYLANMAZ.** Uygulama şu aşamada **yalnızca kontrollü iç geliştirici betası (Internal Dev Build)** seviyesindedir.
