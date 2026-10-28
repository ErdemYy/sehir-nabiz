# ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)

Bu dosya, ŞehirNabız projesinde çalışan tüm yapay zeka ajanları (Antigravity, Claude Code, Cursor, Copilot vb.) ve geliştiriciler için temel kuralları, mimari standartları ve iş akışlarını tanımlar.

---

## 1. Proje Özeti ve Vizyon

**ŞehirNabız**, Türkiye'deki şehirlerde gerçekleşen olayların (kaza, yol çalışması, afet, toplu taşıma aksaklıkları, yerel etkinlikler, altyapı arızaları vb.) interaktif bir harita üzerinden gerçek zamanlı izlendiği, topluluk odaklı ve doğrulanabilir bir kentsel bilgi ekosistemidir.

- **Platform:** Mobil (iOS & Android) — React Native + Expo (Development Build / Prebuild)
- **Backend:** NestJS (TypeScript Strict Mode) + PostgreSQL 16 / PostGIS
- **Harita Motoru:** `@maplibre/maplibre-react-native` (Vektör harita, donanım ivmeli, bağımsız tile sunucusu)
- **Mimari Model:** Monorepo (Turborepo + pnpm)
- **Dil Politikası:** Kod, tip ve değişken adları **İngilizce** (`eventCategory`, `verifyReport`); kullanıcı arayüzü ve hata mesajları **Türkçe** ("Olay başarıyla bildirildi", "Konum izni gerekli").

---

## 2. Temel Çalışma Kuralları

1. **Mevcut Kod ve Dosya Bütünlüğü:** Kullanıcının açık onayı olmadan mevcut dosyaları asla silmeyin. Kod değişikliklerinde mevcut yorumları ve docstring'leri koruyun.
2. **Gereksiz Bağımlılık Yasağı:** Projeye yeni bir npm paketi eklemeden önce native Expo veya yerel TypeScript çözümlerini değerlendirin. Paket seçimlerini gerekçelendirin.
3. **TypeScript Strict Mode:** Tüm kod tabanında (`tsconfig.json`) `strict: true`, `noImplicitAny: true`, `strictNullChecks: true` zorunludur. `any` türü kullanılmamalıdır; `unknown` ve type guard'lar tercih edilmelidir.
4. **Faz Bazlı Geliştirme:** Bir faza ait görevler ve test doğrulama raporu tamamlanmadan sonraki faza geçmeyin.
5. **Graphify Entegrasyonu:** Mimari incelemeler ve bağımlılık haritalaması için `graphify-out/` dizinini ve `graphify query` komutlarını kullanın. Kod değişikliklerinden sonra `graphify update .` komutunu çalıştırın.

---

## 3. Monorepo Yapı Şeması

```text
sehir-nabiz/
├── .agents/                    # Antigravity kuralları ve iş akışları
│   ├── rules/
│   │   └── graphify.md
│   └── workflows/
│       └── graphify.md
├── docs/                       # Mimari ve teknik dokümantasyon
│   ├── architecture/
│   │   ├── ARCHITECTURE.md     # Kapsamlı sistem mimarisi
│   │   ├── DATA_MODELS.md      # PostgreSQL/PostGIS şeması ve DTO'lar
│   │   ├── SECURITY_PRIVACY.md # Konum gizliliği, moderasyon, KVKK
│   │   └── ROADMAP_PHASES.md   # Geliştirme fazları ve MVP kapsamı
├── apps/
│   ├── mobile/                 # React Native + Expo mobil uygulaması
│   │   ├── app/                # Expo Router (file-based navigation)
│   │   ├── src/
│   │   │   ├── components/     # UI bileşenleri (atomic design)
│   │   │   ├── features/       # Özellik bazlı modüller (map, events, auth)
│   │   │   ├── hooks/          # Özel React hook'ları
│   │   │   ├── services/       # API istemcileri (TanStack Query)
│   │   │   ├── store/          # Zustand durum yönetimi
│   │   │   └── theme/          # Renk paleti ve tasarım token'ları
│   │   ├── app.json
│   │   └── package.json
│   └── api/                    # NestJS API servisi
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       # JWT, oturum ve kimlik doğrulama
│       │   │   ├── events/     # Olay yönetimi ve PostGIS sorguları
│       │   │   ├── verification/# Topluluk teyit ve puanlama motoru
│       │   │   ├── media/      # S3/R2 presigned upload ve CDN
│       │   │   └── stats/      # Şehir bazlı istatistik ve yoğunluk
│       │   ├── common/         # Filtreler, guard'lar, interceptor'lar
│       │   └── config/         # Çevresel değişken yönetimi
│       ├── test/               # Unit ve E2E testleri
│       └── package.json
├── packages/
│   ├── shared/                 # Ortak modeller, enum'lar, tipler ve zod şemaları
│   │   ├── src/
│   │   └── package.json
│   ├── design-tokens/          # Renk, tipografi ve aralık tokenları
│   │   ├── src/
│   │   └── package.json
│   └── config/                 # Ortak TS, ESLint ve Prettier yapılandırmaları
│       ├── typescript/
│       ├── eslint/
│       ├── prettier/
│       └── package.json
├── AGENTS.md                   # Bu dosya
├── package.json                # Kök paket yönetimi
├── pnpm-workspace.yaml         # Monorepo çalışma alanı tanımı
└── turbo.json                  # Turborepo yapılandırması
```

