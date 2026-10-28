#!/usr/bin/env bash
# ==============================================================================
# ŞehirNabız — Staging Veritabanı Yedekleme Betiği (staging-db-backup.sh)
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/staging}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sehir_nabiz_staging_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "================================================================="
echo "  ŞehirNabız Staging Yedekleme Başlatılıyor: $BACKUP_FILE"
echo "================================================================="

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5434}"
DB_USER="${DB_USERNAME:-postgres}"
DB_NAME="${DB_DATABASE:-sehir_nabiz_staging}"

export PGPASSWORD="${DB_PASSWORD:-postgres_secure_dev_password}"

echo "[1/2] PostgreSQL veritabanı dump alınıyor..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --clean | gzip > "$BACKUP_FILE"

echo "[2/2] Yedek dosyası doğrulanıyor..."
if [ -s "$BACKUP_FILE" ]; then
    FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Yedek başarıyla oluşturuldu: $BACKUP_FILE ($FILESIZE)"
else
    echo "HATA: Yedek dosyası oluşturulamadı veya boş!"
    exit 1
fi

echo "================================================================="
echo "  Yedekleme İşlemi Tamamlandı!"
echo "================================================================="
