# ŞehirNabız — Beta Sürüm Geçiş Kapısı (Beta Release Gate)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 13 — Beta Release Preparation, Security Audit & Distribution Readiness  
**Sonuç:** 🔴 **KAPI KAPALI (BLOCKED) — 4 Kritik Önkoşul Karşılanmayı Bekliyor**  

---

## 1. Geçiş Kapısı (Release Gate) Amacı ve Metodolojisi

Beta Sürüm Geçiş Kapısı; uygulamanın geliştirme ve simülatör aşamasından çıkarılarak gerçek kullanıcılara (Google Play Kapalı Test / Apple TestFlight) dağıtılabilmesi için sağlanması zorunlu teknik, yasal ve operasyonel kabul kriterlerini belirler.

> [!IMPORTANT]
> **Temel İlke:** Karşılanmayan kabul kriterleri asla zorla "PASS" yapılmaz. Simülatör veya birim testinde doğrulanmış bir davranış, fiziksel donanımda veya canlı mağazada doğrulanmış gibi sunulamaz.

---

## 2. 13 Beta Release Gate Kabul Kriteri Matrisi

| # | Kabul Kriteri | Gerekli Kanıt Türü | Mevcut Durum | Notlar ve Gerekçe |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Monorepo Testleri** | CI / Turborepo Otomasyonu | 🟢 **PASS** | 311 testin tamamı (%100) yeşil geçti. Sıfır hata. |
| **2** | **TypeScript, Lint & Build** | Turborepo Build Pipeline | 🟢 **PASS** | Strict mode tam uyumlu, lint ve paket derlemeleri hatasız. |
| **3** | **Native Android APK/AAB Derlemesi** | Gradle / EAS Build Çıktısı | 🔴 **BLOCKED** | Kullanıcı onayı olmadan derleme başlatılmadı; henüz `.apk` üretilmedi. |
| **4** | **Fiziksel Android Cihaz Doğrulaması** | Gerçek Donanım Çalışma Günlüğü | 🔴 **BLOCKED** | Gerçek Android telefon üzerinde termal ve bellek testi yapılmadı. |
| **5** | **Harita Render ve Etkileşim** | MapLibre GPU / Vektör Katmanı | 🟡 **KOŞULLU PASS** | Web ve Expo Dev Client'ta doğrulandı; eski donanım testi bekliyor. |
| **6** | **Oturum Açma/Çıkış & Veri Hijyeni** | SecureStore + Soket + Taslak | 🟢 **PASS** | Token silme, soket kapatma ve taslak temizliği doğrulandı. |
| **7** | **Olay Oluşturma ve Medya Yükleme** | Presigned S3 + Sharp WebP | 🟢 **PASS** | Canlı MinIO ve PostgreSQL E2E entegrasyonunda doğrulandı. |
| **8** | **Moderatör Paneli ve Onay/Red** | Role Guards + Gerekçe Kalkanı | 🟢 **PASS** | `MODERATOR`/`ADMIN` yetkilendirmesi ve audit trail doğrulandı. |
| **9** | **WebSocket Reconnect & Snapshot** | Monotonic Versioning + Jitter | 🟢 **PASS** | Reconnect sonrası REST mutabakatı otomatik test edildi. |
| **10** | **Gerçek Kilit Ekranı Push Teslimatı** | FCM / APNs Canlı Teslimatı | 🔴 **BLOCKED** | Firebase ve Apple üretim sertifikaları tanımlanmadı (Ertelenmiştir). |
| **11** | **Hesap ve Veri Silme İş Akışı** | KVKK / Store Account Deletion | 🔴 **BLOCKED** | Backend'de `DELETE /users/me` uç noktası henüz geliştirilmedi. |
| **12** | **Canlı Ortam Güvenli Yapılandırması** | HTTPS Domain + Prod Secrets | 🟡 **KOŞULLU PASS** | Şema ve kurallar hazır; canlı alan adı provizyonu bekleniyor. |
| **13** | **Kritik Güvenlik Açıklarının Kapatılması** | Security Audit & Rate Limiting | 🟢 **PASS** | CORS wildcard yasağı, loopback engeli ve çıkış temizliği tamamlandı. |

---

## 3. Kapının Açılması İçin Giderilmesi Zorunlu 4 Engel (Blocker)

### 🔴 Engel 1: Kullanıcı Hesap ve Veri Silme Yeteneğinin Bulunmaması
- **Durum:** Apple App Store Review Guideline 5.1.1(v) ve Google Play Veri Güvenliği politikaları gereğince, hesap oluşturulan her uygulamada kullanıcının hesabını ve ilişkili kişisel verilerini doğrudan uygulama içinden silebilmesi yasal bir zorunluluktur.
- **Çözüm:** Phase 14 kapsamında `DELETE /api/v1/users/me` uç noktası ve mobil "Hesabımı Sil" onay diyaloğu uygulanmalıdır.

### 🔴 Engel 2: Bağımsız Release APK Derlemesinin Alınmamış Olması
- **Durum:** Expo Prebuild yapılmış olsa da bağımsız imzalı bir `.apk` veya `.aab` derlemesi henüz alınmamıştır.
- **Çözüm:** Kullanıcı onayıyla `eas build --platform android --profile preview` veya yerel Gradle derlemesi çalıştırılmalıdır.

### 🔴 Engel 3: Gerçek Fiziksel Cihazda Donanım ve Harita Doğrulaması
- **Durum:** Harita motorunun donanım ivmeli OpenGL/Vulkan performansı yalnızca geliştirici ortamında çalıştırılmıştır.
- **Çözüm:** En az bir fiziksel Android (tercihen orta segment) ve bir iPhone cihazında minimum 30 dakikalık gezinme ve bellek testi yapılmalıdır.

### 🔴 Engel 4: Canlı FCM / APNs Push Sertifikalarının Eksikliği
- **Durum:** Push bildirim veritabanı ve dev adaptörü çalışmakta; ancak Google Cloud ve Apple Developer canlı push sertifikaları henüz eklenmemiştir.
- **Çözüm:** Firebase Service Account JSON dosyası sunucu ortamına tanımlanmalıdır.

---

## 4. Karar ve Sonuç

ŞehirNabız projesinin mimari, kod kalitesi ve birim/entegrasyon testleri mükemmel durumdadır (311/311 başarılı test).

Ancak yukarıdaki 4 kritik blocker karşılanmadan **mağazalara veya genel açık betaya geçiş ONAYLANMAZ.** Uygulama şu aşamada **yalnızca kontrollü iç geliştirici betası (Internal Dev Build)** seviyesindedir.
