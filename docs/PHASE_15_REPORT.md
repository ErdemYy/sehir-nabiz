# ŞehirNabız — Phase 15 Kapanış Raporu (PHASE_15_REPORT.md)

**Rapor Tarihi:** 28 Ekim 2026  
**Faz:** Phase 15 — Account Deletion Verification, Privacy Hardening & Staging Readiness  
**Önceki Raporlanan Commit:** `2936cb2` (Phase 14 Kapanış) / Düzeltme Commiti: `ffc4e67`  
**Mevcut Çalışma Durumu:** Tamamlandı (%100 Başarı)  

---

## 1. Gerçek Commit ve Test Sayısı (Phase 14 Tutarsızlığının Çözümü)

Phase 14 kapanış raporunda yer alan `329/329` ve `330/330` test sayıları arasındaki tutarsızlık ile sonradan eklenen commit başlığı detaylı olarak incelenmiş ve doğrulanmıştır:

- **İlk Kapanış Commiti (`2936cb2`):**
  - Raporlanan test sayısı: 329 test (199 API + 111 Mobil + 11 Tokens + 8 Shared).
- **Takip Eden Düzeltme Commiti (`ffc4e67`):**
  - Başlık: `fix(test): add real minio physical deletion test and fix test count to 330`
  - Bu commit ile `apps/api/test/phase_14_account_deletion.e2e-spec.ts` dosyasına gerçek MinIO S3 API nesne silme doğrulaması eklenmiş, API test sayısı 199'dan 200'e çıkarılmış ve toplam 330/330 olmuştur.
- **Phase 15 İtibarıyla Gerçek Monorepo Test Sayısı:**
  - `sehir-nabiz-api`: **218 / 218 geçti** (28 test dosyası — 18 unit/service testi, 10 gerçek PostgreSQL/MinIO E2E entegrasyon testi)
  - `sehir-nabiz-mobile`: **116 / 116 geçti** (12 test süiti — Vitest/Jest mobil testleri)
  - `@sehir-nabiz/design-tokens`: **11 / 11 geçti** (1 test dosyası)
  - `@sehir-nabiz/shared`: **8 / 8 geçti** (1 test dosyası)
  - **Monorepo Genel Toplamı: 353 / 353 test (%100 Yeşil, Sıfır Regresyon)**

---

## 2. Hesap Silme Güvenliği ve Durum Makinesi

`AccountDeletionService`, `UsersController`, `JwtAuthGuard` ve `JwtStrategy` katmanları 11 kritik güvenlik senaryosuna göre incelenmiş ve sertleştirilmiştir:

1. **`PENDING_DELETION` Durum İzolasyonu:**
   - Önceden `JwtStrategy` içinde `PENDING_DELETION` statüsündeki tüm kullanıcılara doğrudan `UnauthorizedException` fırlatılıyordu. Bu durum, kullanıcının yasal ve meşru hakkı olan "Silme durumunu sorgulama" (`GET /users/me/deletion-status`) ve "Silme talebini iptal etme" (`POST /users/me/cancel-deletion`) uç noktalarına JWT ile erişmesini imkânsız hale getiriyordu.
   - Çözüm: `@AllowPendingDeletion()` metadata dekoratörü (`apps/api/src/common/decorators/allow-pending-deletion.decorator.ts`) geliştirildi. `JwtStrategy` kullanıcının durumunu JWT payload'ına eklerken, `JwtAuthGuard` bu dekoratörü kontrol eder. Dekoratör bulunmayan hiçbir standart iş endpoint'ine (olay oluşturma, profil güncelleme, teyit verme vb.) `PENDING_DELETION` kullanıcısı erişemez (401 Unauthorized döner).
2. **Çift Silme İsteği / Eşzamanlı Yarış Durumu (Race Condition):**
   - Kullanıcı zaten `PENDING_DELETION` veya `DELETED` statüsündeyse yeni silme talebi `ConflictException` (409) ile reddedilir.
