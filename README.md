# ŞehirNabız (Pulse of the City) 🏙️⚡

ŞehirNabız, Türkiye'deki şehirlerde gerçekleşen olayların (kaza, yol çalışması, altyapı arızası, afet, yerel etkinlik vb.) interaktif bir harita üzerinden gerçek zamanlı takip edildiği, topluluk teyitli ve doğrulanabilir modern bir kentsel bilgi ekosistemidir.

---

## 🚀 Proje Mimarisi Özeti

- **Mobil Uygulama (`apps/mobile`):** React Native + Expo SDK 58 (New Architecture / Fabric etkin), Expo Router v58, Zustand, TanStack Query.
- **Backend API (`apps/api`):** NestJS v12 (TypeScript Strict), TypeORM, PostgreSQL 16 + PostGIS uzamsal (spatial) veritabanı, Redis 7 (In-memory fallback ile rate limiting), Helmet, Zod, JWT + Rotasyonlu Refresh Token.
- **Konteyner Altyapısı (`docker-compose.yml`):** PostgreSQL 16 + PostGIS 3.4 (`postgis/postgis:16-3.4`) ve Redis 7 (`redis:7-alpine`) yerel güvenlik konfigürasyonu.
- **Ortak Paketler (`packages/*`):**
  - `@sehir-nabiz/shared`: Mobil ve backend ortak TypeScript tipleri, Auth/Event DTO'ları ve Zod şemaları.
  - `@sehir-nabiz/design-tokens`: Renk, tipografi, boşluk ve açık/koyu tema tokenları.
  - `@sehir-nabiz/config`: Ortak TypeScript, ESLint ve Prettier konfigürasyonları.
- **Harita Motoru:** `@maplibre/maplibre-react-native` (Metal/OpenGL GPU hızlandırmalı vektör kenti motoru).

---

## 📦 Monorepo Klasör Yapısı

```text
sehir-nabiz/
├── apps/
│   ├── mobile/                 # React Native & Expo Mobil Uygulaması
│   └── api/                    # NestJS API Servisi
├── packages/
│   ├── shared/                 # Ortak Zod Şemaları & Tipler
│   ├── design-tokens/          # Tasarım Sistemi Tokenları
│   └── config/                 # Ortak TS/ESLint Yapılandırması
├── docs/                       # Mimari ve Teknik Dokümantasyon
│   ├── architecture/           # Sistem Mimarisi & Veri Modelleri
│   ├── guides/                 # MapLibre vb. Entegrasyon Kılavuzları
│   ├── DEVELOPMENT.md          # Geliştirici Çalışma Rehberi
│   └── PHASE_1_REPORT.md       # Faz 1 Tamamlanma Raporu
├── pnpm-workspace.yaml         # pnpm Workspace Yapılandırması
├── turbo.json                  # Turborepo Görev Tanımları
└── AGENTS.md                   # Yapay Zeka Ajanları ve Geliştirici Kılavuzu
```

---

## 🛠️ Hızlı Başlangıç

### Gereksinimler
- Node.js `>= 20.0.0` (Node.js 24 önerilir)
- pnpm `>= 9.0.0` (Sistemde pnpm v12 kullanılmaktadır)

### Kurulum
```bash
# Tüm bağımlılıkları yükleyin
pnpm install

# Tüm paketleri derleyin
pnpm run build

# Tip denetimi yapın
pnpm run typecheck

# Birim testleri çalıştırın
pnpm run test
```

### Uygulamaları Çalıştırma
```bash
# Backend API'yi geliştirme modunda başlatma (Port 3001)
pnpm --filter sehir-nabiz-api start:dev

# Mobil uygulamayı Expo ile başlatma
pnpm --filter sehir-nabiz-mobile start
```

---

## 📚 Dokümantasyon Bağlantıları
- [Yapay Zeka ve Geliştirici Rehberi (AGENTS.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/AGENTS.md)
- [Geliştirici Rehberi (DEVELOPMENT.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/DEVELOPMENT.md)
- [Sistem Mimarisi (ARCHITECTURE.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/ARCHITECTURE.md)
- [Veri Modelleri & PostGIS (DATA_MODELS.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/DATA_MODELS.md)
- [Güvenlik, Gizlilik & Moderasyon (SECURITY_PRIVACY.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/SECURITY_PRIVACY.md)
- [Geliştirme Fazları Yol Haritası (ROADMAP_PHASES.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/ROADMAP_PHASES.md)
- [MapLibre Entegrasyon Rehberi (MAPLIBRE_INTEGRATION_GUIDE.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/guides/MAPLIBRE_INTEGRATION_GUIDE.md)
- [Faz 1 Tamamlanma Raporu (PHASE_1_REPORT.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_1_REPORT.md)
- [Faz 2 Tamamlanma Raporu (PHASE_2_REPORT.md)](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_2_REPORT.md)
