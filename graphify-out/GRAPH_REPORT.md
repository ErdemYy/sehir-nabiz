# Graph Report - ŞehirNabız  (2026-10-25)

## Corpus Check
- 61 files · ~9,801 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 2, (none) 1)

## Summary
- 590 nodes · 652 edges · 45 communities (40 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f69c78f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- 1. Geliştirme Fazları
- ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)
- ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)
- ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)
- ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)
- mobile/package.json
- api/package.json
- main.ts
- expo
- package.json
- compilerOptions
- shared/package.json
- theme/index.ts
- devDependencies
- design-tokens/package.json
- event.schema.ts
- tasks
- dependencies
- scripts
- EventCategory
- dependencies
- compilerOptions
- compilerOptions
- compilerOptions
- scripts
- 2. Phase 6'da Uygulanacak Kurulum Adımları
- config/package.json
- event.types.ts
- ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)
- ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- index.test.ts
- mobile/tsconfig.json
- nest-cli.json
- EventStatus
- enums/index.ts
- EventSeverity
- env.validation.ts
- tsconfig.build.json
- env.ts

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 22 edges
2. `expo` - 15 edges
3. `EventCategory` - 15 edges
4. `1. Geliştirme Fazları` - 12 edges
5. `scripts` - 11 edges
6. `EventStatus` - 10 edges
7. `jest` - 9 edges
8. `scripts` - 9 edges
9. `useAppTheme()` - 9 edges
10. `scripts` - 9 edges

## Surprising Connections (you probably didn't know these)
- `5. Backend Mimarisi (`apps/api`)` --references--> `AllExceptionsFilter`  [INFERRED]
  docs/PHASE_1_REPORT.md → apps/api/src/common/filters/all-exceptions.filter.ts
- `5. Backend Mimarisi (`apps/api`)` --references--> `ApiErrorResponse`  [INFERRED]
  docs/PHASE_1_REPORT.md → packages/shared/src/types/api.types.ts
- `AppState` --references--> `EventCategory`  [EXTRACTED]
  apps/mobile/src/store/useAppStore.ts → packages/shared/src/enums/index.ts
- `bootstrap()` --calls--> `AllExceptionsFilter`  [EXTRACTED]
  apps/api/src/main.ts → apps/api/src/common/filters/all-exceptions.filter.ts
- `NotFoundScreen()` --calls--> `useAppTheme()`  [EXTRACTED]
  apps/mobile/app/+not-found.tsx → apps/mobile/src/theme/index.ts

## Import Cycles
- None detected.

## Communities (45 total, 5 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.12
Nodes (16): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (AKTİF - TAMAMLANIYOR), Phase 2: Backend Çekirdek, Docker & Veritabanı (+8 more)

### Community 1 - "ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)"
Cohesion: 0.18
Nodes (10): 1. Mimari Genel Bakış, 2. Mobil Harita Kütüphanesi Seçimi ve Analizi, 3.1 Neden NestJS?, 3.2 PostgreSQL + PostGIS Uzamsal (Spatial) Stratejisi, 3. Backend Mimarisi (`apps/api`: NestJS 12 + PostgreSQL/PostGIS), 4. Durum Yönetimi ve Veri Akışı, 5. Gerçek Zamanlı İletişim Stratejisi, 6. Güvenilirlik ve Süreklilik Garantisi (+2 more)

### Community 2 - "ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)"
Cohesion: 0.20
Nodes (9): 1.1 Konum Bulanıklaştırma (Fuzzy Location & Noise Injection), 1.2 Medya Sanitizasyonu (EXIF / Metadata Stripping), 1. Konum Gizliliği ve KVKK / GDPR Uyumu, 2.1 İtibar (Reputation / Karma) Algoritması, 2.2 Coğrafi Mükerrer Bildirim Engelleme (Spatial Deduplication), 2. Sahte Bildirim ve Spam Önleme Mekanizmaları, 3. Topluluk Moderasyonu ve Güvenilirlik Skoru, 4. Kullanım Maliyetleri ve Optimizasyon Projeksiyonu (+1 more)

