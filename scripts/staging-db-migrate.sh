#!/usr/bin/env bash
# ==============================================================================
# ŞehirNabız — Staging Veritabanı Migration Betiği (staging-db-migrate.sh)
# ==============================================================================
set -euo pipefail

echo "================================================================="
echo "  ŞehirNabız Staging Database Migration Başlatılıyor..."
echo "================================================================="

ENV_FILE="${1:-.env.staging}"

if [ ! -f "$ENV_FILE" ]; then
    echo "HATA: Staging ortam dosyası ($ENV_FILE) bulunamadı!"
    exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "[1/3] PostgreSQL bağlantısı test ediliyor ($DB_HOST:$DB_PORT)..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_DATABASE"; do
    echo "PostgreSQL hazır değil, 2 saniye bekleniyor..."
    sleep 2
done
echo "PostgreSQL bağlantısı başarılı."

echo "[2/3] Bekleyen TypeORM migration'ları uygulanıyor..."
pnpm --filter sehir-nabiz-api run migration:run

echo "[3/3] Migration durumu doğrulanıyor..."
pnpm --filter sehir-nabiz-api run migration:show

echo "================================================================="
echo "  Tüm Staging Veritabanı Migration'ları Başarıyla Tamamlandı!"
echo "================================================================="
