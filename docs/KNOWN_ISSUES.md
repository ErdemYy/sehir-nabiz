# ŞehirNabız — Bilinen Sorunlar ve Teknik Borç Envanteri (Known Issues)

**Tarih:** 28 Ekim 2026  
**Faz:** Phase 15 — Account Deletion Verification, Privacy Hardening & Staging Readiness  
**Son Durum:** Staging Dağıtımına Hazır, Beta Öncesi Kalan Blockerlar Açıkça Belgelendi  

---

## 1. Öncelik ve Şiddet Sınıflandırması

Bu belge, ŞehirNabız projesinde mevcut bilinen sınırları, ertelenen maddeleri ve canlı mağaza (App Store / Play Store) öncesi çözülmesi gereken teknik borçları dürüst ve şeffaf bir şekilde listeler.

---

## 2. Sorun ve Eksiklik Envanteri

### 🔴 Kalan Blockerlar (Canlı Mağaza ve Açık Beta Öncesi Zorunlu)

#### 1. Fiziksel Cihaz Donanım Doğrulaması Yapılmadı
- **Açıklama:** Uygulama Expo Dev Client, Metro bundler ve simülatör/web ortamlarında test edilmiştir. Farklı ekran boyutlarına, GPU yongalarına (Adreno, Mali) ve RAM kısıtlarına sahip gerçek fiziksel Android ve iOS cihazlarında kapsamlı alan testleri henüz gerçekleştirilmemiştir.
- **Risk:** Eski donanımlı Android cihazlarda MapLibre GPU yükü altında FPS düşüşü veya batarya tüketimi yaşanabilir.
- **Çözüm Planı:** Faz 16 kapsamında fiziksel Android ve iOS cihazlarında termal ve bellek profillemesi (Android Studio Profiler / Xcode Instruments) yapılmalıdır.
- **Geçici Çözüm:** Beta testleri kontrollü simülatör veya yüksek güçlü test cihazlarıyla sınırlandırılmalıdır.

#### 2. Bağımsız Android APK / AAB ve iOS IPA Üretimi Ertelendi
- **Açıklama:** Kapsam sınırları uyarınca APK/AAB/IPA oluşturulmamış, mağazalara gönderilmemiştir.
- **Risk:** Üretim (production) derleme bayraklarında ProGuard veya Hermes bytecode optimizasyonlarından kaynaklanan beklenmedik kütüphane çakışmaları oluşabilir.
- **Çözüm Planı:** Staging doğrulamasının ardından EAS Build veya yerel Gradle pipeline (`cd apps/mobile/android && ./gradlew assembleRelease`) çalıştırılarak imzalı ilk paketler üretilmelidir.

#### 3. Gerçek Push Bildirim (FCM / APNs) Canlı Teslimatı Ertelendi
- **Açıklama:** Push bildirim veritabanı şeması, token kaydı, outbox entegrasyonu ve geliştirici simülasyon adaptörü hazırdır; ancak Apple Developer Program ve Google Firebase Cloud Messaging canlı üretim sertifikaları / anahtarları henüz yüklenmemiştir.
- **Risk:** Uygulama kapalıyken (arka planda) kullanıcının kilit ekranına bildirim düşmesi fiziksel olarak doğrulanamamıştır.
- **Çözüm Planı:** Canlı sunucu ortam değişkenlerine `FIREBASE_SERVICE_ACCOUNT` ve `APNS_KEY_ID` tanımlanarak uçtan uca bildirim iletimi test edilmelidir.

#### 4. Canlı API ve Web Alan Adı DNS/SSL Kurulumu
- **Açıklama:** Üretim HTTPS API (`api.sehirnabiz.com`) DNS/SSL provizyonu yapılmamıştır. Staging reverse proxy yapılandırması (`docker/staging/nginx.conf`) ve `.env.staging.example` hazırlanmış ancak canlıya geçirilmemiştir.

---

### 🟢 Çözülen Blockerlar (Phase 14 & Phase 15)

