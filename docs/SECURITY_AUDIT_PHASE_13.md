# ŞehirNabız — Güvenlik Denetimi Raporu (SECURITY_AUDIT_PHASE_13.md)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 13 — Beta Release Preparation, Security Audit & Distribution Readiness  
**Kapsam:** NestJS 12 API, PostgreSQL 16 / PostGIS, Redis 7, MinIO/R2, Socket.IO, React Native Mobil İstemci  
**Denetim Seviyesi:** Kapsamlı Uygulama ve Altyapı Güvenlik Taraması  

---

## 1. Yönetici Özeti ve Güvenlik Seviyesi

ŞehirNabız mimarisi, kimlik doğrulama, coğrafi veri gizliliği, medya sanitizasyonu ve yetkilendirme katmanlarında savunma derinliği (Defense-in-Depth) prensibine göre denetlenmiştir. 

| Şiddet Seviyesi | Tespit Sayısı | Çözülen / Güçlendirilen | Kalan / Kabul Edilen Risk |
| :--- | :---: | :---: | :---: |
| 🔴 **CRITICAL** | 0 | 0 | 0 |
| 🟠 **HIGH** | 2 | 1 | 1 (Hesap Silme Uç Noktası Eksikliği - Mağaza Engeli) |
| 🟡 **MEDIUM** | 2 | 2 | 0 |
| 🟢 **LOW / INFO** | 3 | 3 | 0 |

---

## 2. 14 Temel Güvenlik Alanının Kapsamlı Denetimi

### 2.1 JWT Access / Refresh Token Güvenliği ve Rotasyonu
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:** 
  - Access token süresi kısa (15 dakika) tutulmuştur.
  - Refresh token rotasyonu uygulanır; her token yenilemede eski token silinir ve yenisi üretilir.
  - **Token Reuse Detection:** Eski/kullanılmış bir refresh token sunucuya gönderildiğinde, sistem potansiyel bir token hırsızlığı algılar (`Token Reuse Detected`) ve kullanıcının tüm aktif oturumlarını veritabanından anında geçersiz kılar (`revoked`).
  - Eşzamanlı istek yarış durumları (Race Condition) veritabanı düzeyinde CAS / mutex ile korunur.

### 2.2 Kullanıcı Çıkışında (Logout) Yerel Veri ve Oturum Temizliği
- **Durum:** 🟢 **GÜÇLENDİRİLDİ (Phase 13 İyileştirmesi)**
- **İnceleme:** 
  - `useAuthStore.logout()` fonksiyonu yalnızca SecureStore'dan refresh token'ı silmekle kalmaz; canlı WebSocket bağlantısını (`SocketService.disconnect()`) kapatarak oturum odasından ayrılır.
  - Cihaz diskindeki yönetilen yerel olay taslağı ve geçici fotoğraflar (`draftService.clearDraft()`) tamamen silinir. Ortak kullanılan cihazlarda veri sızıntısı engellenir.

### 2.3 Kimlik Doğrulama Hız Sınırlaması (Auth Rate Limiting)
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - `POST /api/v1/auth/login` ve `POST /api/v1/auth/register` uç noktaları Redis destekli `ThrottleGuard` ile korunmaktadır (60 saniyede azami 20 istek).
  - Parola deneme-yanılma (Brute Force) saldırılarına karşı `429 Too Many Requests` yanıtı dönülür.

### 2.4 Olay Bildirimi Kötüye Kullanım (Abuse) Sınırları
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - 150 metre yarıçapında aynı kategoride aktif olay bildirilmişse sistem `DuplicateWarning` üretir.
  - Mobil form gönderiminde çift tıklama kilidi (`submittingLock`) ile aynı olayın mükerrer gönderilmesi engellenir.
  - Başlık ve açıklama alanları Zod şemalarıyla katı uzunluk ve karakter kontrollerine tabi tutulur.

### 2.5 Fotoğraf Yükleme Yetkileri ve Depolama Güvenliği
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - İstemciler S3 depolama servisine doğrudan şifre veya kimlik bilgisiyle erişemez.
  - Yalnızca oturum açmış kullanıcılar için olay başına en fazla 3 adet, 15 dakika süreli `Presigned PUT URL` üretilir.
  - Dosya kotası (en fazla 3 görsel) veritabanında satır düzeyinde kilitleme (`SELECT ... FOR UPDATE`) ile eşzamanlı istek yarışlarına karşı korunur.

### 2.6 EXIF, GPS ve Görsel Meta Veri Sanitizasyonu
- **Durum:** 🟢 **GÜVENLİ (Sunucu Düzeyinde Deterministik Temizleme)**
- **İnceleme:**
  - Yüklenen dosyalar sunucu tarafında `Sharp` kütüphanesiyle piksel düzeyinde incelenir.
  - `.rotate().webp({ quality: 85 })` ile tüm EXIF, GPS koordinatları, kamera modeli ve cihaz seri numaraları kalıcı olarak silinir (`strip`).
  - `limitInputPixels: 268,435,456` kuralı ile piksel bombası (Decompression Bomb) saldırıları engellenir.
  - Orijinal ham dosya MinIO/R2 deposundan anında silinir; yalnızca temizlenmiş WebP dosyası saklanır.

