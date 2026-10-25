# Graph Report - ŞehirNabız  (2026-10-25)

## Corpus Check
- 112 files · ~28,347 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 2, (none) 1)

## Summary
- 1038 nodes · 1684 edges · 74 communities (58 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9d6ad1a8`
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
- ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)
- expo
- package.json
- compilerOptions
- shared/package.json
- theme/index.ts
- devDependencies
- design-tokens/package.json
- events.controller.ts
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
- CategoryEntity
- ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)
- AuthController
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- events.service.ts
- mobile/tsconfig.json
- nest-cli.json
- EventStatus
- EventEntity
- shared/src/index.ts
- EventsService
- tsconfig.build.json
- env.ts
- events.e2e-spec.ts
- ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)
- UserRole
- @nestjs/common
- ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)
- _layout.tsx
- app.module.ts
- main.ts
- all-exceptions.filter.ts
- useAppTheme
- index.tsx
- devDependencies
- auth.controller.ts
- ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)
- AuthService
- health.controller.ts
- auth.schema.ts
- CategoryCode
- jest
- JwtAuthGuard
- UserEntity
- event.types.ts
- RegisterDto
- NearbyEventsDto
- LoginDto
- index.test.ts
- seed-demo-events.ts
- EventSeverity
- JwtStrategy

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 32 edges
2. `UserEntity` - 31 edges
3. `EventStatus` - 28 edges
4. `CategoryEntity` - 25 edges
5. `EventEntity` - 25 edges
6. `EventCategory` - 24 edges
7. `EventSeverity` - 23 edges
8. `compilerOptions` - 22 edges
9. `UserRole` - 22 edges
10. `EventModerationLogEntity` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Phase 3: Coğrafi Veri & Olay Yönetimi API'si (TAMAMLANDI)` --references--> `EventEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event.entity.ts
- `3. Gerçek TypeORM Migration & Şema Testleri` --references--> `InitialAuthAndPostGis1740000000000`  [INFERRED]
  docs/PHASE_2_5_VERIFICATION.md → apps/api/src/database/migrations/1740000000000-InitialAuthAndPostGis.ts
- `1. Oluşturulan Dosyalar ve Modüller` --references--> `DuplicateWarningDto`  [INFERRED]
  docs/PHASE_3_REPORT.md → packages/shared/src/types/event.types.ts
- `5. Backend Mimarisi (`apps/api`)` --references--> `AllExceptionsFilter`  [INFERRED]
  docs/PHASE_1_REPORT.md → apps/api/src/common/filters/all-exceptions.filter.ts
- `1. Oluşturulan Dosyalar ve Modüller` --references--> `CategoriesController`  [INFERRED]
  docs/PHASE_3_REPORT.md → apps/api/src/modules/categories/categories.controller.ts

## Import Cycles
- None detected.

## Communities (74 total, 16 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.11
Nodes (17): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI), Phase 2.5: Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü (TAMAMLANDI) (+9 more)

### Community 1 - "ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)"
Cohesion: 0.15
Nodes (12): 1. Mimari Genel Bakış, 2. Mobil Harita Kütüphanesi Seçimi ve Analizi, 3.1 Neden NestJS?, 3.2 ORM Karar Analizi: TypeORM vs Prisma vs Drizzle, 3.2 PostgreSQL + PostGIS Uzamsal (Spatial) Stratejisi, 3.3 Oturum ve Token Yaşam Döngüsü (Token Rotation & Reuse Detection), 3. Backend Mimarisi (`apps/api`: NestJS 12 + PostgreSQL/PostGIS), 4. Durum Yönetimi ve Veri Akışı (+4 more)

### Community 2 - "ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)"
Cohesion: 0.17
Nodes (11): 1.1 Konum Bulanıklaştırma (Fuzzy Location & Noise Injection), 1.2 Medya Sanitizasyonu (EXIF / Metadata Stripping), 1. Konum Gizliliği ve KVKK / GDPR Uyumu, 2.1 İtibar (Reputation / Karma) Algoritması, 2.2 Coğrafi Mükerrer Bildirim Engelleme (Spatial Deduplication), 2. Sahte Bildirim ve Spam Önleme Mekanizmaları, 3. Topluluk Moderasyonu ve Güvenilirlik Skoru, 4. Kullanım Maliyetleri ve Optimizasyon Projeksiyonu (+3 more)

### Community 3 - "ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)"
Cohesion: 0.25
Nodes (7): 1. Proje Özeti ve Vizyon, 2. Temel Çalışma Kuralları, 3. Monorepo Yapı Şeması, 4. Graphify Kuralları ve Kullanımı, 5. Güvenlik ve Gizlilik Standartları, 6. Geliştirme Fazları Özeti, ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)

### Community 4 - "ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)"
Cohesion: 0.29
Nodes (6): 1. Veritabanı Varlık-İlişki Diyagramı (ERD), 2. PostgreSQL + PostGIS Tablo Şemaları (SQL), 3. İndeksleme Stratejileri, 4.1 Zod Validasyon Şeması (Olay Oluşturma Örneği), 4. Ortak Tipler ve DTO'lar (`packages/shared`), ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)

### Community 5 - "mobile/package.json"
Cohesion: 0.12
Nodes (16): description, @sehir-nabiz/config, @sehir-nabiz/shared, typescript, main, name, private, version (+8 more)

### Community 6 - "api/package.json"
Cohesion: 0.06
Nodes (34): description, @sehir-nabiz/config, @sehir-nabiz/shared, @types/node, typescript, zod, name, private (+26 more)

### Community 7 - "ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)"
Cohesion: 0.18
Nodes (10): 1. Genel Özet ve Mimari Kazanımlar, 2. Oluşturulan Dizin ve Paket Yapısı, 3. Kurulan Paketler ve Sürümleri, 4. Expo SDK 58 ve MapLibre Uyumluluk Analizi, 5. Backend Mimarisi (`apps/api`), 6. Kalite ve Test Doğrulama Sonuçları, 7. Graphify Bilgi Grafı Durumu, 8. Eksik Kalanlar ve Phase 2 Önerileri (+2 more)

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
Cohesion: 0.09
Nodes (22): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, source-map-support, supertest (+14 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.11
Nodes (17): description, devDependencies, @sehir-nabiz/config, typescript, @sehir-nabiz/config, typescript, main, name (+9 more)

### Community 15 - "events.controller.ts"
Cohesion: 0.05
Nodes (25): OptionalJwtAuthGuard, VerificationType, CONFIRM, DENY, RESOLVED, ApiErrorResponseSchema, HealthCheckResponseSchema, BBoxEventsQueryInput (+17 more)

### Community 16 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, cache, cache, persistent, dependsOn, $schema, tasks (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, expo, expo-constants, expo-linking, expo-router, expo-status-bar, react, react-dom (+7 more)

### Community 18 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, clean, ios, lint, start, test, typecheck (+1 more)

### Community 19 - "EventCategory"
Cohesion: 0.11
Nodes (18): EventCategory, ACCIDENT, CULTURAL_EVENT, DISASTER, EVENT, FIRE_OR_NATURAL_HAZARD, INFRASTRUCTURE, INFRASTRUCTURE_FAILURE (+10 more)

### Community 20 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, bcryptjs, class-transformer, class-validator, helmet, ioredis, @nestjs/common, @nestjs/config (+14 more)

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
Cohesion: 0.13
Nodes (15): scripts, build, clean, lint, migration:revert, migration:run, migration:show, seed (+7 more)

### Community 25 - "2. Phase 6'da Uygulanacak Kurulum Adımları"
Cohesion: 0.20
Nodes (9): 1. Uyumluluk Durumu Analizi, 2.1 Bağımlılıkların Eklenmesi, 2.2 Expo Config Plugin Yapılandırması (`apps/mobile/app.json`), 2.3 Yerel Prebuild ve Çalıştırma, 2.4 Temel Harita Bileşeni Mimarisi, 2. Phase 6'da Uygulanacak Kurulum Adımları, Expo Go vs Expo Prebuild (Dev Client), Peer Dependency İncelemesi (+1 more)

### Community 26 - "config/package.json"
Cohesion: 0.20
Nodes (9): dependencies, prettier, description, files, prettier, main, name, private (+1 more)

### Community 27 - "CategoryEntity"
Cohesion: 0.11
Nodes (6): CategoryEntity, CategoriesController, CategoriesModule, CategoriesService, CategoryDto, @nestjs/typeorm

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.15
Nodes (12): 1. Ortam Hazırlığı, 2. Docker Servislerinin Başlatılması, 3.1 Geliştirme Ortamı Dosyaları, 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı), 3. Güvenli Secret ve Ortam Değişkeni Yönetimi, 4. Veritabanı, Migration ve Seed Yönetimi (TypeORM), 5. Temel Turborepo Komutları, 6.1 Backend API (`apps/api`) (+4 more)

### Community 30 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, jsx, lib, moduleResolution, extends, ./base.json, $schema

### Community 31 - "ŞehirNabız (Pulse of the City) 🏙️⚡"
Cohesion: 0.22
Nodes (8): 📚 Dokümantasyon Bağlantıları, Gereksinimler, 🛠️ Hızlı Başlangıç, Kurulum, 📦 Monorepo Klasör Yapısı, 🚀 Proje Mimarisi Özeti, Uygulamaları Çalıştırma, ŞehirNabız (Pulse of the City) 🏙️⚡

### Community 32 - "api/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, baseUrl, outDir, paths, extends, include, @sehir-nabiz/config/typescript/node.json

### Community 33 - "events.service.ts"
Cohesion: 0.30
Nodes (3): InitialAuthAndPostGis1740000000000, CreateCategoriesAndEvents1740000001000, typeorm

### Community 34 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, extends, include, @sehir-nabiz/config/typescript/react-native.json

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "EventStatus"
Cohesion: 0.22
Nodes (9): EventStatus, ACTIVE, DISPUTED, EXPIRED, PENDING_REVIEW, PENDING_VERIFICATION, REJECTED, REJECTED_SPAM (+1 more)

### Community 39 - "EventsService"
Cohesion: 0.07
Nodes (9): BBoxEventsDto, CreateEventDto, UpdateEventStatusDto, EventsController, EventsService, 1. Oluşturulan Dosyalar ve Modüller, JwtPayload, EventResponseDto (+1 more)

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 45 - "events.e2e-spec.ts"
Cohesion: 0.18
Nodes (7): dataSourceOptions, AccountStatus, ACTIVE, PENDING_VERIFICATION, SUSPENDED, bcryptjs, vitest

### Community 46 - "ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)"
Cohesion: 0.11
Nodes (15): DatabaseModule, AuthModule, RedisModule, 10. Git ve Faz Kapanışı, 11. Teknik Borçlar, 12. Phase 3 İçin Öneriler, 1. Oluşturulan Modüller ve Mimari Bileşenler, 2. Veritabanı Tabloları ve Şema Yapısı (+7 more)

### Community 47 - "UserRole"
Cohesion: 0.16
Nodes (9): ROLES_KEY, RolesGuard, UserRole, ADMIN, CITIZEN, MODERATOR, MUNICIPAL_OFFICER, TRUSTED_REPORTER (+1 more)

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.14
Nodes (13): 1. Docker ve Altyapı Servisleri Canlı Durumu, 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması, 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması, 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları, 3. Gerçek TypeORM Migration & Şema Testleri, 4. Canlı API ve Auth Uç Nokta Testleri, 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti, 5.2 NestJS ValidationPipe ve DTO Güvenliği (+5 more)

### Community 50 - "_layout.tsx"
Cohesion: 0.16
Nodes (9): RootLayout(), RootLayoutNav(), ErrorBoundary, AppProvider(), AppProviderProps, queryClient, expo-status-bar, react-native-safe-area-context (+1 more)

### Community 51 - "app.module.ts"
Cohesion: 0.25
Nodes (5): Environment, EnvironmentSchema, validateEnvironment(), EventsModule, HealthModule

### Community 52 - "main.ts"
Cohesion: 0.25
Nodes (4): AppModule, AllExceptionsFilter, bootstrap(), helmet

### Community 54 - "useAppTheme"
Cohesion: 0.18
Nodes (12): NotFoundScreen(), styles, Props, State, styles, LoadingIndicator(), LoadingIndicatorProps, styles (+4 more)

### Community 55 - "index.tsx"
Cohesion: 0.32
Nodes (5): HomeScreen(), styles, AppState, useAppStore, zustand

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

### Community 57 - "auth.controller.ts"
Cohesion: 0.22
Nodes (5): AuthTokens, UserResponse, @nestjs/config, @nestjs/jwt, @nestjs/passport

### Community 58 - "ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Graphify Metrikleri, 11. Git Commit, 12. Teknik Riskler ve Alınan Önlemler, 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri, 2. Veritabanı Tabloları, 3. PostGIS Veri Tipi ve İndeksleme Stratejisi, 4. API Uç Noktaları, 5. Filtreleme ve Cursor Tabanlı Sayfalama (+6 more)

### Community 60 - "health.controller.ts"
Cohesion: 0.16
Nodes (4): HealthController, ReadinessResponse, ApiResponse, HealthCheckResponse

### Community 61 - "auth.schema.ts"
Cohesion: 0.18
Nodes (7): RefreshTokenDto, AccountStatusSchema, LoginInputSchema, RefreshTokenInput, RefreshTokenInputSchema, RegisterInputSchema, UserRoleSchema

### Community 62 - "CategoryCode"
Cohesion: 0.17
Nodes (12): CategoryCode, ACCIDENT, DISASTER, EVENT, INFRASTRUCTURE, OTHER, POWER_OUTAGE, PUBLIC_TRANSPORT (+4 more)

### Community 63 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 64 - "JwtAuthGuard"
Cohesion: 0.14
Nodes (4): ZodValidationPipe, JwtAuthGuard, AuthRateLimitGuard, 5. Kimlik Doğrulama Uç Noktaları (Auth Endpoints)

### Community 66 - "event.types.ts"
Cohesion: 0.29
Nodes (6): DuplicateWarningDto, EventDetail, EventSummary, BoundingBox, GeoCoordinate, GeoRadiusQuery

### Community 71 - "seed-demo-events.ts"
Cohesion: 0.60
Nodes (3): AppDataSource, run(), seedDemoEvents()

### Community 72 - "EventSeverity"
Cohesion: 0.40
Nodes (5): EventSeverity, CRITICAL, HIGH, LOW, MEDIUM

## Knowledge Gaps
- **106 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport`, `pg`, `reflect-metadata` (+101 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 665 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `events.service.ts`, `api/package.json`, `events.e2e-spec.ts`, `events.controller.ts`, `UserRole`, `app.module.ts`, `main.ts`, `all-exceptions.filter.ts`, `auth.controller.ts`, `CategoryEntity`, `health.controller.ts`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport` to the rest of the system?**
  _106 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `zustand` connect `index.tsx` to `mobile/package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `mobile/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `api/package.json`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._