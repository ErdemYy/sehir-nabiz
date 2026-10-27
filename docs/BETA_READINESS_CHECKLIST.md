# ŞehirNabız — Beta Hazırlık Kontrol Listesi (Beta Readiness Checklist)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 13 — Beta Release Preparation, Security Audit & Distribution Readiness  
**Son Commit:** `c5db186` + Phase 13 Güncellemeleri  
**Toplam Test:** 311 / 311 (%100 Başarı)  
**Genel Durum:** 🟡 **Koşullu Beta Hazır (İç Simülatör / Sandbox Seviyesi)** — *Mağaza Dağıtımı Öncesinde 4 Kritik Blocker Bulunmaktadır.*

---

## 1. Yönetici Özeti ve Karar Matrisi

ŞehirNabız, Phase 0'dan Phase 13'e kadar 14 geliştirme fazı boyunca mimari, coğrafi bilgi sistemleri (GIS), gerçek zamanlı soket akışları, transactional outbox güvenilirliği, 15 mobil ekranlık Urban Floating UI deneyimi ve release konfigürasyonuyla inşa edilmiştir.

| Alan | Durum | Doğrulama Yöntemi | Notlar |
| :--- | :---: | :--- | :--- |
| **Backend & CBS Motoru** | 🟢 HAZIR | 189 Unit/E2E Testi (Vitest) | PostGIS 3.4, mesafe hesaplama, CBS indeksleri aktif. |
| **Transactional Outbox** | 🟢 HAZIR | PostgreSQL FOR UPDATE SKIP LOCKED | Bildirim kaybı sıfıra indirildi, outbox tablosu devrede. |
| **Tasarım Sistemi (Urban Floating UI)** | 🟢 HAZIR | 15 Ekran Denetimi + UI Showcase | 4px ızgara, 16–24px radius, dikey çakışmalar giderildi. |
| **Erişilebilirlik (a11y)** | 🟢 HAZIR | WCAG AA Kontrast & min 44x44 Touch Target | Screen reader etiketleri, token kontrastı ve hint'leri tamamlandı. |
| **Uçtan Uca Yolculuklar** | 🟢 HAZIR | 104 Mobil Test (Node Test Runner) | 6 kritik yolculuk (A–F) mantıksal simülasyonla doğrulandı. |
| **Veri & Konum Gizliliği** | 🟢 HAZIR | Sharp EXIF Temizleme & k-Anonymity | Cihaz GPS geçmişi tutulmaz, fotoğraflar sunucuda temizlenir. |
| **Android APK / AAB Üretimi** | 🔴 **BLOCKER** | Yerel Gradle / EAS Build Gerekli | İmzalı `.apk`/`.aab` derlemesi henüz başlatılmadı. |
| **Fiziksel Cihaz Testleri** | 🔴 **BLOCKER** | Gerçek iOS / Android Donanımı | Donanım ivmeli GPU testi simülatör dışında yapılmadı. |
| **Canlı Push Bildirim Teslimatı** | 🔴 **BLOCKER** | APNs / FCM Prod Credentials | Altyapı ve outbox hazır; ancak canlı sertifika bekleniyor. |
| **Hesap ve Veri Silme Akışı** | 🔴 **BLOCKER** | Store & KVKK Zorunluluğu | `DELETE /users/me` uç noktası ve onay modalı henüz eklenmedi. |

---

## 2. Kapsamlı Kontrol Maddeleri

### 2.1 Backend ve Veritabanı Güvenilirliği
- [x] **PostgreSQL 16 & PostGIS 3.4:** `ST_DWithin`, `ST_MakePoint`, `ST_DistanceSphere` CBS sorguları ve mekânsal GIST indeksleri devrede.
- [x] **Transactional Outbox:** Olay durumu değiştiğinde ve teyit verildiğinde bildirim kayıtları aynı veritabanı transaction'ında `transactional_outbox` tablosuna yazılır.
- [x] **Deduplication:** 150 metre yarıçapında aynı kategorideki mükerrer olay bildirimleri algılanır ve kullanıcı uyarılır.
- [x] **Yetkilendirme:** Rol tabanlı erişim kontrolü (CITIZEN, MODERATOR, ADMIN). Token yenileme yarış durumları kilit mekanizmasıyla engellenir.
- [x] **Rate Limiting & Güvenlik:** Arama uç noktasında 100 karakter sınırı, brute-force koruması ve Redis ioAdapter.

