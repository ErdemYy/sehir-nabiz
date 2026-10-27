# ŞehirNabız — Veri Yaşam Döngüsü, Saklama ve Silme Politikası (DATA_RETENTION_AND_DELETION.md)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 13 — Beta Release Preparation, Security Audit & Distribution Readiness  
**Yasal Dayanak:** 6698 Sayılı KVKK, Apple App Store Guideline 5.1.1(v), Google Play Data Safety  

---

## 1. Toplanan ve Saklanan Veri Envanteri

ŞehirNabız, veri minimizasyonu (data minimization) ilkesine sıkı sıkıya bağlıdır:

| Veri Kategorisi | Veri Alanları | Saklama Yeri | Saklama Amacı |
| :--- | :--- | :--- | :--- |
| **Hesap Kimliği** | `id` (UUID), `email`, `displayName`, `passwordHash` (Argon2/Bcrypt) | PostgreSQL `users` tablosu | Kimlik doğrulama ve kullanıcı profili. |
| **Kentsel İtibar** | `reputationScore`, `reputationLogs` | PostgreSQL `users` / `user_reputation_logs` | Spam önleme ve moderasyon hiyerarşisi. |
| **Olay Bildirimleri** | `title`, `description`, `category`, `location` (Point 4326), `severity`, `status` | PostgreSQL `events` tablosu | Şehir olaylarının haritada gösterilmesi. |
| **Olay Medyası** | Temizlenmiş WebP görselleri, `storageKey`, `checksum` | S3 / MinIO / R2 Deposu | Olayın topluluk tarafından teyit edilebilmesi. |
| **Topluluk Oyları** | `eventId`, `userId`, `type` (CONFIRM/DISPUTE), `reason` | PostgreSQL `event_feedbacks` | Doğrulama ve güvenilirlik puanlama. |
| **Push Tokenları** | `userId`, `token`, `platform` (ios/android) | PostgreSQL `device_push_tokens` | Kritik kentsel bildirimlerin iletimi. |
| **Yerel Taslak** | Form verisi ve geçici fotoğraf kopyası | Cihaz Yerel Depolaması (`AsyncStorage` / `FileSystem`) | Çevrimdışı bağlantı kaybında veri kaybını önleme. |

---

## 2. Hassas Veri Politikaları

### 2.1 Cihaz GPS Konumu Asla Saklanmaz
- **İlke:** Vatandaşların hareket rotası, gezinme geçmişi veya anlık cihaz koordinatları **kesinlikle sunucuya gönderilmez veya veritabanında saklanmaz.**
- **Kullanım:** Cihaz GPS'i yalnızca istemci tarafında harita kamerasını kullanıcının bulunduğu noktaya merkezlemek için kullanılır. Sunucuya yalnızca kullanıcının haritada bilinçli olarak seçip işaretlediği olay noktası iletilir.

### 2.2 Fotoğraf Meta Verisi (EXIF & GPS) Temizleme Mekanizması
- Yüklenen tüm fotoğraflar presigned URL sonrasında `completeUpload` aşamasında sunucu tarafında `Sharp` kütüphanesinden geçirilir.
- `.rotate().webp()` işlemiyle tüm EXIF meta verileri, kamera modeli, çekim tarihi ve gömülü GPS koordinatları kalıcı olarak silinir.
- Orijinal ham görsel nesne deposundan anında imha edilir.

### 2.3 Yerel Taslak Verilerinin Temizliği
- Olay başarıyla sunucuya kaydedildiğinde yerel taslak ve geçici fotoğraflar `draftService.clearDraft()` ile anında silinir.
- Kullanıcı profilinden çıkış yaptığında (`logout`), ortak cihaz güvenliği gereğince cihazdaki taslak kalıcı olarak temizlenir.

---

## 3. Veri Saklama ve Arşivleme Süreleri (Retention Periods)

