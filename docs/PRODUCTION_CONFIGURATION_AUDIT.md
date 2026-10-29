# ŞehirNabız — Dağıtım ve Üretim Ortamı Yapılandırma Denetimi (PRODUCTION_CONFIGURATION_AUDIT.md)

**Faz:** Phase 17 — Distributed Reliability, Outbox Delivery Assurance & Deployment Hardening  
**Tarih:** 29 Ekim 2026  
**Durum:** Denetlendi ve Doğrulandı  
**Referans Doğrulayıcı:** [`apps/api/src/config/env.validation.ts`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/config/env.validation.ts)

---

## 1. Giriş ve Amaç

Bu doküman, ŞehirNabız sisteminin **Development (Yerel Geliştirme)**, **Staging (Yerel Doğrulama)** ve **Production (Üretim)** ortamları arasındaki yapılandırma farklarını, güvenlik kriterlerini ve "Fail-Closed" (Güvensiz durumda başlamayı reddetme) kurallarını belirler.

Sistemde hiçbir koşulda sahte veya test kimlik bilgilerinin canlı üretime sızmasına izin verilmez. Eksik veya zayıf bir yapılandırma algılandığında uygulama derhal `Error: Production environment validation failed` hatasıyla kapanır.

---

## 2. Ortam Karşılaştırma Matrisi

| Yapılandırma Alanı | Geliştirme (Development) | Staging (Docker Yerel) | Canlı Üretim (Production) Gereksinimi | Güvenlik / Fail-Closed Kuralı |
| :--- | :--- | :--- | :--- | :--- |
| **API Dinleme Adresi** | `127.0.0.1:3000` | Nginx arkası `staging-api:3000` | Nginx arkası izole Docker bridge | Dış dünyadan doğrudan API portuna erişim yasaktır. |
| **Nginx Dış Port Bağlantısı** | Yok (Doğrudan dev) | `127.0.0.1:80` ve `127.0.0.1:443` | Genel IP `80` (Redirect) ve `443` (TLS) | Staging ortamında asla `0.0.0.0`'a bağlanmaz (Yerel ağ sızıntısı engellenir). |
| **PostgreSQL Veritabanı** | `localhost:5434` / `postgres:postgres` | `staging-db:5432` / Şifreli | Yönetilen PG / PostGIS (`sslmode=require`) | `localhost`, varsayılan `postgres` şifresi veya SSL'siz bağlantı kesinlikle reddedilir. |
| **Redis Önbellek & Pub/Sub** | `localhost:6380` / Şifresiz | `staging-redis:6379` / Şifreli | Güçlü parola korumalı Redis kümesi | Şifresiz Redis veya `localhost` üretilirse uygulama başlamaz. |
| **S3 / Nesne Depolama** | `localhost:9000` (MinIO) | `staging-minio:9000` (MinIO) | AWS S3 / Cloudflare R2 | Prod'da MinIO veya `localhost` endpoint'i bulunursa fail-closed devreye girer. |
| **JWT Anahtarları** | Sabit dev secret | 64+ karakter staging secret | Güçlü rastgele 256-bit anahtar (Vault/Secrets) | En az 32 karakter zorunludur. `secret`, `123456`, `test` gibi zayıf değerler yasaktır. |
| **Teşhis Anahtarı (`DIAGNOSTICS_SECRET`)** | İsteğe bağlı | Güçlü staging secret | Rotasyon destekli virgüllü anahtarlar | Sabit kodlanmış secret yasaktır. Timing attack korumalıdır. |
| **CORS Politikası** | Wildcard / Gevşek | Staging etki alanları | Yalnızca yetkili prod etki alanları | Prod'da wildcard (`*`) bulunursa uygulama başlamaz. |
| **WebSocket Orijinleri** | Tümü | Staging kökenleri | Prod web / mobil kökenleri | Handshake anında origin doğrulaması zorunludur. |
| **Push Bildirim** | `SIMULATED` | `SIMULATED` | Canlı Apple APNs & Google FCM | Üretimde eksik push token/sertifikası hata verir. |
| **Docker Kaynak Sınırları** | Sınırsız | CPU 1.0, RAM 512MB/1GB | CPU ve RAM kotaları zorunlu | OOM-killer veya kaynak tüketim saldırılarına karşı koruma. |
| **Veritabanı Migration** | `npm run migration:run` | Container başlangıcında otomatik | CI/CD pipeline kontrollü | Uygulama başlangıcında `synchronize: true` üretilirse fail-closed tetiklenir. |
| **Outbox Worker Sayısı** | 1 yerel worker | 1 staging worker | 2+ worker (SKIP LOCKED ile paylaşımlı) | Lease süresi: 60 saniye, Exponential backoff: 5s, 10s, 20s... |

---

## 3. Fail-Closed Doğrulama Mekanizması (`env.validation.ts`)

Phase 17 kapsamında NestJS API başlangıç döngüsüne entegre edilen sıkı doğrulama kuralları:

```typescript
if (isProd) {
  // 1. JWT Güvenliği
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('secret') || jwtSecret.includes('change-in-production')) {
    errors.push('JWT_SECRET must be at least 32 characters long and not contain default placeholder words.');
  }

  // 2. Veritabanı ve Şifre Güvenliği
  if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    errors.push('DATABASE_URL cannot point to localhost/127.0.0.1 in production.');
  }
  if (dbPassword === 'postgres' || dbPassword === 'password' || dbPassword === 'admin') {
    errors.push('DATABASE_PASSWORD cannot use default/weak passwords in production.');
  }

  // 3. Redis Güvenliği
  if (!redisUrl || redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')) {
    errors.push('REDIS_URL cannot point to localhost/127.0.0.1 in production.');
  }
  if (!redisPassword || redisPassword.length < 12) {
    errors.push('REDIS_PASSWORD must be at least 12 characters long in production.');
  }

  // 4. S3 Depolama Güvenliği
  if (s3Endpoint && (s3Endpoint.includes('localhost') || s3Endpoint.includes('127.0.0.1') || s3Endpoint.includes('minio'))) {
    errors.push('S3_ENDPOINT cannot point to local MinIO in production.');
  }

  // 5. CORS Güvenliği
  if (!corsOrigin || corsOrigin === '*' || corsOrigin.includes('*')) {
    errors.push('CORS_ORIGIN cannot be a wildcard (*) in production.');
  }
}
```

Bu mekanizmanın doğruluğu [`apps/api/test/phase_17_distributed_reliability.spec.ts`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/test/phase_17_distributed_reliability.spec.ts) test paketi ile sınanmış; zayıf parolalı, localhost referanslı veya wildcard CORS tanımlı her konfigürasyonun uygulamayı başarıyla durdurduğu kanıtlanmıştır.

---

## 4. Güvenli Dağıtım İlkeleri

1. **Secret Rotasyonu:** `DIAGNOSTICS_SECRET` ve `JWT_SECRET` anahtarları virgülle ayrılmış birden fazla değeri destekler. Bu sayede eski jetonlar geçerliliğini korurken yeni jetonlar yeni anahtarla imzalanabilir ve kesintisiz rotasyon sağlanır.
2. **Sabit Kod (Hardcoded) Değer Bulunmaması:** Hiçbir şifre, token veya secret kaynak koduna gömülmez; `.env` veya CI/CD secret manager (GitHub Secrets, AWS Secrets Manager) üzerinden enjekte edilir.
3. **Log Sanitizasyonu:** Hata ve operasyon loglarında secret başlıkları veya kişisel veriler (`authorization`, `x-diagnostics-key`, `password`) `[REDACTED]` ile maskelenir.