#### [ÇÖZÜLDÜ] Kullanıcı Hesap ve Kişisel Veri Silme Akışı (Right to Be Forgotten)
- **Açıklama:** Apple App Store Review Guideline 5.1.1(v) ve KVKK Madde 7 gereğince hesap oluşturulabilen her uygulamada doğrudan mobil uygulama içinden ve kamuya açık bir web URL'inden hesap silme seçeneği sunulmalıdır.
- **Phase 14-15 Doğrulamaları:**
  - Gerçek MinIO nesne deposu üzerinde fiziksel silme kanıtlandı (S3 404 doğrulaması).
  - `PENDING_DELETION` yetkilendirme kalkanı (`@AllowPendingDeletion`) ile silme sürecindeki kullanıcının normal işlemleri engellenirken iptal ve sorgulama yetkileri korundu.
  - Kamusal olayların (kaza, afet) korunması ve taslak bildirimlerin kişisel verilerden arındırılması sağlandı.
  - Transactional Outbox görev izolasyonu ve push token imhası tamamlandı.
  - Otomatik `AccountDeletionProcessorService` worker'ı ve azami 5 deneme sonrası Dead-Letter operasyonel uyarısı kuruldu.
  - Raporlama tutarsızlığı (329 vs 330) netleştirildi, test tabanı 353 teste (%100 yeşil) ulaştırıldı.

#### [ÇÖZÜLDÜ] Staging Mimari Hazırlığı ve Güvenlik Altyapısı
- Staging Docker Compose (`docker-compose.staging.yml`), `.env.staging.example`, Nginx reverse proxy konfigürasyonu (`docker/staging/nginx.conf`), migration ve backup/restore betikleri eksiksiz oluşturuldu ve boş veritabanında test edildi.

---

### 🟠 High (Yüksek Öncelikli İyileştirmeler)

#### 5. Web Tarayıcılarında MapLibre WebGL Uyumluluğu
- **Açıklama:** Proje birincil olarak mobil odaklıdır (React Native + Expo). Masaüstü tarayıcılarda (`pnpm run web`) MapLibre native modülü yerine canvas veya fallback katmanı gerekmektedir.
- **Risk:** Masaüstü web üzerinden harita incelenirken tarayıcının WebGL desteğine bağlı olarak harita kararması yaşanabilir.
- **Çözüm Planı:** Web ortamı için `maplibre-gl-js` köprüsü ile conditional render yapılması.

---

### 🟡 Medium (Orta Öncelikli İyileştirmeler)

#### 6. Çevrimdışı Harita Karo Önbelleği (Offline Tile Cache Sınırı)
- **Açıklama:** MapLibre vektör karoları SQLite tabanlı yerel önbellekte tutulmaktadır. Depolama alanı aşırı düşük (örn. <500MB boş yer kalan) cihazlarda otomatik temizleme (pruning) tetiklenebilir.
- **Çözüm Planı:** Harita ayarlarından "Önbelleği Temizle" seçeneği sunulması.

#### 7. Hareketi Azalt (Reduced Motion) Desteği
- **Açıklama:** Haritada kullanıcı konumuna giderken veya arama sonucunda pin merkezlenirken yapılan kamera animasyonları, sistem "Hareketi Azalt" seçeneği açık olan kullanıcılar için henüz kapatılmamaktadır.
- **Çözüm Planı:** `AccessibilityInfo.isReduceMotionEnabled` hook'u ile animasyon süresinin sıfıra indirilmesi.

---

### 🟢 Low (Düşük Öncelikli / Kozmetik)

#### 8. Haptik Titreşim Eksikliği
- **Açıklama:** Teyit, itiraz veya olay gönderme işlemlerinde kullanıcıya yalnızca görsel geri bildirim verilmektedir.
- **Çözüm Planı:** `expo-haptics` ile hafif titreşim geri bildirimi eklenmesi.

#### 9. İstatistik Grafikleri Yatay Döndürme
- **Açıklama:** Şehir istatistikleri dikey (portrait) modda optimize edilmiştir; cihaz yatay çevrildiğinde (landscape) çubuk grafikler sıkışabilmektedir.
- **Geçici Çözüm:** Mobil uygulamada ekran yönü dikey (portrait) olarak kilitlenmiştir.