1. **Aktif Olaylar:** Olay `RESOLVED` (Çözüldü) veya `REJECTED` (Reddedildi) olana kadar ana harita tablosunda tutulur.
2. **Kullanıcı Bildirimleri (`user_notifications`):** 90 gün sonra otomatik olarak süresi dolar (`expiresAt`) ve temizlenir.
3. **Transactional Outbox Kayıtları:** İşlenmiş (`PROCESSED`) outbox olayları 14 gün saklanır ve periyodik cron ile silinir.
4. **Geçersiz Push Tokenları:** Google veya Apple tarafından `DeviceNotRegistered` dönülen veya 180 gün kullanılmayan tokenlar silinir.

---

## 4. Kullanıcı Hesap ve Veri Silme Akışı (Account Deletion Lifecycle)

> [!NOTE]
> **Phase 14 ile Tamamlandı & Doğrulandı:**  
> Kullanıcı hesap silme sistemi Apple App Store Yönergesi 5.1.1(v), Google Play Data Safety ve 6698 Sayılı KVKK standartlarına tam uyumlu olarak uygulanmış ve 10 E2E / 6 mobil birim testiyle doğrulanmıştır. Mağaza yayını önündeki Blocker #4 başarıyla kaldırılmıştır.

### Uygulanan Silme Mimarisi:
1. **Talep ve Güvenli Onay (DELETE /api/v1/users/me):**
   - Mobil Ayarlar ekranındaki Tehlikeli Bölge (`settings.tsx`) üzerinden şifre doğrulaması ile talep iletilir.
   - Web kullanıcıları için `GET /account-deletion` HTML arayüzü ve `POST /api/v1/users/web-deletion-request` uç noktası hizmet verir.
2. **Kişisel Verilerin Anonimleştirilmesi (GDPR / KVKK Uyumlu):**
   - Kullanıcının `email` adresi `deleted_<timestamp>_<uuid>@deleted.sehirnabiz.local` olarak maskelenir; gerçek e-posta silinir.
   - `displayName` alanı `"Anonim Vatandaş"` olarak güncellenir.
   - `passwordHash` dizesi `"*DELETED*"` olarak ezilir; eski şifreyle giriş imkansız hale getirilir.
   - `reputationScore` sıfırlanır (`0`).
   - Tüm aktif `refresh_tokens` derhal `isRevoked: true` yapılarak oturumlar iptal edilir.
   - Aktif WebSocket bağlantıları `RealtimeGateway.disconnectUser()` ile derhal sonlandırılır.
   - `device_push_tokens`, `user_notifications` ve `user_notification_preferences` kayıtları veritabanından kalıcı olarak silinir.
3. **Kentsel Olay Bütünlüğü:**
   - Şehir güvenliği ve kamu yararı gereği, kullanıcının geçmişte bildirdiği kentsel olay kayıtları (yol çökmesi, su arızası, kaza vb.) haritadan silinmez; yazar kimliği `"Anonim Vatandaş"` olarak korunur.
4. **Medya Temizliği & Hata Toleransı:**
   - Onaylanmamış veya taslak fotoğraflar MinIO/S3'ten temizlenir. MinIO geçici olarak kapalı olsa dahi veritabanı tutarlılığı korunur, talep `FAILED` olarak işaretlenir ve `retryFailedDeletions` mekanizması ile azami 5 defa yeniden denenir.

---

## 5. Hukuki ve Yayın Öncesi Değerlendirme Gerektiren Konular

1. **Açık Rıza Metni ve Aydınlatma Metni:** Uygulama ilk açılışında KVKK / Gizlilik Politikası onay kutucuğu veya bilgilendirme ekranı konulmalıdır.
2. **Çerez / Takip Politikası:** Uygulamada herhangi bir üçüncü taraf reklam ağı veya pazarlama izleyicisi bulunmadığı mağaza veri güvenliği formunda ("No data collected for tracking") beyan edilmelidir.
3. **Belediye & Kamu Veri Paylaşımı Bildirimi:** İleriki fazlarda kentsel olay verilerinin belediyelerle paylaşılacağı gizlilik sözleşmesinde belirtilmelidir.