3. **Şifre Doğrulama Zorunluluğu:**
   - Silme talebinde `password` alanı `bcrypt.compare` ile doğrulanır. Hatalı şifrede işlem kesinlikle reddedilir (`401 Unauthorized`).
4. **Çoklu Cihaz Oturumu:**
   - Silme talebi başlatıldığında (veya anında silme yapıldığında) `RefreshTokenEntity` tablosundaki tüm aktif oturumlar anında `revokedAt = NOW()` yapılarak geçersiz kılınır.

---

## 3. Silme İptal Akışı (Secure Cancellation)

- Kullanıcı isteğe bağlı 14 günlük soğuma süresi seçtiğinde hesap `AccountStatus.PENDING_DELETION` durumuna geçer ve `account_deletion_requests` tablosuna `PENDING` statüsünde kayıt düşülür.
- Kullanıcı bu 14 günlük süre içinde `POST /api/v1/users/me/cancel-deletion` çağırdığında:
  - `@AllowPendingDeletion()` kalkanı sayesinde geçerli JWT token'ı doğrulanır.
  - Kullanıcının şifresi `cancelDto.password` ile tekrar teyit edilir.
  - Varsa aktif `PENDING` silme kaydı `CANCELLED` olarak güncellenir.
  - Kullanıcı statüsü `AccountStatus.ACTIVE` durumuna geri döndürülür.
  - Kullanıcıya yeni refresh token verilir ve normal sistem işleyişine kesintisiz devam eder.
- Bu akış canlı veritabanında `phase_15_account_deletion_verification.e2e-spec.ts` süiti altında otomatik testlerle teyit edilmiştir.

---

## 4. 14 Günlük Bekleme Politikası ve Arka Plan Worker'ı

- **Politika İlkesi:** 14 günlük bekleme evrensel yasal bir zorunluluk değil, kullanıcının kaza eseri veri kaybını önleyen **isteğe bağlı bir ürün soğuma süresidir**. Kullanıcı dilerse `immediate: true` seçeneğiyle hesabını anında kalıcı olarak silebilir.
- **Otomatik Arka Plan İşleme (`AccountDeletionProcessorService`):**
  - Her 10 dakikada bir çalışan `@Cron('*/10 * * * *')` worker'ı eklendi.
  - Süresi dolan (`scheduledFor <= NOW()` ve `status = PENDING`) talepleri sorgular.
  - Durumu `PROCESSING` yapar ve `AccountDeletionService.executeDeletion` metodunu çağırarak verileri fiziksel olarak temizler ve anonimleştirir.
  - İşlem başarılı olunca durumu `COMPLETED` yapar.
- **Hata Toleransı ve Dead-Letter Alarmı (FAILED İşleme):**
  - Beklenmeyen bir ağ veya depolama kesintisinde durum `FAILED` olur, `errorMessage` ve `failureCount` güncellenir.
  - Worker bir sonraki döngüde `FAILED` ve `failureCount < 5` olan kayıtları otomatik olarak yeniden dener.
  - 5 başarısız denemeye ulaşan kayıtlar için operasyonel Dead-Letter uyarısı (`CRITICAL ALERT`) üretilir; kayıt asla sonsuz döngüde kalmaz.

---

## 5. Kamuya Açık Olayların Gizliliği ve Anonimleştirme

Sadece `displayName = "Anonim Vatandaş"` yapmanın tam anonimleştirme sağlamadığı gerçeğiyle, kişisel veriden arındırma kuralları sertleştirilmiştir:

- **Doğrulanmış ve Kamusal Değer Taşıyan Olaylar (`ACTIVE`, `RESOLVED`):**
  - Topluluğun bildiği ve doğruladığı kentsel sorunlar (ör. ana arter su patlağı, kaza, yol çökmesi) silinmez; kentsel veri bütünlüğü korunur.
  - Yazar ilişkisi koparılır (`authorId` maskelenir/anonim kullanıcıya bağlanır), yazar adı `"Anonim Vatandaş"` yapılır.
