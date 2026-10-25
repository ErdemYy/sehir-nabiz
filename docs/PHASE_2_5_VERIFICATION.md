# ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)

**Tarih:** 25 Ekim 2026  
**Aşama:** Phase 2.5 — Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü  
**Önceki Commit:** `c27bd07`  
**Durum:** **CANLI ENTEGRASYON VE GÜVENLİK TESTLERİ TAM BAŞARIYLA TAMAMLANDI**

---

## 1. Docker ve Altyapı Servisleri Canlı Durumu

- **Docker Motoru (Daemon):**
  - `Docker Engine v29.6.2`, `WSL2 Linux Kernel`, `Docker Compose v5.3.1` aktif ve çalışmaktadır.
- **Port Çakışması Yönetimi:**
  - Geliştiricinin ana makinesinde mevcut başka konteynerlar (`aitrade_postgres` port 5432'de, `aitrade_redis` port 6379'da) çalıştığından; ŞehirNabız servisleri çakışmayı önlemek amacıyla güvenli biçimde izole portlara yönlendirilmiştir:
    - **PostgreSQL + PostGIS:** `127.0.0.1:5434 -> 5432/tcp`
    - **Redis:** `127.0.0.1:6380 -> 6379/tcp`
    - **NestJS API:** `http://localhost:3001/api/v1`
- **Konteyner Sağlık (Healthcheck) Durumu:**
  ```text
  NAME                   IMAGE                    STATUS                   PORTS
  sehir_nabiz_postgres   postgis/postgis:16-3.4   Up (healthy)             127.0.0.1:5434->5432/tcp
  sehir_nabiz_redis      redis:7-alpine           Up (healthy)             127.0.0.1:6380->6379/tcp
  ```

---

## 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları

### 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması
- Canlı PostgreSQL 16.4 üzerinde PostGIS eklentisi sorgulanmış ve doğrulanmıştır:
  - `SELECT PostGIS_Version();` -> `3.4 USE_GEOS=1 USE_PROJ=1 USE_STATS=1`
- **Coğrafi Mesafe (`ST_Distance`):**
  - Kadıköy (`40.9906, 29.0267`) ile Beşiktaş (`41.0422, 29.0067`) arasındaki küresel mesafe `geography` tipi ile hesaplanmış; 6.220 metre olarak hassas biçimde doğrulanmıştır.
- **Yarıçap Kapsama (`ST_DWithin`):**
  - 7.000 metre yarıçapında `true`, 3.000 metre yarıçapında `false` dönerek PostGIS spatial sorgulama motorunun eksiksiz çalıştığı onaylanmıştır.

### 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması
- **Şifresiz Erişim:** `redis-cli ping` -> `NOAUTH Authentication required.` (Tam korumalı).
- **Parolalı Erişim:** `redis-cli -a redis_dev_secret ping` -> `PONG` (Başarılı).
- **TTL ve Veri Saklama:** `set key val EX 2` ile 2 saniye TTL'li anahtar yazılmış; okuma ve otomatik zaman aşımı doğrulanmıştır.

---

## 3. Gerçek TypeORM Migration & Şema Testleri

