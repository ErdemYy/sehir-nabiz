# ŞehirNabız — Staging Dağıtım Kılavuzu (STAGING_DEPLOYMENT_GUIDE.md)

**Faz:** Phase 15 — Account Deletion Verification, Privacy Hardening & Staging Readiness  
**Tarih:** 28 Ekim 2026  
**Hedef:** Staging Sunucusu Kurulum ve İşletim Rehberi  

---

## 1. Ön Gereksinimler

Staging sunucusunda (Ubuntu 22.04 / Debian 12 / RHEL 9 önerilir) aşağıdaki bileşenlerin kurulu olması gerekir:
- Docker Engine 24.0+
- Docker Compose v2.20+
- `git` ve `curl`
- En az 2 CPU çekirdeği, 4 GB RAM ve 30 GB SSD disk alanı

---

## 2. Dağıtım Adımları

### Adım 1: Projeyi Klonlama ve Çalışma Dizinine Geçiş
```bash
git clone https://github.com/sehirnabiz/sehir-nabiz.git /opt/sehir-nabiz-staging
cd /opt/sehir-nabiz-staging
```

### Adım 2: Çevresel Değişkenleri Yapılandırma
```bash
cp .env.staging.example .env.staging
chmod 600 .env.staging
nano .env.staging
```
> [!CAUTION]
> `.env.staging` içerisindeki tüm `CHANGE_ME_...` yer tutucularını güçlü ve rastgele üretilmiş parolalarla değiştiriniz (örn: `openssl rand -hex 32`).

### Adım 3: Altyapı Servislerini Ayağa Kaldırma
```bash
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d staging-postgres staging-redis staging-minio
```
Servislerin sağlık durumunu kontrol edin:
```bash
docker compose -f docker-compose.staging.yml ps
```

### Adım 4: Veritabanı Migration'larını Çalıştırma
```bash
./scripts/staging-db-migrate.sh .env.staging
```

### Adım 5: API ve Nginx Ters Vekilini Başlatma
```bash
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d staging-api staging-nginx
```

---

## 3. Sağlık Denetimi ve Teşhis

Servislerin hazır ve sağlıklı çalıştığını doğrulamak için:
```bash
# 1. Genel API sağlığı
curl -i http://localhost/health

# 2. Veritabanı, Redis ve Depolama hazırlık denetimi
curl -i http://localhost/health/ready

# 3. Operasyonel metrikler ve kuyruk durumları (Yalnızca yerel IP)
curl -i http://localhost/health/diagnostics
```

---

## 4. Yedekleme ve Geri Yükleme Prosedürü

### Otomatik / Manuel Yedekleme:
```bash
export DB_PASSWORD="<staging_db_password>"
./scripts/staging-db-backup.sh
```
Yedek dosyası `./backups/staging/sehir_nabiz_staging_YYYYMMDD_HHMMSS.sql.gz` olarak arşivlenir.

### Geri Yükleme (Disaster Recovery):
```bash
./scripts/staging-db-restore.sh ./backups/staging/sehir_nabiz_staging_20261028_100000.sql.gz
```

---

## 5. Geri Alma (Rollback) Stratejisi

Eğer yeni bir staging sürümünde kritik bir hata meydana gelirse:
```bash
# 1. Önceki kararlı commit'e dön
git checkout <PREVIOUS_STABLE_COMMIT>

# 2. API konteynerini yeniden derle ve başlat
docker compose -f docker-compose.staging.yml build staging-api
docker compose -f docker-compose.staging.yml up -d staging-api

# 3. Gerekirse son veritabanı migration'ını geri al
pnpm --filter sehir-nabiz-api run migration:revert
```