- **Onaylanmamış / İncelemedeki / Reddedilmiş Olaylar (`PENDING_REVIEW`, `REJECTED`):**
  - Bu olaylar henüz kamuya mal olmamıştır ve kullanıcının kişisel bağlamını (evinin önü, özel açıklama, kişisel detaylar) içerebilir.
  - `account-deletion.service.ts` içinde:
    - Olay başlığı `"Kişisel Veriden Arındırılmış Bildirim"` olarak değiştirilir.
    - Olay açıklaması `"[Bu bildirim, yazarının hesap silme talebi doğrultusunda kişisel verilerden arındırılmıştır.]"` olarak maskelenir.
    - Varsa ilişkili taslak görseller MinIO'dan fiziksel olarak silinir.
- **Kullanıcıya Şeffaflık:**
  - Ayarlar ekranında ve SSR Web formunda, kamuya mal olmuş onaylı bildirimlerin şehir hafızası için anonim olarak korunacağı açıkça belirtilmekte; yanıltıcı "her şey tek tıkla dünyadan silindi" vaadi verilmemektedir.

---

## 6. MinIO Fiziksel Temizlik Entegrasyon Testi

Mevcut MinIO nesne deposu üzerinde gerçek S3 API komutlarıyla (`PutObjectCommand`, `HeadObjectCommand`, `DeleteObjectCommand`) uçtan uca fiziksel temizlik doğrulaması gerçekleştirilmiştir:

1. Test kullanıcısı oluşturuldu.
2. MinIO üzerinde orijinal görsel (`events/test-uuid/original.jpg`) ve optimize WebP görseli (`events/test-uuid/fullhd.webp`) oluşturuldu.
3. `storageService.headObject` ile nesnelerin varlığı doğrulandı (HTTP 200).
4. Hesap silme akışı çalıştırıldı.
5. Silme worker'ı sonrasında her iki nesnenin de MinIO bucket'ından fiziksel olarak yok edildiği (`NotFound` / `NoSuchKey`) canlı API çağrısıyla teyit edildi.
6. Hata simülasyonunda (MinIO kesintisi) silme talebinin `FAILED` durumuna güvenle geçtiği ve veritabanı tutarlılığının bozulmadığı kanıtlandı.

---

## 7. Transactional Outbox ve Hesap Silme İzolasyonu

Hesap silindiğinde outbox ve bildirim hatlarında şu güvenlik kalkanları devreye alınmıştır:

- **Bekleyen Outbox Görevlerinin İptali:**
  - Silinen kullanıcıya ait bekleyen (`PENDING`) outbox etkinlikleri, `UPDATE outbox_events SET status = 'FAILED' WHERE "payload"->>'userId' = :userId` atomik sorgusuyla iptal edilir.
  - Böylece silinmiş bir kullanıcıya arka planda gecikmeli push bildirimi veya e-posta gönderilmesi engellenir.
- **Push Token & Bildirim Temizliği:**
  - `device_push_tokens` tablosundaki kullanıcının tüm cihaz tokenları fiziksel olarak silinir.
  - `user_notifications` ve `user_notification_preferences` kayıtları temizlenir.
- **WebSocket İzolasyonu:**
  - `realtimeGateway.revokeUserSockets(userId)` çağrısıyla kullanıcının açık olan tüm canlı soket bağlantıları sonlandırılır.
- **Yeniden Oluşmama Garantisi:**
  - Tüketici servisler `idempotency_key` ve `accountStatus` kontrolleriyle silinmiş kullanıcıya bildirim üretemez.

---

## 8. Staging Mimari Hazırlığı ve DevOps Varlıkları

ŞehirNabız'ın gelecekte kurulacak staging ortamında tek komutla ayağa kaldırılabilmesi için gerekli tüm altyapı kodlanmıştır:

- **`docker-compose.staging.yml`:**
  - İzole Docker ağı (`sehirnabiz-staging-net`).
  - PostgreSQL 16 + PostGIS 3.4 (`staging-db`), Redis 7 Alpine (`staging-redis`), MinIO S3 (`staging-minio`), NestJS API (`staging-api`) ve Nginx TLS Reverse Proxy (`staging-proxy`).
  - Tüm servisler için `healthcheck`, `restart: unless-stopped`, resource limits (CPU/Memory) ve log rotation yapılandırıldı.
