# ŞehirNabız — Canlı Dağıtım ve Operasyonel Çalıştırma Kılavuzu (PRODUCTION_DEPLOYMENT_GUIDE.md)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 13 — Beta Release Preparation, Security Audit & Distribution Readiness  
**Hedef Servisler:** NestJS 12 API, PostgreSQL 16 + PostGIS 3.4, Redis 7, MinIO / Cloudflare R2, Nginx Reverse Proxy  

---

## 1. Genel Bakış ve Mimari Bileşenler

ŞehirNabız backend ekosistemi, yüksek eşzamanlılık ve CBS (Coğrafi Bilgi Sistemleri) sorguları için mikroservis ve modüler monolit prensiplerine göre yapılandırılmıştır:

1. **NestJS API Servisi (`apps/api`):** REST API ve Socket.IO WebSocket ağ geçidi.
2. **PostgreSQL 16 & PostGIS 3.4:** Uzamsal veri tabloları, transactional outbox ve kullanıcı kimlikleri.
3. **Redis 7:** Socket.IO Pub/Sub küme adaptörü, hız sınırlama (rate limiting) ve istatistik önbelleği.
4. **Object Storage (Cloudflare R2 / MinIO):** Olay fotoğraflarının güvenli, presigned URL ve EXIF temizleme sonrası depolanması.
5. **Nginx / Caddy:** SSL/TLS sonlandırma, HTTP/2, WebSocket `Upgrade` başlıkları ve gzip/brotli sıkıştırması.

---

## 2. Üretim Ortamı Çevre Değişkenleri (.env.production)

Aşağıdaki çevre değişkenleri sunucuya yerleştirilmelidir. `validateEnvironment()` fonksiyonu üretim ortamında varsayılan veya zayıf değerleri tespit ettiğinde sunucu başlangıcını durdurur (`SecurityError`).

```env
# =============================================================================
# Temel Sunucu Yapılandırması
# =============================================================================
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1
CORS_ORIGIN=https://sehirnabiz.com,https://app.sehirnabiz.com

# =============================================================================
# PostgreSQL 16 + PostGIS 3.4
# =============================================================================
DB_HOST=postgres-cluster.internal
DB_PORT=5432
DB_USERNAME=sehir_prod_user
DB_PASSWORD=PROD_STRONG_PASSWORD_MIN_32_CHARS_!#$
DB_DATABASE=sehir_nabiz_prod
DB_LOGGING=false
DB_SYNCHRONIZE=false

# =============================================================================
# Redis 7
# =============================================================================
REDIS_HOST=redis-cluster.internal
REDIS_PORT=6379
REDIS_PASSWORD=REDIS_PROD_STRONG_AUTH_TOKEN_!#$

# =============================================================================
# JWT Kimlik Doğrulama (Minimum 48 Bayt Rastgele Hex / Base64)
# =============================================================================
JWT_ACCESS_SECRET=c8f5e1a4d9b2367104859aefbc231940562e87a1d34c9f1e0b57a2c6d8e4f1a2
JWT_REFRESH_SECRET=7b2c9a1d4e6f8035194a2b5c7d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# =============================================================================
# Hız Sınırlama (Rate Limiting)
# =============================================================================
THROTTLE_TTL=60
THROTTLE_LIMIT=60

# =============================================================================
# Medya ve Depolama (Cloudflare R2 veya Üretim MinIO)
# =============================================================================
STORAGE_PROVIDER=r2
STORAGE_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=R2_PRODUCTION_ACCESS_KEY_ID
STORAGE_SECRET_KEY=R2_PRODUCTION_SECRET_ACCESS_KEY
STORAGE_BUCKET=sehir-nabiz-media-prod
STORAGE_PUBLIC_URL=https://media.sehirnabiz.com
STORAGE_FORCE_PATH_STYLE=false
```

---

## 3. Örnek Üretim Docker Compose Yapılandırması (docker-compose.prod.yml)