### Community 3 - "ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)"
Cohesion: 0.25
Nodes (7): 1. Proje Özeti ve Vizyon, 2. Temel Çalışma Kuralları, 3. Monorepo Yapı Şeması, 4. Graphify Kuralları ve Kullanımı, 5. Güvenlik ve Gizlilik Standartları, 6. Geliştirme Fazları Özeti, ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)

### Community 4 - "ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)"
Cohesion: 0.29
Nodes (6): 1. Veritabanı Varlık-İlişki Diyagramı (ERD), 2. PostgreSQL + PostGIS Tablo Şemaları (SQL), 3. İndeksleme Stratejileri, 4.1 Zod Validasyon Şeması (Olay Oluşturma Örneği), 4. Ortak Tipler ve DTO'lar (`packages/shared`), ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)

### Community 5 - "mobile/package.json"
Cohesion: 0.06
Nodes (40): HomeScreen(), styles, RootLayout(), RootLayoutNav(), NotFoundScreen(), styles, description, @sehir-nabiz/config (+32 more)

### Community 6 - "api/package.json"
Cohesion: 0.05
Nodes (38): description, jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex (+30 more)

### Community 7 - "main.ts"
Cohesion: 0.11
Nodes (12): AppModule, AllExceptionsFilter, bootstrap(), HealthController, HealthModule, 5. Backend Mimarisi (`apps/api`), ApiErrorResponse, HealthCheckResponse (+4 more)

### Community 8 - "expo"
Cohesion: 0.08
Nodes (25): backgroundColor, adaptiveIcon, package, typedRoutes, expo, android, experiments, icon (+17 more)

### Community 9 - "package.json"
Cohesion: 0.08
Nodes (24): description, devDependencies, prettier, turbo, typescript, engines, node, pnpm (+16 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, alwaysStrict, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, module, moduleResolution, noFallthroughCasesInSwitch (+15 more)

### Community 11 - "shared/package.json"
Cohesion: 0.09
Nodes (22): dependencies, zod, description, devDependencies, @sehir-nabiz/config, @types/node, typescript, @sehir-nabiz/config (+14 more)

### Community 12 - "theme/index.ts"
Cohesion: 0.13
Nodes (9): darkTheme, lightTheme, palette, ThemeColors, radii, spacing, fontSizes, fontWeights (+1 more)

### Community 13 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, source-map-support, supertest (+10 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.11
Nodes (17): description, devDependencies, @sehir-nabiz/config, typescript, @sehir-nabiz/config, typescript, main, name (+9 more)

### Community 15 - "event.schema.ts"
Cohesion: 0.14
Nodes (12): ApiErrorResponseSchema, HealthCheckResponseSchema, CreateEventInput, EventCategorySchema, EventSeveritySchema, EventStatusSchema, VerificationTypeSchema, VerifyEventInput (+4 more)

### Community 16 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, cache, cache, persistent, dependsOn, $schema, tasks (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, expo, expo-constants, expo-linking, expo-router, expo-status-bar, react, react-dom (+7 more)

### Community 18 - "scripts"
Cohesion: 0.13
Nodes (14): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript, scripts, android, clean (+6 more)

### Community 19 - "EventCategory"
Cohesion: 0.17
Nodes (11): AppState, EventCategory, CULTURAL_EVENT, FIRE_OR_NATURAL_HAZARD, INFRASTRUCTURE_FAILURE, OTHER, PUBLIC_SAFETY, ROAD_WORK (+3 more)

### Community 20 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, class-transformer, class-validator, helmet, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/platform-express (+4 more)

### Community 21 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, emitDecoratorMetadata, experimentalDecorators, module, moduleResolution, sourceMap, target (+3 more)

### Community 22 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, declarationMap, module, moduleResolution, outDir, rootDir, target (+3 more)

### Community 23 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, declarationMap, module, moduleResolution, outDir, rootDir, target (+3 more)

### Community 24 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, clean, lint, start, start:dev, start:prod, test (+3 more)

### Community 25 - "2. Phase 6'da Uygulanacak Kurulum Adımları"
Cohesion: 0.20
Nodes (9): 1. Uyumluluk Durumu Analizi, 2.1 Bağımlılıkların Eklenmesi, 2.2 Expo Config Plugin Yapılandırması (`apps/mobile/app.json`), 2.3 Yerel Prebuild ve Çalıştırma, 2.4 Temel Harita Bileşeni Mimarisi, 2. Phase 6'da Uygulanacak Kurulum Adımları, Expo Go vs Expo Prebuild (Dev Client), Peer Dependency İncelemesi (+1 more)

### Community 26 - "config/package.json"
Cohesion: 0.20
Nodes (9): dependencies, prettier, description, files, prettier, main, name, private (+1 more)

### Community 27 - "event.types.ts"
Cohesion: 0.31
Nodes (6): ApiResponse, EventDetail, EventSummary, BoundingBox, GeoCoordinate, GeoRadiusQuery

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.22
Nodes (8): 1. Ortam Hazırlığı, 2. Çevresel Değişkenler (Environment Variables), 3. Temel Turborepo Komutları, 4.1 Backend API (`apps/api`), 4.2 Mobil Uygulama (`apps/mobile`), 4. Uygulama Bazlı Çalışma, 5. Kodlama ve Mimari Kuralları, ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)