### 2.7 Moderasyon Rol Kontrolleri ve Gizlilik Kalkanı
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - Moderasyon uç noktaları (`/api/v1/moderation/*`) `RolesGuard` ile korunmaktadır; yalnızca `MODERATOR` ve `ADMIN` rolleri erişebilir.
  - Yayında olmayan (`PENDING_REVIEW` veya `REJECTED`) olay detayları kamusal API'de `404 Not Found` döner; başkalarının incelemedeki olayları izlemesi engellenir.

### 2.8 WebSocket Oda Yetkilendirmesi
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - `RealtimeGateway.join_moderation` soket mesajı istemci JWT token'ını doğrular; rolü moderatör olmayan istemcilerin moderasyon odasına katılması `MODERATION_UNAUTHORIZED` ile reddedilir ve güvenlik uyarısı loglanır.

### 2.9 Push Token Sahipliği ve Gizliliği
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - Cihaz push tokenları (`device_push_tokens`) yalnızca oturumlu kullanıcının `userId`'si ile ilişkilendirilir.
  - Format denetimi (Expo push token regex) yapılır; geçersiz tokenlar veya `DeviceNotRegistered` yanıtı veren eski tokenlar veritabanından otomatik temizlenir.

### 2.10 Bildirim Tercihleri ve Konum Gizliliği
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - Konum gizliliği ilkesi gereği `nearbyEvents` (Yakınımdaki gelişmeler) tercihi varsayılan olarak **KAPALI** (`false`) gelir.
  - Kullanıcı açık onay vermedikçe çevresel bildirim üretilmez.

### 2.11 Transactional Outbox Worker Erişimi
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - Arka plan iş parçacığı (`OutboxProcessorService`), PostgreSQL `FOR UPDATE SKIP LOCKED` mekanizmasıyla çalışır.
  - Dağıtık ortamlarda aynı olayın birden fazla worker tarafından çift işlenmesi engellenir.
  - 5 başarısız denemeden sonra kayıt `FAILED` (Dead-letter) durumuna alınarak sonsuz döngü engellenir.

### 2.12 Hassas Log Temizliği (Log Sanitization)
- **Durum:** 🟢 **GÜVENLİ**
- **İnceleme:**
  - NestJS Logger ve Winston çıktıları parola, refresh token, Authorization başlığı veya kullanıcı ham koordinatlarını loglamaz.
  - Olay koordinatları sunucuda yalnızca PostGIS `geometry(Point, 4326)` olarak saklanır; kullanıcının hareket geçmişi asla tutulmaz.

### 2.13 Production CORS ve Origin Politikası
- **Durum:** 🟢 **GÜÇLENDİRİLDİ (Phase 13 İyileştirmesi)**
- **İnceleme:**
  - `env.validation.ts` dosyasına eklenen kural ile `NODE_ENV === 'production'` olduğunda `CORS_ORIGIN="*"` wildcard kullanımı **yasaklanmıştır**.
  - Üretim ortamında izinli alan adları virgülle ayrılarak açıkça belirtilmek zorundadır.

### 2.14 Bağımlılık Güvenlik Taraması (pnpm audit)
- **Durum:** 🟡 **ANALİZ EDİLDİ / GÜVENLİK RİSKİ BULUNMUYOR**
- **İnceleme:**
  - `node-forge <= 1.4.0` (Expo CLI build aracı bağımlılığı): Yalnızca geliştirme/derleme zamanında çalışır; runtime bundle'a dahil değildir.
  - `multer < 2.5.0`: Uygulamamızda medya yüklemeleri S3 presigned URL ile doğrudan istemciden nesne deposuna yapılır; API Express multer middleware'ini kullanmaz.
  - `zod`: API ve istemcide girdi boyutları DTO seviyesinde sınırlandırılmıştır (maksimum 100 karakter başlık, 8MB dosya).

---

## 3. Açık Güvenlik ve Mağaza Engelleri (Kalan Bulgular)

> [!WARNING]
> **Açık Engel 1: Kullanıcı Hesap ve Veri Silme Yeteneği (Right to Be Forgotten)**  
> **Şiddet:** 🟠 HIGH (Mağaza ve KVKK Açısından Blocker)  
> **Açıklama:** Kullanıcının hesabını doğrudan mobil uygulama içinden silebileceği bir API (`DELETE /users/me`) ve mobil arayüz akışı henüz geliştirilmemiştir. Apple App Store ve Google Play bu özellik olmadan canlı mağaza onayını reddetmektedir.