```yaml
version: '3.8'

services:
  api:
    image: sehir-nabiz-api:latest
    restart: always
    env_file: .env.production
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2048M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health/ready"]
      interval: 10s
      timeout: 5s
      retries: 3

  postgres:
    image: postgis/postgis:16-3.4
    restart: always
    environment:
      POSTGRES_DB: sehir_nabiz_prod
      POSTGRES_USER: sehir_prod_user
      POSTGRES_PASSWORD: PROD_STRONG_PASSWORD_MIN_32_CHARS_!#$
    volumes:
      - pgdata_prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sehir_prod_user -d sehir_nabiz_prod"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: ["redis-server", "--requirepass", "REDIS_PROD_STRONG_AUTH_TOKEN_!#$", "--appendonly", "yes"]
    volumes:
      - redisdata_prod:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "REDIS_PROD_STRONG_AUTH_TOKEN_!#$", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  pgdata_prod:
  redisdata_prod:
```

---

## 4. Veritabanı Migration ve Güncelleme Prosedürü

Üretim ortamında `DB_SYNCHRONIZE=false` zorunludur. Tüm şema değişiklikleri geriye dönük (reversible) TypeORM migration'ları ile uygulanır:

```bash
# 1. Yeni sürüm deploy edilmeden önce migration çalıştır
pnpm.cmd --filter sehir-nabiz-api run typeorm migration:run

# 2. Hata durumunda son migration'ı geri al
pnpm.cmd --filter sehir-nabiz-api run typeorm migration:revert
```

---

## 5. Yedekleme ve Kurtarma Prosedürü (Backup & Restore)

### 5.1 PostgreSQL (PostGIS) Yedekleme
```bash
# Otomatik Günlük CBS Veritabanı Yedeği (Custom Binary Formatı)
pg_dump -h 127.0.0.1 -p 5432 -U sehir_prod_user -F c -b -v -f "/backups/sehir_nabiz_$(date +%Y%m%d_%H%M%S).dump" sehir_nabiz_prod

# Yedeği Geri Yükleme
pg_restore -h 127.0.0.1 -p 5432 -U sehir_prod_user -d sehir_nabiz_prod -v "/backups/sehir_nabiz_backup.dump"
```

### 5.2 Medya Depolama Senkronizasyonu (MinIO / S3)
```bash
# MinIO Client (mc) ile Nesne Deposu Aynalama
mc mirror --overwrite local-minio/sehir-nabiz-media-prod s3-backup/sehir-media-backup/
```

---

## 6. Hata ve Kesinti Toleransı (Resilience & Outage Behavior)

1. **Redis Kesintisi Durumu:**
   - Redis bağlantısı koptuğunda NestJS API çökmez; `RedisService` yerel in-memory hafıza önbelleğine ve hız sınırlayıcısına geçer.
   - `RedisIoAdapter` anında in-memory Socket.IO moduna düşer ve loglara `[RedisIoAdapter] In-memory fallback` yazar.
2. **MinIO / R2 Kesintisi Durumu:**
   - Depolama erişilemediğinde olay oluşturma akışı engellenmez; metin bildirimleri alınmaya devam eder, fotoğraf yükleme adımı kontrollü hata (`503 Service Unavailable`) döner.
3. **Outbox Processor Dead-Letter Takibi:**
   - 5 başarısız denemeden sonra olay `FAILED` durumuna çekilir.
   - İzleme sorgusu:
     ```sql
     SELECT id, event_type, retry_count, last_error_message, created_at 
     FROM transactional_outbox 
     WHERE status = 'FAILED' 
     ORDER BY updated_at DESC;
     ```

---

## 7. Nginx Ters Vekil (Reverse Proxy) Örnek Konfigürasyonu

```nginx
server {
    listen 443 ssl http2;
    server_name api.sehirnabiz.com;

    ssl_certificate /etc/letsencrypt/live/api.sehirnabiz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.sehirnabiz.com/privkey.pem;

    # REST API Uç Noktaları
    location /api/v1/ {
        proxy_pass http://127.0.0.1:3000/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Canlı WebSocket Soket Ağ Geçidi
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```