### Community 29 - "ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)"
Cohesion: 0.22
Nodes (8): 1. Genel Özet ve Mimari Kazanımlar, 2. Oluşturulan Dizin ve Paket Yapısı, 3. Kurulan Paketler ve Sürümleri, 4. Expo SDK 58 ve MapLibre Uyumluluk Analizi, 6. Kalite ve Test Doğrulama Sonuçları, 7. Graphify Bilgi Grafı Durumu, 8. Eksik Kalanlar ve Phase 2 Önerileri, ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)

### Community 30 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, jsx, lib, moduleResolution, extends, ./base.json, $schema

### Community 31 - "ŞehirNabız (Pulse of the City) 🏙️⚡"
Cohesion: 0.22
Nodes (8): 📚 Dokümantasyon Bağlantıları, Gereksinimler, 🛠️ Hızlı Başlangıç, Kurulum, 📦 Monorepo Klasör Yapısı, 🚀 Proje Mimarisi Özeti, Uygulamaları Çalıştırma, ŞehirNabız (Pulse of the City) 🏙️⚡

### Community 32 - "api/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, baseUrl, outDir, paths, extends, include, @sehir-nabiz/config/typescript/node.json

### Community 34 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, extends, include, @sehir-nabiz/config/typescript/react-native.json

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "EventStatus"
Cohesion: 0.33
Nodes (6): EventStatus, ACTIVE, EXPIRED, PENDING_VERIFICATION, REJECTED_SPAM, RESOLVED

### Community 37 - "enums/index.ts"
Cohesion: 0.40
Nodes (4): VerificationType, CONFIRM, DENY, RESOLVED

### Community 38 - "EventSeverity"
Cohesion: 0.40
Nodes (5): EventSeverity, CRITICAL, HIGH, LOW, MEDIUM

### Community 39 - "env.validation.ts"
Cohesion: 0.50
Nodes (3): Environment, EnvironmentSchema, validateEnvironment()

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

## Knowledge Gaps
- **71 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `class-transformer`, `class-validator`, `reflect-metadata` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 432 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `main.ts` to `api/package.json`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `class-transformer` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `zustand` connect `EventCategory` to `mobile/package.json`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `mobile/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05731523378582202 - nodes in this community are weakly interconnected._
- **Why does `EventCategory` connect `EventCategory` to `index.test.ts`, `event.types.ts`, `enums/index.ts`, `event.schema.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._