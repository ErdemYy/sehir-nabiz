# ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)

**Tarih:** 25 Ekim 2026  
**Aşama:** Phase 2 — Backend Core, Docker, PostGIS ve Güvenli Kimlik Doğrulama  
**Durum:** **Başarıyla Tamamlandı**  
**Önceki Commit:** `7a7b0b6`

---

## 1. Oluşturulan Modüller ve Mimari Bileşenler

Phase 2 kapsamında `apps/api` ve `packages/shared` içerisinde aşağıdaki kurumsal modüller hayata geçirilmiştir:

- **`DatabaseModule` (`apps/api/src/database`):**
  - TypeORM DataSource yapılandırması ([data-source.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/data-source.ts)).
  - [UserEntity](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/entities/user.entity.ts) ve [RefreshTokenEntity](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/entities/refresh-token.entity.ts) veri modelleri.
  - İlk migration: [InitialAuthAndPostGis1740000000000.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/migrations/1740000000000-InitialAuthAndPostGis.ts).
- **`RedisModule` (`apps/api/src/modules/redis`):**
  - [RedisService](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/redis/redis.service.ts): ioredis tabanlı bağlantı ve **In-memory sliding window fallback** hız sınırlayıcı.
- **`AuthModule` (`apps/api/src/modules/auth`):**
  - [AuthService](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/auth.service.ts): bcrypt şifreleme, JWT token üretimi, rotasyonlu refresh token ve token reuse tespiti.
  - [AuthController](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/auth.controller.ts): REST uç noktaları.
  - [JwtAuthGuard](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/guards/jwt-auth.guard.ts) ve [AuthRateLimitGuard](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/guards/rate-limit.guard.ts).
  - [JwtStrategy](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/auth/strategies/jwt.strategy.ts).
- **Güvenlik ve Standart Ara Katmanları:**
  - [CorrelationIdMiddleware](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/common/middleware/correlation-id.middleware.ts): `X-Correlation-Id` istek takibi.
  - [ZodValidationPipe](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/common/pipes/zod-validation.pipe.ts): Zod şeması ile tip ve içerik denetimi.
  - [HealthController](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/health/health.controller.ts): Liveness (`/health`) ve Readiness (`/health/ready`).

---

## 2. Veritabanı Tabloları ve Şema Yapısı

İlk migration ([1740000000000-InitialAuthAndPostGis.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/migrations/1740000000000-InitialAuthAndPostGis.ts)) ile aşağıdaki tablolar tanımlanmıştır:

1. **`users` Tablosu:**
   - `id`: UUID (Primary Key, uuid_generate_v4)
   - `email`: VARCHAR(255) (Unique, B-Tree index)
   - `passwordHash`: VARCHAR(255) (Default select: false)
   - `displayName`: VARCHAR(100)
   - `role`: ENUM (`CITIZEN`, `TRUSTED_REPORTER`, `MUNICIPAL_OFFICER`, `MODERATOR`, `ADMIN`)
   - `accountStatus`: ENUM (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`)
   - `reputationScore`: INT (Default: 10)
   - `createdAt`, `updatedAt`: TIMESTAMPTZ
   - *Not:* Kullanıcıların kesin veya hassas konumları bu tabloda kesinlikle tutulmamaktadır.
2. **`refresh_tokens` Tablosu:**
   - `id`: UUID (Primary Key)
   - `userId`: UUID (Foreign Key -> users.id, ON DELETE CASCADE)
   - `tokenHash`: VARCHAR(64) (SHA-256 hash, B-Tree index)
   - `expiresAt`: TIMESTAMPTZ (7 gün geçerli)
   - `isRevoked`: BOOLEAN (Default: false)
   - `replacedByTokenHash`: VARCHAR(64) (Token Rotation zinciri takibi)
   - `createdAt`: TIMESTAMPTZ

---

## 3. PostGIS ve Docker Durumu

- **Docker Yapılandırması ([docker-compose.yml](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docker-compose.yml)):**
  - PostgreSQL 16 + PostGIS 3.4 (`postgis/postgis:16-3.4`).
  - Kalıcı `postgres_data` volume'u.
  - Güvenlik: Portlar yalnızca `127.0.0.1:5432` üzerinden localhost'a bağlanmıştır.
  - Healthcheck: `pg_isready -U postgres -d sehir_nabiz`.
- **Mevcut Çalışma Durumu:**
  - Sistemde `Docker version 29.6.2` ve `Docker Compose v5.3.1` kuruludur.
  - Ancak yerel Docker Desktop motoru (daemon) bu oturumda kapalı durumdadır (`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`).
  - Docker Compose sözdizimi `docker compose config` ile başarıyla doğrulanmıştır.
  - PostGIS uzantısı (`CREATE EXTENSION IF NOT EXISTS "postgis"`) ilk migration dosyasına eklenmiş olup, Phase 3'te olayların coğrafi koordinatları (`geometry(Point, 4326)`) için zemin hazırlanmıştır.

---

## 4. Redis Durumu ve Güvenlik Davranışı

- **Docker Yapılandırması:**
  - Redis 7 (`redis:7-alpine`) kalıcı `redis_data` volume'u ve AOF (`appendonly yes`) ile tanımlanmıştır.
  - Güvenlik: Yalnızca `127.0.0.1:6379` localhost bağlantısı ve parola koruması (`requirepass`).
- **Redis Arızasında Güvenlik Davranışı (Graceful Degradation):**
  - Kural: *"Redis kullanılamazsa güvenlik açısından kritik hız sınırlamalarının sessizce devre dışı kalmasına izin verme."*
  - [RedisService](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/redis/redis.service.ts), Redis'e bağlanamadığında veya bağlantı koptuğunda **hız sınırlamasını asla kapatmaz**.
  - Dahili **in-memory sliding window** algoritması devreye girerek IP ve kullanıcı bazında brute-force / DDoS korumasını kesintisiz sürdürür.

---

## 5. Kimlik Doğrulama Uç Noktaları (Auth Endpoints)

Tüm uç noktalar `/api/v1` global prefix'i altındadır:

| Metot | Uç Nokta | Açıklama | Güvenlik / Guard |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Yeni kullanıcı kaydı (Zod denetimi, bcrypt 12 salt) | `AuthRateLimitGuard`, `ZodValidationPipe` |
| `POST` | `/api/v1/auth/login` | E-posta ve şifre ile giriş, token üretimi | `AuthRateLimitGuard`, Generic error |
| `POST` | `/api/v1/auth/refresh` | Rotasyonlu yeni access ve refresh token üretimi | `ZodValidationPipe`, Reuse Detection |
| `POST` | `/api/v1/auth/logout` | Mevcut refresh token'ı iptal etme | `ZodValidationPipe` |
| `GET` | `/api/v1/auth/me` | Giriş yapmış kullanıcının profil bilgisi | `JwtAuthGuard` (Bearer Access Token) |
| `GET` | `/api/v1/health` | Liveness probe (Uptime ve servis bilgisi) | Herkese Açık |
| `GET` | `/api/v1/health/ready` | Readiness probe (DB ve Redis bağlantı kontrolü) | Herkese Açık |

---

## 6. Kullanılan Güvenlik Önlemleri

1. **Bcrypt Şifreleme:** Şifreler `saltRounds = 12` ile hashlenir; ham şifre bellekte tutulmaz.
2. **Kısa Ömürlü Access Token & Rotasyonlu Refresh Token:** Access token 15 dakika, refresh token 7 gün geçerlidir. Her yenilemede eski refresh token iptal edilip yenisi verilir.
3. **Token Reuse Detection (Çalınma Tespiti):** İptal edilmiş bir refresh token sunulursa, sistem bunu bir çalınma girişimi olarak işaretler ve **kullanıcının tüm aktif oturumlarını derhal sonlandırır** (`isRevoked = true`).
4. **Hassas Veri İzolasyonu:** `passwordHash` veritabanı sorgularında varsayılan olarak seçilmez (`select: false`). API yanıtlarında asla dışarı sızdırılmaz ([UserResponse](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/packages/shared/src/types/auth.types.ts)).
5. **Generic Hata Mesajları:** Giriş denemelerinde e-postanın var olup olmadığını ele vermemek için sabit `"Geçersiz e-posta veya şifre."` mesajı döndürülür.
6. **Hız Sınırı (Rate Limiting):** Kimlik doğrulama uç noktaları IP bazında dakikada 10 deneme ile sınırlandırılmıştır.
7. **Korelasyon Kimliği:** Her istek `x-correlation-id` ile etiketlenir; hata durumlarında loglarda takip edilirken iç hata ayrıntıları istemciye maskelenir.
8. **Mobil Cihaz Güvenliği:** Mobil istemcide Access Token yalnızca bellekte (Zustand), Refresh Token ise donanım şifreli `expo-secure-store` (Keychain/Keystore) içinde saklanacaktır; açık metin `AsyncStorage` yasaklanmıştır.

---

## 7. Test Sonuçları

- **Shared Paketi Testleri:** 4/4 test geçti (Zod auth şemaları, şifre kuralları, koordinat ve olay şemaları).
- **Backend API Birim Testleri (Vitest):**
  - `auth.service.spec.ts`: 10 test geçti (Kayıt, giriş, yanlış şifre, mükerrer e-posta, token rotasyonu, reuse detection, logout, public DTO).
  - `guards.spec.ts`: 5 test geçti (JwtAuthGuard, AuthRateLimitGuard limit içi ve limit aşımı 429).
  - `health.controller.spec.ts`: 3 test geçti (Health check ve readiness probe).
  - **Toplam Birim Testi:** 18 geçti, 0 hata (Çalışma süresi: 2.22s).

---

## 8. Çalıştırılamayan Testler ve Sebepleri

- **Test Dosyası:** [apps/api/test/auth.e2e-spec.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/test/auth.e2e-spec.ts)
- **Durum:** Atlandı (`1 skipped`).
- **Gerekçe:** Test makinesinde Docker daemon servisinin kapalı olması sebebiyle 127.0.0.1:5432 PostgreSQL portuna bağlanılamamıştır.
- **Dürüstlük İlkesi:** Sahte mock'larla test geçirilmemiş; test dosyası gerçek PostgreSQL açıldığında otomatik çalışacak port algılama mekanizması ile hazırlanmış ve raporlanmıştır.

---

## 9. Graphify Bilgi Grafı Metrikleri

Kod değişikliklerinin ardından `graphify update .` komutu çalıştırılmıştır:

- **Düğüm (Node) Sayısı:** 618 (+28 yeni düğüm)
- **Kenar (Edge) Sayısı:** 689 (+37 yeni kenar)
- **Topluluk (Community) Sayısı:** 45
- **Mimari İnceleme:** Döngüsel bağımlılık tespit edilmemiştir. `DatabaseModule`, `RedisModule` ve `AuthModule` gevşek bağlı (loosely coupled) ve tek sorumluluk prensibine (SRP) uygundur.

---

## 10. Git ve Faz Kapanışı

- **Phase 1 Commit Hash:** `7a7b0b6`
- **Phase 2 Commit:** Hazırlandı.
- **Çalışma Ağacı:** Doğrulamalar tamamlandı.

---

## 11. Teknik Borçlar

1. **Docker Daemon Aktivasyonu:** Docker Desktop çalıştırıldığında `docker compose up -d` komutu ile PostgreSQL/PostGIS ve Redis ayağa kaldırılmalıdır.
2. **Kullanıcı İtibar Algoritması:** Kullanıcı modeline `reputationScore: 10` eklenmiş; skorun teyitlerle dinamik artıp azalması Phase 8'e bırakılmıştır.

---

## 12. Phase 3 İçin Öneriler

1. **Coğrafi Olay Modeli:** `DATA_MODELS.md`'de tanımlanan `events` ve `categories` tablolarının TypeORM entity ve PostGIS migration'larının yapılması.
2. **Uzamsal Sorgu API'leri:** Bounding Box (`ST_MakeEnvelope`) ve Yarıçap (`ST_DWithin`) ile olay listeleme uç noktalarının (`GET /events/nearby`, `GET /events/bbox`) geliştirilmesi.
3. **Mükerrer Olay Deduplication:** Yeni bildirim açılırken 150m dairede son 45 dakika kontrolünün PostGIS sorgusuyla entegre edilmesi.