### 2.2 Mobil Deneyim & Urban Floating UI
- [x] **15 Ekran Eksiksizliği:** Harita, Akış, Bildir, Bildirimler, Profil, Olay Detayı, Olay Oluşturma Sihirbazı, Konum Seçici, Fotoğraf Seçici, Giriş/Kayıt, İstatistikler, Bildirdiğim Olaylar, Ayarlar, Moderasyon Paneli, UI Showcase.
- [x] **Dikey Çakışma Önleme:** Harita ekranında Üst Arama Çubuğu (`top + 12`), Kategori Çipleri (`top + 94`), Harita Aksiyon Butonları (`top + 152`), Bildirim Banner'ı (`top + 146`) ve Heatmap Hapı (`bottom + 76`) mesafeleri kusursuz ayrıştırıldı.
- [x] **Tema Desteği:** Urban Floating UI açık (#F6F8FB zemin, #FFFFFF kartlar) ve koyu (#0F172A zemin, #1E293B kartlar) modlarında renk kontrastı ve tipografi hiyerarşisi tam uyumludur.
- [x] **Dönme & Yeniden Boyutlanma:** Küçük ekranlar (iPhone SE, 375pt) ve geniş ekranlarda responsive flexbox düzeni.

### 2.3 Topluluk Teyit & Moderasyon Mekanizması
- [x] **Teyit / İtiraz / Çözüldü Mantığı:** Kullanıcılar olaylara `CONFIRM`, `DISPUTE`, `RESOLVED_REPORT` oyu verebilir; oylarını değiştirebilir veya geri çekebilir.
- [x] **Öz-Oylama Engeli:** Olayı açan kullanıcı kendi bildirimine teyit veya itiraz veremez (400 Bad Request).
- [x] **Moderatör Kuyruğu:** İtibar puanı düşük kullanıcıların bildirimleri `PENDING_REVIEW` durumunda kuyruğa düşer, haritada görünmez. Moderatör onaylarsa `ACTIVE`, reddederse gerekçeli `REJECTED` olur.

### 2.4 Gerçek Zamanlı İletişim & Senkronizasyon
- [x] **WebSocket (Socket.IO):** Harita hareket ettikçe BBox tabanlı odaya abone olunur.
- [x] **Monotonic Sürüm & Tekilleştirme:** Sırasız gelen eski sürümler yeni verinin üzerine yazılamaz; aynı `serverEventId` mükerrer işlenmez.
- [x] **Reconnection & REST Mutabakatı:** Bağlantı kesilip tekrar kurulduğunda REST API üzerinden snapshot reconciliation gerçekleştirilir.

### 2.5 Güvenlik, Gizlilik & KVKK
- [x] **Cihaz GPS Konumu:** Kullanıcının anlık gezinme konumu sunucuya gönderilmez veya saklanmaz. Yalnızca haritada işaretlenen olay noktası kaydedilir.
- [x] **Sunucu Tarafı EXIF Temizleme:** Kullanıcı tarafından yüklenen fotoğrafların kamera ve GPS meta verileri sunucuda Sharp WebP pipeline ile kalıcı olarak silinir.
- [x] **k-Anonymity Yoğunluk Haritası:** Isı haritasında tekil olay noktaları gizlenir, ızgara tabanlı mekânsal kümeleme uygulanır ve seyrek hücreler bastırılır.

---

## 3. Açık Blocker'lar ve Beta Koşulları

> [!WARNING]
> **Kritik Blocker'lar (Açık Beta ve Mağaza Dağıtımı Öncesi Zorunlu):**
> 1. **Hesap ve Kişisel Veri Silme Akışı (Store Policy):** Apple App Store Guideline 5.1.1(v) ve KVKK gereği kullanıcı doğrudan uygulama içinden hesabını silebilmelidir. Bu özellik Phase 14'te eklenmelidir.
> 2. **Bağımsız Release APK/AAB ve TestFlight Paketi:** Bağımsız imzalı mağaza derlemesi yerel Gradle veya EAS Build ile henüz alınmamıştır.
> 3. **Fiziksel Cihaz Donanım Doğrulaması:** MapLibre OpenGL/Metal harita motorunun eski donanımlı cihazlardaki termal ve bellek davranışı fiziksel ortamda test edilmelidir.
> 4. **Canlı APNs / FCM Sertifikaları:** Apple Developer ve Google Firebase Cloud Messaging canlı sertifikaları üretim sunucusuna tanımlanmalıdır.

---

## 4. Sonuç ve Önerilen Beta Süreci

ŞehirNabız, **kontrollü kapalı geliştirici ve simülatör betası** için tamamen hazırdır. 

Genel açık beta ve mağaza dağıtımı (Play Store / App Store) öncesinde yukarıda listelenen 4 blocker'ın çözülmesi gerekmektedir.
