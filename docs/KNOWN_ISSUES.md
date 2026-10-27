# ŞehirNabız — Bilinen Sorunlar ve Teknik Borç Envanteri (Known Issues)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 14 — Güvenli Hesap Silme, Veri Yaşam Döngüsü ve Release Blocker Düzeltmeleri  
**Son Durum:** Beta Öncesi Risk Değerlendirmesi (Hesap Silme Engeli Başarıyla Çözüldü)  

---

## 1. Öncelik ve Şiddet Sınıflandırması

Bu belge, ŞehirNabız projesinde mevcut bilinen sınırları, ertelenen maddeleri ve canlı mağaza (App Store / Play Store) öncesi çözülmesi gereken teknik borçları dürüst ve şeffaf bir şekilde listeler.

---

## 2. Sorun ve Eksiklik Envanteri

### 🔴 Kalan Blockerlar (Canlı Mağaza ve Açık Beta Öncesi Zorunlu)

#### 1. Fiziksel Cihaz Donanım Doğrulaması Yapılmadı
- **Açıklama:** Uygulama Expo Dev Client, Metro bundler ve simülatör/web ortamlarında test edilmiştir. Farklı ekran boyutlarına, GPU yongalarına (Adreno, Mali) ve RAM kısıtlarına sahip gerçek fiziksel Android ve iOS cihazlarında kapsamlı alan testleri henüz gerçekleştirilmemiştir.
- **Risk:** Eski donanımlı Android cihazlarda MapLibre GPU yükü altında FPS düşüşü veya batarya tüketimi yaşanabilir.
- **Çözüm Planı:** Faz 15 kapsamında fiziksel Android ve iOS cihazlarında termal ve bellek profillemesi (Android Studio Profiler / Xcode Instruments) yapılmalıdır.
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

### 🟢 Çözülen Blockerlar (Phase 14)

#### [ÇÖZÜLDÜ] Kullanıcı Hesap ve Kişisel Veri Silme Akışı (Right to Be Forgotten)
- **Açıklama:** Apple App Store Review Guideline 5.1.1(v) ve KVKK Madde 7 gereğince hesap oluşturulabilen her uygulamada doğrudan mobil uygulama içinden ve kamuya açık bir web URL'inden hesap silme seçeneği sunulmalıdır.
- **Durum:** **Phase 14 ile Tamamlandı.**
  - Backend: `DELETE /api/v1/users/me`, `POST /api/v1/users/web-deletion-request`, `GET /account-deletion` web sayfası, `POST /api/v1/users/cancel-deletion` ve `GET /api/v1/users/me/deletion-status` geliştirildi.
  - Veri Hijyeni: E-posta maskeleme (`deleted_<timestamp>_<uuid>@deleted.sehirnabiz.local`), parola hash ezme (`*DELETED*`), display name `"Anonim Vatandaş"`, oturum feshi, push token imhası ve MinIO medya temizliği uygulandı.
  - Mobil: Ayarlar ekranında Tehlikeli Bölge ve şifre doğrulamalı silme modalı entegre edildi.
  - Doğrulama: 10 E2E ve 6 mobil birim testi (%100 başarı) ile kapatıldı.

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
