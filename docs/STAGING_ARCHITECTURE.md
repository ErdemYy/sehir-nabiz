# ŞehirNabız — Staging Mimari Spesifikasyonu (STAGING_ARCHITECTURE.md)

**Faz:** Phase 15 — Account Deletion Verification, Privacy Hardening & Staging Readiness  
**Tarih:** 28 Ekim 2026  
**Durum:** Staging Dağıtımına Hazır (Yerel/İzole Ortamda Doğrulandı)  

---

## 1. Mimari Genel Bakış

ŞehirNabız Staging ortamı, mobil uygulamanın ve backend servislerinin üretim öncesinde birebir ölçekte ve izole koşullarda test edilmesini sağlayan mikro-hizmet ve konteyner orkestrasyon modelidir.

```mermaid
flowchart TD
    subgraph Internet / İstemciler
        MobileClient["React Native + Expo Mobil İstemci"]
        WebClient["Web Tarayıcısı (Web Silme Portalı)"]
    end

    subgraph Staging Reverse Proxy Katmanı
        Nginx["Nginx 1.25 Alpine (TLS Terminasyon & Rate Limit)"]
    end

    subgraph Dahili Staging Ağı (sehir_nabiz_staging_network)
        NestApi["NestJS REST & WebSocket API (staging-api:3000)"]
        OutboxWorker["Outbox & Account Deletion Workers (Background Loops)"]
        Postgres["PostgreSQL 16 + PostGIS 3.4 (staging-postgres:5432)"]
        Redis["Redis 7 Alpine (staging-redis:6379)"]
        MinIO["MinIO S3 Nesne Deposu (staging-minio:9000)"]
    end

    MobileClient -->|HTTPS / WSS| Nginx
    WebClient -->|HTTPS| Nginx
    Nginx -->|HTTP Proxy| NestApi
    Nginx -->|WS Upgrade| NestApi
    NestApi <--> Postgres
    NestApi <--> Redis
    NestApi <--> MinIO
    OutboxWorker <--> Postgres
    OutboxWorker <--> Redis
    OutboxWorker <--> MinIO
```

---

## 2. Servis Envanteri ve Port Haritası

| Servis Adı | Konteyner İmajı | Dahili Port | Dışa Açık Port | Görevi / Rolü |
| :--- | :--- | :--- | :--- | :--- |
| **`staging-nginx`** | `nginx:1.25-alpine` | `80`, `443` | `80`, `443` | TLS terminasyonu, OWASP güvenlik başlıkları, rate limiting, body limitleri ve ters vekil. |
| **`staging-api`** | Multi-stage Dockerfile (`node:20-alpine`) | `3000` | *Kapalı* | NestJS REST API, WebSocket gateway, auth, moderation ve kentsel olay yönetimi. |
| **`staging-postgres`**| `postgis/postgis:16-3.4` | `5432` | *Kapalı* | Coğrafi kentsel olay veritabanı, spatial indeksler, outbox tablosu ve kullanıcı verileri. |
| **`staging-redis`** | `redis:7-alpine` | `6379` | *Kapalı* | WebSocket oda yönetimi, rate limiting state, önbellek ve outbox kilit yönetimi. |
| **`staging-minio`** | `elestio/minio@sha256...` | `9000`, `9001` | *Kapalı* (Yalnızca dahili) | S3 uyumlu olay fotoğrafları ve medya nesne deposu. |

> [!IMPORTANT]
> Veritabanı (`staging-postgres`), Redis (`staging-redis`) ve API doğrudan genel internete açılmaz. Yalnızca Nginx ters vekili üzerinden güvenli ve sınırlı portlar (80 ve 443) dinlenir.

---

## 3. Depolama ve Kalıcılık (Volume Persistence)

Veri kaybını önlemek için tüm durum bilgisi barındıran servisler yerel Docker volume'leri ile bağlanmıştır:
- `staging_postgres_data`: PostgreSQL veritabanı dosyaları (`/var/lib/postgresql/data`)
- `staging_redis_data`: Redis Append-Only File (AOF) günlükleri (`/data`)
- `staging_minio_data`: Olay fotoğrafları ve nesne deposu kütükleri (`/data`)
- `staging_nginx_logs`: Nginx erişim ve hata logları (`/var/log/nginx`)

---

## 4. Konteyner Yaşam Döngüsü ve Yeniden Başlatma Politikası

- **Restart Politikası:** Tüm kritik servisler için `restart: unless-stopped` tanımlanmıştır. Konteyner çökmesi durumunda Docker daemon servisi otomatik olarak ayağa kaldırır.
- **Sağlık Denetimleri (Healthchecks):**
  - PostgreSQL: `pg_isready -U <user> -d <db>` (5s aralık, 5 tekrar)
  - Redis: `redis-cli -a <pass> ping` (5s aralık, 5 tekrar)
  - MinIO: `curl -f http://localhost:9000/minio/health/live` (5s aralık, 5 tekrar)
  - API: `curl -f http://localhost:3000/health/ready` (10s aralık, 3 tekrar, 15s başlangıç payı)
- **Bağımlılık Zinciri:** API servisi, PostgreSQL, Redis ve MinIO konteynerleri `service_healthy` durumuna geçmeden başlatılmaz (`depends_on: condition: service_healthy`).
