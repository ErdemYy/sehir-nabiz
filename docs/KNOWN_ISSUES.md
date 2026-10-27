# ŞehirNabız — Bilinen Sorunlar ve Teknik Borç Envanteri (Known Issues)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 12 — Mobile Experience Audit, E2E Quality & Beta Readiness  
**Son Durum:** Beta Öncesi Risk Değerlendirmesi  

---

## 1. Öncelik ve Şiddet Sınıflandırması

Bu belge, ŞehirNabız projesinde mevcut bilinen sınırları, ertelenen maddeleri ve canlı mağaza (App Store / Play Store) öncesi çözülmesi gereken teknik borçları dürüst ve şeffaf bir şekilde listeler.

---

## 2. Sorun ve Eksiklik Envanteri

### 🔴 Blocker (Canlı Mağaza ve Açık Beta Öncesi Zorunlu)

#### 1. Fiziksel Cihaz Donanım Doğrulaması Yapılmadı
- **Açıklama:** Uygulama Expo Dev Client, Metro bundler ve simülatör/web ortamlarında test edilmiştir. Farklı ekran boyutlarına, GPU yongalarına (Adreno, Mali) ve RAM kısıtlarına sahip gerçek fiziksel Android ve iOS cihazlarında kapsamlı alan testleri henüz gerçekleştirilmemiştir.
- **Risk:** Eski donanımlı Android cihazlarda MapLibre GPU yükü altında FPS düşüşü veya batarya tüketimi yaşanabilir.
- **Çözüm Planı:** Faz 13 kapsamında 5 farklı Android cihazda ve 3 iOS modelinde minimum 48 saatlik termal ve bellek profillemesi (Android Studio Profiler / Xcode Instruments) yapılmalıdır.
- **Geçici Çözüm:** Beta testleri kontrollü simülatör veya yüksek güçlü test cihazlarıyla sınırlandırılmalıdır.

#### 2. Bağımsız Android APK / AAB ve iOS IPA Üretimi Ertelendi
- **Açıklama:** Monorepo yapısında Expo Prebuild konfigürasyonu tamamlanmış olmasına rağmen bağımsız imzalı bir `.apk` / `.aab` veya TestFlight `.ipa` paketi henüz derlenmemiştir.
- **Risk:** Üretim (production) derleme bayraklarında ProGuard veya Hermes bytecode optimizasyonlarından kaynaklanan beklenmedik kütüphane çakışmaları oluşabilir.
- **Çözüm Planı:** EAS Build veya yerel Gradle pipeline (`cd apps/mobile/android && ./gradlew assembleRelease`) çalıştırılarak imzalı ilk beta derlemesi alınmalıdır.

#### 3. Gerçek Push Bildirim (FCM / APNs) Canlı Teslimatı Ertelendi
- **Açıklama:** Push bildirim veritabanı şeması, token kaydı, outbox entegrasyonu ve geliştirici simülasyon adaptörü hazırdır; ancak Apple Developer Program ve Google Firebase Cloud Messaging canlı üretim sertifikaları / anahtarları henüz yüklenmemiştir.
- **Risk:** Uygulama kapalıyken (arka planda) kullanıcının kilit ekranına bildirim düşmesi fiziksel olarak doğrulanamamıştır.
- **Çözüm Planı:** Canlı sunucu ortam değişkenlerine `FIREBASE_SERVICE_ACCOUNT` ve `APNS_KEY_ID` tanımlanarak uçtan uca bildirim iletimi test edilmelidir.

---

### 🟠 High (Yüksek Öncelikli İyileştirmeler)

#### 4. Web Tarayıcılarında MapLibre WebGL Uyumluluğu
- **Açıklama:** Proje birincil olarak mobil odaklıdır (React Native + Expo). Masaüstü tarayıcılarda (`pnpm run web`) MapLibre native modülü yerine canvas veya fallback katmanı gerekmektedir.
- **Risk:** Masaüstü web üzerinden harita incelenirken tarayıcının WebGL desteğine bağlı olarak harita kararması yaşanabilir.
- **Çözüm Planı:** Web ortamı için `maplibre-gl-js` köprüsü ile conditional render yapılması.

---

### 🟡 Medium (Orta Öncelikli İyileştirmeler)

#### 5. Çevrimdışı Harita Karo Önbelleği (Offline Tile Cache Sınırı)
- **Açıklama:** MapLibre vektör karoları SQLite tabanlı yerel önbellekte tutulmaktadır. Depolama alanı aşırı düşük (örn. <500MB boş yer kalan) cihazlarda otomatik temizleme (pruning) tetiklenebilir.
- **Çözüm Planı:** Harita ayarlarından "Önbelleği Temizle" seçeneği sunulması.

#### 6. Hareketi Azalt (Reduced Motion) Desteği
- **Açıklama:** Haritada kullanıcı konumuna giderken veya arama sonucunda pin merkezlenirken yapılan kamera animasyonları, sistem "Hareketi Azalt" seçeneği açık olan kullanıcılar için henüz kapatılmamaktadır.
- **Çözüm Planı:** `AccessibilityInfo.isReduceMotionEnabled` hook'u ile animasyon süresinin sıfıra indirilmesi.

---

### 🟢 Low (Düşük Öncelikli / Kozmetik)

#### 7. Haptik Titreşim Eksikliği
- **Açıklama:** Teyit, itiraz veya olay gönderme işlemlerinde kullanıcıya yalnızca görsel geri bildirim verilmektedir.
- **Çözüm Planı:** `expo-haptics` ile hafif titreşim geri bildirimi eklenmesi.

#### 8. İstatistik Grafikleri Yatay Döndürme
- **Açıklama:** Şehir istatistikleri dikey (portrait) modda optimize edilmiştir; cihaz yatay çevrildiğinde (landscape) çubuk grafikler sıkışabilmektedir.
- **Geçici Çözüm:** Mobil uygulamada ekran yönü dikey (portrait) olarak kilitlenmiştir.