- **`.env.staging.example`:**
  - Staging'e özel ortam değişkeni şablonu (hiçbir gerçek secret içermez).
- **Otomasyon Scriptleri (`scripts/`):**
  - `scripts/staging-db-migrate.sh`: Güvenli migration çalıştırma scripti.
  - `scripts/staging-db-backup.sh`: Zaman damgalı PostgreSQL yedekleme (`pg_dump` gzip).
  - `scripts/staging-db-restore.sh`: Geri yükleme doğrulama scripti.

---

## 9. HTTPS ve Ağ Güvenliği Hazırlığı

`docker/staging/nginx.conf` dosyası production-grade güvenlik standartlarıyla hazırlanmıştır:

- **TLS / HTTPS Sonlandırma:** Let's Encrypt / Certbot dizin entegrasyonu, modern şifreleme süitleri (TLSv1.2, TLSv1.3).
- **Güvenlik Başlıkları:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: "1; mode=block"`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000`.
- **Gövde Boyutu ve Dosya Güvenliği:** `client_max_body_size 10M;`.
- **Hız Sınırlaması (Rate Limiting):**
  - API genel: `zone=api_limit:10m rate=30r/s` (burst=20 nodelay).
  - Auth uç noktaları: `zone=auth_limit:10m rate=5r/s` (burst=10 nodelay).
- **WebSocket Reverse Proxy:** `/socket.io/` ve `/realtime` için `Upgrade` ve `Connection "Upgrade"` başlıkları.
- **Reverse Proxy Güvenliği:** `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`, NestJS tarafında `app.set('trust proxy', 1)`.

---

## 10. Staging Migration ve Yaşam Döngüsü Doğrulaması

`apps/api/test/staging_migration_lifecycle.spec.ts` süiti ile sıfır şemalı PostgreSQL veritabanında deterministik migration çalıştırma ve yaşam döngüsü doğrulanmıştır:

- Sıfırdan migration sırası:
  1. `1740000000000-InitialPostGisAndUsers`
  2. `1740000001000-CreateEventsAndCategories`
  3. `1740000002000-CreateEventMedia`
  4. `1740000003000-CreateEventFeedbackAndReputationLogs`
  5. `1740000004000-CreateNotificationsAndPushTokens`
  6. `1740000005000-CreateOutboxEvents`
  7. `1740000006000-CreateAccountDeletionRequests`
- Tüm tabloların, indekslerin ve PostGIS uzamsal eklentisinin eksiksiz kurulduğu; kullanıcı kaydı, olay oluşturma, moderasyon ve silme adımlarının hatasız tamamlandığı kanıtlanmıştır.

---

## 11. Operasyonel Görünürlük (Zero-PII Diagnostics)

Ağır ve karmaşık APM paketleri eklenmeden, yerel NestJS altyapısıyla hafif ve güvenli bir sistem teşhis uç noktası kurulmuştur:

- **`GET /api/v1/health/diagnostics`:**
  - Veritabanı bağlantısı ve yanıt süresi (`database.status`, `responseTimeMs`).
  - Redis ping durumu (`redis.status`).
  - MinIO S3 bucket erişilebilirliği (`storage.status` — `HeadBucketCommand`).
  - WebSocket bağlı istemci sayısı (`realtime.connectedClients`).
  - Transactional Outbox iş yükü (`outbox.pendingCount`, `outbox.failedCount`).
  - Hesap silme durumu (`accountDeletion.pendingCount`, `accountDeletion.failedCount`).
  - **Sıfır PII Garantisi:** Hiçbir kullanıcı adı, e-posta, koordinat veya IP bilgisi metrik etiketlerine veya yanıta dahil edilmez.

---

## 12. Mobil Hesap Silme UX Denetimi

`apps/mobile/app/profile/settings.tsx` üzerinde Urban Floating UI tasarım dili korunarak kullanıcı deneyimi iyileştirilmiştir:

- **Şeffaf Seçim:** Kullanıcıya 14 günlük isteğe bağlı bekleme süresi veya anında silme tercihi radyo butonları ile sunulur.
- **Anlaşılır Açıklama:** 14 günlük bekleme süresinin bir ceza veya zorunluluk değil, vazgeçme durumunda hesabı kurtarma imkânı veren bir ürün güvencesi olduğu belirtilir.
- **Veri Saklama Beyanı:** Kamu yararı taşıyan kentsel olayların yazarsızlaştırılarak "Anonim Vatandaş" adıyla şehir belleğinde korunacağı, kişisel taslakların ve oturumların ise tamamen imha edileceği açıkça açıklanır.
- **Şifre Onayı:** Yetkisiz silmeleri önlemek için şifre teyidi zorunludur.

---

## 13. Monorepo Test Sonuçları Özeti

Tüm paket testleri sıfır hata ile başarıyla tamamlanmıştır:

```text
Test Packages Summary:
-------------------------------------------------------------------------------------
Package                       Suites / Files      Tests Passed      Status
-------------------------------------------------------------------------------------
apps/api (Backend)            28 files            218 / 218         %100 PASS
apps/mobile (React Native)    12 suites           116 / 116         %100 PASS
packages/design-tokens        1 file               11 / 11          %100 PASS
packages/shared               1 file                8 / 8           %100 PASS
-------------------------------------------------------------------------------------
GENEL MONOREPO TOPLAMI:       42 test süiti       353 / 353         %100 PASS (0 fail)
```

TypeScript derleme ve lint denetimleri:
- `pnpm --filter @sehir-nabiz/api run typecheck` -> **BAŞARILI** (0 hata)
- `pnpm --filter sehir-nabiz-mobile run typecheck` -> **BAŞARILI** (0 hata)
- `pnpm --filter @sehir-nabiz/api run build` -> **BAŞARILI**

---

## 14. Graphify Bilgi Grafı Metrikleri

Projenin AST ve bağımlılık grafı `graphify update .` ile güncellenmiştir:
- **Düğümler (Nodes):** 2,950
- **İlişkiler (Edges):** 6,557
- **Topluluklar (Communities):** 164
- **God Nodes:** `AuthModule`, `EventsService`, `AccountDeletionService`, `RealtimeGateway`, `OutboxProcessorService`.

---

## 15. Açık Yayın Engelleri (Release Gate Durumu)

`docs/BETA_RELEASE_GATE.md` dosyasında takip edilen 13 maddelik kriterden kod, güvenlik, mimari, veri yaşam döngüsü ve hesap silme maddeleri %100 tamamlanmıştır. Kalan **3 harici engel**:

1. **Fiziksel Cihaz Testleri (Harici Engel):** Gerçek Android ve iOS cihazlarında GPS, kamera, arka plan push ve bellek testleri.
2. **Canlı Push Sertifikaları (Harici Engel):** FCM Service Account ve Apple APNs sertifikalarının canlı hesaplardan temini.
3. **Canlı Alan Adı & SSL (Harici Engel):** Canlı sunucu/domain tahsisi ve DNS SSL kurulumu.

Bu maddeler harici maliyet ve operasyon gerektirdiğinden yerel geliştirme kapsamında bilinçli olarak izole edilmiş ve staging hazırlığı eksiksiz tamamlanmıştır.

---

## 16. Phase 16 Önerileri

Phase 16'ya geçilmemiştir. Gelecekteki çalışma için önerilen başlıklar:
1. **Staging Sunucusu Dağıtımı:** Hazırlanan `docker-compose.staging.yml` ve Nginx konfigürasyonunun test sunucusuna kurularak ilk staging testlerinin icra edilmesi.
2. **Kapsamlı Yük ve Stres Testi (k6 / Artillery):** WebSocket odaları ve PostGIS BBox sorguları için 1.000 eşzamanlı sanal kullanıcı simülasyonu.
3. **FCM ve APNs Canlı Entegrasyon Provası:** Bildirim servislerinin canlı ortamda push gecikmesi ve teslimat oranlarının ölçülmesi.
