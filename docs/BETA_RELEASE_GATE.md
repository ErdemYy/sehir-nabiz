# ŞehirNabız — Beta Sürüm Geçiş Kapısı (Beta Release Gate)

**Tarih:** 29 Ekim 2026  
**Faz:** Phase 17 — Distributed Reliability, Outbox Delivery Assurance & Deployment Hardening  
**Sonuç:** 🔴 **KAPI KAPALI (BLOCKED) — 3 Kritik Önkoşul Karşılanmayı Bekliyor (Dağıtık Güvenilirlik, Outbox Güvencesi ve Dağıtım Sertleştirmesi Başarıyla Tamamlandı)**  

---

## 1. Geçiş Kapısı (Release Gate) Amacı ve Metodolojisi

Beta Sürüm Geçiş Kapısı; uygulamanın geliştirme ve simülatör aşamasından çıkarılarak gerçek kullanıcılara (Google Play Kapalı Test / Apple TestFlight) dağıtılabilmesi için sağlanması zorunlu teknik, yasal ve operasyonel kabul kriterlerini belirler.

> [!IMPORTANT]
> **Temel İlke:** Karşılanmayan kabul kriterleri asla zorla "PASS" yapılmaz. Simülatör veya birim testinde doğrulanmış bir davranış, fiziksel donanımda veya canlı mağazada doğrulanmış gibi sunulamaz.

---

## 2. 13 Beta Release Gate Kabul Kriteri Matrisi

| # | Kabul Kriteri | Gerekli Kanıt Türü | Mevcut Durum | Notlar ve Gerekçe |
| :---: | :--- | :--- | :--- :--- | :--- |
| **1** | **Monorepo Testleri** | CI / Turborepo Otomasyonu | 🟢 **PASS** | **409 testin tamamı (%100) yeşil geçti.** (API: 274, Mobil: 116, Tokens: 11, Shared: 8). Sıfır hata. |
| **2** | **TypeScript, Lint & Build** | Turborepo Build Pipeline | 🟢 **PASS** | Strict mode tam uyumlu, lint ve paket derlemeleri hatasız. |
| **3** | **Native Android APK/AAB Derlemesi** | Gradle / EAS Build Çıktısı | 🔴 **BLOCKED** | Kapsam sınırları gereği derleme başlatılmadı; henüz `.apk` üretilmedi. |
| **4** | **Fiziksel Android Cihaz Doğrulaması** | Gerçek Donanım Çalışma Günlüğü | 🔴 **BLOCKED** | Gerçek Android telefon üzerinde termal ve bellek testi yapılmadı. |
| **5** | **Harita Render ve Etkileşim** | MapLibre GPU / Vektör Katmanı | 🟡 **KOŞULLU PASS** | Web ve Expo Dev Client'ta doğrulandı; eski donanım testi bekliyor. |
| **6** | **Oturum Açma/Çıkış & Veri Hijyeni** | SecureStore + Soket + Taslak | 🟢 **PASS** | Token silme, soket kapatma ve taslak temizliği doğrulandı. |
| **7** | **Olay Oluşturma ve Medya Yükleme** | Presigned S3 + Sharp WebP | 🟢 **PASS** | Canlı MinIO ve PostgreSQL E2E entegrasyonunda doğrulandı. |
| **8** | **Moderatör Paneli ve Onay/Red** | Role Guards + Gerekçe Kalkanı | 🟢 **PASS** | `MODERATOR`/`ADMIN` yetkilendirmesi ve audit trail doğrulandı. |
| **9** | **WebSocket Reconnect & Çift Instance** | Redis Adapter + REST Snapshot | 🟢 **PASS** | Çift instance çapraz yayını (4 ms latency), el sıkışma vs teslimat ayrımı, failover reconnect doğrulandı. |
| **10** | **Gerçek Kilit Ekranı Push Teslimatı** | FCM / APNs Canlı Teslimatı | 🔴 **BLOCKED** | Firebase ve Apple üretim sertifikaları tanımlanmadı (Ertelenmiştir). |
| **11** | **Hesap ve Veri Silme İş Akışı** | KVKK / Store Account Deletion | 🟢 **PASS** | 12 adımlı yaşam döngüsü E2E testi, süresi dolan token kurtarması, `PiiScrubber` (telefon, sabit hat, TCKN, e-posta) ve MinIO fiziksel temizliği tamamlandı. |
| **12** | **Staging Ortamı Doğrulaması** | Docker Compose + Nginx TLS | 🟢 **PASS** | 5/5 staging konteyneri izole ortamda sağlıklı çalıştırıldı, `127.0.0.1` reverse proxy bind, rate limit, SSL simülasyonu ve migration'lar doğrulandı. |
| **13** | **Kritik Güvenlik Açıklarının Kapatılması** | Security Audit & Rate Limiting | 🟢 **PASS** | Zero-leakage readiness (`/health/ready`), timing-safe diagnostics secret rotasyonu, fail-closed production env validation (`env.validation.ts`) kanıtlandı. |

---

## 3. Kapının Açılması İçin Giderilmesi Zorunlu Kalan 3 Engel (Blocker)

### 🔴 Kalan Engel 1: Bağımsız Release APK Derlemesinin Alınmamış Olması
- **Durum:** Expo Prebuild yapılmış olsa da bağımsız imzalı bir `.apk` veya `.aab` derlemesi henüz alınmamıştır.
- **Çözüm:** Kullanıcı onayıyla `eas build --platform android --profile preview` veya yerel Gradle derlemesi çalıştırılmalıdır.

### 🔴 Kalan Engel 2: Gerçek Fiziksel Cihazda Donanım ve Harita Doğrulaması
- **Durum:** Harita motorunun donanım ivmeli OpenGL/Vulkan performansı yalnızca geliştirici ortamında çalıştırılmıştır.
- **Çözüm:** En az bir fiziksel Android (tercihen orta segment) ve bir iPhone cihazında minimum 30 dakikalık gezinme ve bellek testi yapılmalıdır.

### 🔴 Kalan Engel 3: Canlı FCM / APNs Push Sertifikalarının Eksikliği
- **Durum:** Push bildirim veritabanı ve dev adaptörü çalışmakta; ancak Google Cloud ve Apple Developer canlı push sertifikaları henüz eklenmemiştir.
- **Çözüm:** Firebase Service Account JSON dosyası sunucu ortamına tanımlanmalıdır.

---

## 4. Karar ve Sonuç

ŞehirNabız projesinin mimari, kod kalitesi ve birim/entegrasyon testleri mükemmel durumdadır (**409/409 başarılı test, sıfır hata**). Yerel staging dry-run, yük testleri, dağıtık Outbox güvencesi ve çoklu backend doğrulaması başarıyla tamamlanmıştır.

Ancak yukarıdaki 3 kritik blocker (canlı APK derlemesi, fiziksel cihaz QA ve push sertifikaları) karşılanmadan **mağazalara veya genel açık betaya geçiş ONAYLANMAZ.** Uygulama şu aşamada **yalnızca kontrollü iç geliştirici betası (Internal Dev Build)** seviyesindedir.
