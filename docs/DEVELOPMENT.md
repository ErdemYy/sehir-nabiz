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

Veritabanı, Redis ve MinIO nesne depolama servisleri Docker Compose ile yönetilir. Portlar güvenlik amacıyla yalnızca yerel makineye (`127.0.0.1`) bağlanmıştır.

- **PostgreSQL 16 + PostGIS 3.4:** `127.0.0.1:5434`
- **Redis 7 Alpine:** `127.0.0.1:6380`
- **MinIO S3 API:** `127.0.0.1:9000`
- **MinIO Web Konsolu:** `http://127.0.0.1:9001` (Kullanıcı: `minioadmin`, Şifre: `minioadmin123`)

```bash
# Servisleri arka planda başlatma
docker compose up -d

# Konteyner durumlarını ve healthcheck'leri inceleme
docker compose ps

# Servis loglarını takip etme
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f minio

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
# Expo geliştirme sunucusunu başlatma (Metro bundler)
pnpm --filter sehir-nabiz-mobile start

# Android simülatör / bağlı cihazda çalıştırma
pnpm --filter sehir-nabiz-mobile android

# iOS simülatörde çalıştırma (macOS ortamında)
pnpm --filter sehir-nabiz-mobile ios

# Mobil navigasyon ve token testlerini çalıştırma
pnpm --filter sehir-nabiz-mobile test

# Tasarım sistemi token testlerini çalıştırma
pnpm --filter @sehir-nabiz/design-tokens test
```

#### UI Showcase Ekranına Erişim:
Geliştirme ortamında (`__DEV__ = true`), tüm butonlar, tipografi ölçeği, kartlar, çipler, form elemanları ve koyu/açık tema geçişi Harita ekranındaki ışıltı (Sparkles) ikonundan veya Profil ekranındaki "Tasarım Sistemi UI Showcase" kartından incelenebilir. Üretim derlemelerinde bu ekrana erişim güvenlik kalkanı ile engellenmiştir.

---

## 7. Mobil Güvenlik & Token Saklama Mimarisi

Mobil istemci için:
- **Access Token:** Asla diske (AsyncStorage) yazılmaz. Yalnızca çalışma zamanı belleğinde (`Zustand`) saklanır.
- **Refresh Token:** iOS Keychain ve Android Keystore donanım tabanlı şifreleme motorunu kullanan `expo-secure-store` içine yazılır.
- **Reuse Detection:** İptal edilmiş veya çalınmış bir refresh token sunucuya gönderildiğinde, sunucu otomatik olarak o kullanıcının tüm oturumlarını sonlandırır.

---

## 8. MapLibre Yerel Geliştirme, Expo Dev Client ve Vektör Harita Katmanları (Phase 6)

### 8.1 Geliştirme Derlemesi (Expo Development Client)
`@maplibre/maplibre-react-native` C++ yerel çekirdeği içerdiğinden standart Expo Go istemcisi ile çalışmaz. Geliştirme build'i kullanılır:

```bash
# 1. Expo Prebuild (android ve ios dizinlerini oluşturur/günceller)
npx expo prebuild --no-install

# 2. Android cihazda veya emülatörde yerel derleme (Android SDK ve JDK 17+ gereklidir)
pnpm --filter sehir-nabiz-mobile android

# 3. Metro sunucusunu dev-client modunda başlatma
pnpm --filter sehir-nabiz-mobile start
```

### 8.2 Vektör Harita Stilleri
Varsayılan olarak OpenFreeMap ve MapLibre açık kaynak karo sağlayıcıları kullanılır:
- **Standart Stil:** `https://tiles.openfreemap.org/styles/liberty`
- **Gece Stili:** `https://tiles.openfreemap.org/styles/dark`
- **Uydu Stili:** `https://demotiles.maplibre.org/style.json`

Stil URL'leri `apps/mobile/.env` üzerinden `EXPO_PUBLIC_MAP_STYLE_LIGHT` vb. değişkenler ile özelleştirilebilir.

### 8.3 Harita ve Mobil Testleri
```bash
# Harita hesaplamaları, BBox doğrulama, 5k clustering ve entegrasyon testleri
pnpm --filter sehir-nabiz-mobile test
```

---

## 9. Olay Bildirme Akışı, Konum ve Medya Servisleri (Phase 7)

### 9.1 Çok Adımlı Olay Bildirme Mimarisi
Mobil uygulamadaki "Bildir" sekmesi (`/(tabs)/create`), 3 adımlı profesyonel bir akış üzerinden çalışır:
- **Adım 1 (Olay Bilgileri):** Kategori seçimi (11 backend kategorisi dinamik olarak `GET /api/v1/categories` üzerinden çekilir), başlık, açıklama ve önem seviyesi.
- **Adım 2 (Konum ve Fotoğraflar):** MapLibre tabanlı `LocationPickerModal` ile harita üzerinde interaktif merkez pin seçimi veya GPS ile konum alma; `expo-image-picker` ile kamera/galeriden en fazla 3 fotoğraf (maks 8MB, JPEG/PNG/WebP).
- **Adım 3 (Önizleme ve Gönderim):** Tüm bilgilerin özeti, gizlilik uyarısı (150m fuzzing), gönderim kilidi koruması (`submittingLock`), mükerrer bildirim kontrolü ve yükleme durumu.

### 9.2 Medya Yükleme Pipeline'ı
1. `POST /api/v1/events` ile olay kaydı oluşturulur (`PENDING_REVIEW` durumunda).
2. Her fotoğraf için `POST /api/v1/events/:id/media/upload-url` çağrılarak presigned S3 PUT URL'i ve `mediaId` alınır.
3. Fotoğraf ikili verisi `FileSystem.uploadAsync` (yerel cihazlarda) veya `fetch` (web üzerinde) ile doğrudan S3/MinIO'ya yüklenir.
4. Yükleme tamamlandığında `POST /api/v1/events/:id/media/:mediaId/complete` çağrılarak medya kaydı `READY` durumuna geçirilir.
5. Herhangi bir fotoğraf yüklemesi başarısız olursa oluşturulan olay silinmez; kullanıcıya başarısız görseller için "Tekrar Dene" imkânı sunulur.

### 9.3 Yerel Taslak Yönetimi
Form verileri kullanıcı yazarken `draftService` aracılığıyla otomatik kaydedilir. Fotoğraflar geçici önbellekten uygulamanın kalıcı doküman dizinine (`FileSystem.documentDirectory`) kopyalanarak uygulamanın kapanıp açılması durumunda kaybolmaları engellenir. Olay başarıyla gönderildiğinde taslak otomatik olarak temizlenir.

### 9.4 Kimlik Doğrulama ve Eşzamanlı Yenileme Koruması (Mutex)
Oturum açmamış kullanıcılar bildirim oluşturabilir; gönderim butonuna basıldığında `AuthModal` açılarak güvenli giriş veya kayıt yapılması sağlanır. `useAuthStore` içinde eşzamanlı isteklerde birden fazla refresh token çağrısının sunucuya giderek reuse detection'ı tetiklemesini engellemek için Promise-tabanlı bir refresh mutex kilidi bulunmaktadır.