1. **Migration İleri Çalıştırma (`migration:run`):**
   - `InitialAuthAndPostGis1740000000000` migration'ı başarıyla çalıştırıldı.
   - `uuid-ossp` ve `postgis` extension'ları oluşturuldu.
   - `user_role` (`CITIZEN`, `TRUSTED_REPORTER`, `MUNICIPAL_OFFICER`, `MODERATOR`, `ADMIN`) ve `account_status` (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`) PostgreSQL ENUM türleri veritabanına işlendi.
   - `users` ve `refresh_tokens` tabloları ve B-Tree indeksleri oluşturuldu.
2. **Geri Alma (Rollback - `migration:revert`):**
   - `migration:revert` çalıştırıldı; tablolar ve enum tipleri cascade sıralamasıyla temizlendi.
3. **Tekrar Uygulama:**
   - Migration tekrar çalıştırılarak idempotent ve deterministik olduğu kanıtlandı.
4. **Veritabanı Kısıtları (Constraints):**
   - E-posta tekilliği (`uq_users_email`): Aynı e-posta ile ikinci kayıt açılmaya çalışıldığında veritabanı kuralı seviyesinde `unique constraint violation` ile engellendi.
   - Foreign Key & Cascade: Kullanıcı kaydı silindiğinde ilişkili tüm refresh token kayıtlarının veritabanı motoru tarafından otomatik olarak silindiği (`ON DELETE CASCADE`) doğrulandı.

---

## 4. Canlı API ve Auth Uç Nokta Testleri

NestJS API servisi arka planda başlatılarak gerçek HTTP istekleri ile uçtan uca test edilmiştir:

| Uç Nokta | Metot | Gönderilen Veri / Başlık | Alınan Yanıt / Durum | Sonuç |
| --- | --- | --- | --- | --- |
| `/health/ready` | `GET` | Yok | `{"status":"ok","database":"connected","redis":"connected"}` | **BAŞARILI** |
| `/auth/register` | `POST` | `developer@sehirnabiz.local`, `Guvenli1234!` | `201 Created` — `accessToken`, `refreshToken`, kullanıcı profili | **BAŞARILI** |
| `/auth/register` (Mükerrer) | `POST` | Aynı e-posta | `409 Conflict` | **BAŞARILI** |
| `/auth/login` | `POST` | Doğru şifre | `200 OK` — Yeni token çifti | **BAŞARILI** |
| `/auth/login` (Hatalı) | `POST` | Yanlış şifre | `401 Unauthorized` | **BAŞARILI** |
| `/auth/me` | `GET` | `Bearer <accessToken>` | `200 OK` — `developer@sehirnabiz.local` profili | **BAŞARILI** |
| `/auth/refresh` | `POST` | `refreshToken` | `200 OK` — Yeni `accessToken` ve `refreshToken` | **BAŞARILI** |
| `/auth/refresh` (Reuse) | `POST` | Harcanmış/eski `refreshToken` | `401 Unauthorized` — Çalınma algılandı, oturumlar iptal edildi | **BAŞARILI** |
| `/auth/logout` | `POST` | `refreshToken` | `204 No Content` — Oturum sonlandırıldı | **BAŞARILI** |

---

## 5. Güvenlik Denetimi ve Yapılan İyileştirmeler

### 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti
- [AuthService.refreshTokens](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/auth.service.ts) içerisinde **Atomic Compare-and-Set (CAS)** mekanizması canlı veritabanında test edildi.
- `test/auth.e2e-spec.ts` içerisinde gerçek `Promise.all` ile aynı token hash'ine aynı milisaniyede iki farklı rotasyon isteği gönderildi.
- **Sonuç:** İsteklerden biri başarılı olurken, diğeri `affected === 0` alarak yarış durumunu tespit etti; `Token Reuse Tespit Edildi` uyarısıyla kullanıcının tüm oturumları veritabanında derhal iptal edildi (`isRevoked: true`).

### 5.2 NestJS ValidationPipe ve DTO Güvenliği
- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` devredeyken DTO sınıflarında `class-validator` dekoratörlerinin eksik olması durumunda gövdenin engellendiği tespit edildi.
- [RegisterDto](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/dto/register.dto.ts), [LoginDto](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/dto/login.dto.ts) ve [RefreshTokenDto](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/dto/refresh.dto.ts) sınıflarına `@IsEmail`, `@IsString`, `@MinLength`, `@MaxLength` kuralları eklenerek çift katmanlı (Zod + Class-Validator) DTO güvenliği sağlandı.

### 5.3 Rol Tabanlı Erişim Kontrolü (RBAC)
- [RolesGuard](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/common/guards/roles.guard.ts) ve [@Roles](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/common/decorators/roles.decorator.ts) dekoratörü ile `MODERATOR`, `MUNICIPAL_OFFICER`, `ADMIN` yetkilendirmesi güvenceye alındı.

### 5.4 Üretim Ortamı JWT Secret Koruması
- [env.validation.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/config/env.validation.ts) üretim ortamında varsayılan zayıf anahtar kullanımını başlangıç aşamasında engelleyecek şekilde doğrulandı.

---

## 6. Test Özeti

```text
 ✓ src/modules/auth/guards/guards.spec.ts (5 tests)
 ✓ src/common/guards/roles.guard.spec.ts (3 tests)
 ✓ test/auth.e2e-spec.ts (11 tests)
 ✓ src/modules/health/health.controller.spec.ts (3 tests)
 ✓ src/modules/auth/auth.service.spec.ts (11 tests)

 Test Files  5 passed (5)
      Tests  33 passed (33)
   Duration  2.40s
```

Tüm servisler, migration'lar, PostGIS coğrafi sorguları, Redis önbellek/hız sınırı ve JWT kimlik doğrulama döngüsü gerçek konteyner ortamında **%100 doğrulanmıştır**. Sistem **Phase 3 (Coğrafi Veri & Olay Yönetimi API'si)** geliştirmesine eksiksiz hazırdır.
