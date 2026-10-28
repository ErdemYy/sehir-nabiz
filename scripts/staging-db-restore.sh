#!/usr/bin/env bash
# ==============================================================================
# ŞehirNabız — Staging Veritabanı Geri Yükleme Betiği (staging-db-restore.sh)
# ==============================================================================
set -euo pipefail

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "Kullanım: ./scripts/staging-db-restore.sh <yedek_dosyasi.sql.gz>"
    exit 1
fi

echo "================================================================="
echo "  DİKKAT: Staging Veritabanı Geri Yükleniyor: $BACKUP_FILE"
echo "================================================================="

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5434}"
DB_USER="${DB_USERNAME:-postgres}"
DB_NAME="${DB_DATABASE:-sehir_nabiz_staging}"

export PGPASSWORD="${DB_PASSWORD:-postgres_secure_dev_password}"

echo "[1/2] Arşiv açılıyor ve veritabanına aktarılıyor..."
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

echo "[2/2] Tablo sayıları kontrol ediliyor..."
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';")
echo "Geri yüklenen tablo sayısı: $TABLE_COUNT"

echo "================================================================="
echo "  Geri Yükleme İşlemi Başarıyla Tamamlandı!"
echo "================================================================="
