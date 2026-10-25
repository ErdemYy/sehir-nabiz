# ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)

Bu kılavuz, ŞehirNabız projesinde yerel geliştirme ortamının kurulması, Docker servislerinin başlatılması, veritabanı migration süreçleri, JWT secret yönetimi ve test süreçlerini detaylandırır.

---

## 1. Ortam Hazırlığı

Projeyi çalıştırmadan önce sisteminizde aşağıdaki araçların kurulu olduğunu doğrulayın:

- **Node.js:** `v24.x` (veya en az `v20.x`)
- **pnpm:** `v12.x` (veya en az `v9.x`)
- **Docker & Docker Compose:** PostgreSQL 16 + PostGIS ve Redis servisleri için
- **Git:** Sürüm kontrol sistemi
- **Graphify CLI:** Bilgi grafı motoru (`graphify 0.9.90`)

---

## 2. Docker Servislerinin Başlatılması

Veritabanı ve Redis servisleri Docker Compose ile yönetilir. Portlar güvenlik amacıyla yalnızca yerel makineye (`127.0.0.1`) bağlanmıştır.

```bash
# Servisleri arka planda başlatma
docker compose up -d

# Konteyner durumlarını ve healthcheck'leri inceleme
docker compose ps

# Servis loglarını takip etme
docker compose logs -f postgres
docker compose logs -f redis

# Servisleri durdurma
docker compose down
```

> [!NOTE]
> Docker Desktop kapalıysa veya çalışmıyorsa NestJS uygulaması veritabanı bağlantı güvenliği gereği başlamayacak (`fail-fast`), bu sayede sahte veya yarım veritabanı durumlarının önüne geçilecektir.

---

## 3. Güvenli Secret ve Ortam Değişkeni Yönetimi

### 3.1 Geliştirme Ortamı Dosyaları
```bash
# Backend için
cp apps/api/.env.example apps/api/.env

# Mobil uygulama için
cp apps/mobile/.env.example apps/mobile/.env
```

### 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı)
Üretim (production) ortamında varsayılan secret'lar asla kullanılmamalıdır. Terminal üzerinden aşağıdaki komutlarla kriptografik olarak güvenli 64 baytlık rastgele anahtarlar üretiniz:

```bash
# Access Token Secret için (Örnek çıktı: 64 karakter güvenli base64)
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Veya OpenSSL ile:
openssl rand -base64 48
```

Bu anahtarları `JWT_ACCESS_SECRET` ve `JWT_REFRESH_SECRET` değişkenlerine atayınız.

---

## 4. Veritabanı, Migration ve Seed Yönetimi (TypeORM)

PostGIS uzamsal tabloları, kategoriler ve Auth kayıtları TypeORM migration dosyaları ile sürüm kontrolünde tutulur:

```bash
# Migration'ları çalıştırma
pnpm --filter sehir-nabiz-api migration:run

# Son migration'ı geri alma (Revert)
pnpm --filter sehir-nabiz-api migration:revert

# Migration geçmişini görüntüleme
pnpm --filter sehir-nabiz-api migration:show

# Geliştirme ortamı için Kayseri demo olaylarını ekleme (Seed)
pnpm --filter sehir-nabiz-api seed
```

> [!IMPORTANT]
> `pnpm seed` komutu yalnızca `NODE_ENV=development` veya `NODE_ENV=test` ortamında çalışır. Üretim ortamında (`production`) güvenlik kalkanı sayesinde kesinlikle engellenir ve tüm demo veriler `[DEMO]` başlığı ile `isDemo: true` bayrağı taşır.

---

## 5. Temel Turborepo Komutları

| Komut | Açıklama |
| :--- | :--- |
| `pnpm run build` | Tüm monorepo paketlerini Turborepo önbelleği ile derler. |
| `pnpm run typecheck` | TypeScript Strict modunda tüm çalışma alanında tip denetimi yapar. |
| `pnpm run lint` | ESLint ve kod kalitesi denetimlerini yürütür. |
| `pnpm run test` | Tüm birim ve entegrasyon testlerini çalıştırır. |
| `pnpm run clean` | Oluşan `dist` ve geçici derleme klasörlerini temizler. |

---

## 6. Uygulama Bazlı Çalışma

### 6.1 Backend API (`apps/api`)
```bash
# Geliştirme modunda başlatma (hot reload)
pnpm --filter sehir-nabiz-api start:dev

# Üretim derlemesi oluşturma
pnpm --filter sehir-nabiz-api build

# Sağlık ve Hazır Olma kontrolleri
curl http://localhost:3001/api/v1/health
curl http://localhost:3001/api/v1/health/ready
```

### 6.2 Mobil Uygulama (`apps/mobile`)
```bash
# Expo geliştirme sunucusunu başlatma
pnpm --filter sehir-nabiz-mobile start
```

---

## 7. Mobil Güvenlik & Token Saklama Mimarisi

Mobil istemci için:
- **Access Token:** Asla diske (AsyncStorage) yazılmaz. Yalnızca çalışma zamanı belleğinde (`Zustand`) saklanır.
- **Refresh Token:** iOS Keychain ve Android Keystore donanım tabanlı şifreleme motorunu kullanan `expo-secure-store` içine yazılır.
- **Reuse Detection:** İptal edilmiş veya çalınmış bir refresh token sunucuya gönderildiğinde, sunucu otomatik olarak o kullanıcının tüm oturumlarını sonlandırır.