---

## 4. Graphify Kuralları ve Kullanımı

- Proje bilgi grafı `graphify-out/` altında tutulur.
- Kod mimarisi sorgulanırken:
  - CLI: `graphify query "<soru>"`
  - İki modül arası ilişki: `graphify path "<A>" "<B>"`
  - Belirli bir bileşeni açıklamak: `graphify explain "<bileşen>"`
- Kod değişikliklerinden sonra:
  - `graphify update .` çalıştırılarak AST güncellenmelidir.

---

## 5. Güvenlik ve Gizlilik Standartları

1. **Konum Bulanıklaştırma (Location Fuzzying):** Hassas olay bildirimlerinde veya kullanıcı profili ev/iş konumlarında tam koordinatlar yerine rastgele 100-300 metre yarıçapında gürültü eklenmelidir (`ST_Buffer` / istemci rastgele ofset).
2. **Medya Sanitizasyonu:** Yüklenen görsellerin EXIF/GPS meta verileri istemci tarafında veya presigned URL öncesi API ağ geçidinde temizlenmelidir.
3. **Spam & Sahte Bildirim Önleme:**
   - Aynı coğrafi dairede (örn. 200m) kısa sürede açılan mükerrer bildirimler birleştirilir (Deduplication).
   - Olaylar topluluk teyidi (`VerificationScore`) ile onaylanır.
   - Güvenilirlik puanı düşük kullanıcıların bildirimleri moderasyon kuyruğuna düşer.

---

## 6. Geliştirme Fazları Özeti

| Faz | Açıklama | Durum |
| --- | --- | --- |
| **Phase 0** | Proje Hazırlığı, Mimari Planlama ve Repo Yapılandırması | **Tamamlandı** |
| **Phase 1** | Monorepo & Ortak Paket Kurulumu | **Tamamlandı** |
| **Phase 2** | Backend Çekirdek, Docker, PostGIS & Auth | **Tamamlandı** |
| **Phase 2.5**| Canlı Entegrasyon, PostGIS Mesafe & Güvenlik Denetimi | **Tamamlandı** |
| **Phase 3** | Coğrafi Veri & Olay Yönetimi API'si | **Tamamlandı** |
| **Phase 4** | Medya & Depolama Yönetimi | **Tamamlandı** |
| **Phase 5** | Mobil Temel, Navigasyon & Durum Yönetimi | **Tamamlandı** |
| **Phase 6** | Harita Motoru & Vektör Katmanları (MapLibre) | **Tamamlandı** |
| **Phase 6.5**| Android Native Doğrulama, Demo Veri Güvenliği & Harita Kalite Kontrolü | **Tamamlandı** |
| **Phase 7** | Olay Bildirim Akışı & Formlar | **Tamamlandı** |
| **Phase 7.5**| Mobil Kalite, Güvenlik ve Android Doğrulama | **Tamamlandı** |
| **Phase 8** | Doğrulama & Moderasyon Mekanizması | **Tamamlandı** |
| **Phase 9** | Gerçek Zamanlı Bildirimler (WebSocket/Push) | **Tamamlandı** |
| **Phase 10**| Şehir İstatistikleri, Testler & MVP Sürümü | **Tamamlandı** |
| **Phase 11**| Production Reliability, Transactional Outbox, Güvenlik ve Performans Sertleştirmesi | **Tamamlandı** |
| **Phase 12**| Mobile Experience Audit, E2E Quality & Beta Readiness | **Tamamlandı** |
| **Phase 13**| Beta Release Preparation, Security Audit & Distribution Readiness | **Tamamlandı** |
| **Phase 14**| Güvenli Hesap Silme, Veri Yaşam Döngüsü ve Release Blocker Düzeltmeleri | **Tamamlandı** |
| **Phase 15**| Hesap Silme Doğrulama, Gizlilik Sertleştirmesi & Staging Hazırlığı | **Tamamlandı** |
| **Phase 16**| Staging Dry-Run, Load Testing, Security Verification & Production Hardening | **Tamamlandı** |
