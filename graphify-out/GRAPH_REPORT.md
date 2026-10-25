# Graph Report - ŞehirNabız  (2026-10-25)

## Corpus Check
- 90 files · ~17,812 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 2, (none) 1)

## Summary
- 823 nodes · 1130 edges · 57 communities (51 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4202fd44`
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
- geo.schema.ts
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
- AuthService
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- index.test.ts
- mobile/tsconfig.json
- nest-cli.json
- EventStatus
- event.schema.ts
- EventSeverity
- app.module.ts
- tsconfig.build.json
- env.ts
- UserEntity
- ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)
- auth.controller.ts
- RedisService
- ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)
- _layout.tsx
- jest
- main.ts
- all-exceptions.filter.ts
- useAppTheme
- index.tsx
- devDependencies

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 22 edges
2. `compilerOptions` - 22 edges
3. `UserEntity` - 20 edges
4. `AuthService` - 19 edges
5. `UserRole` - 17 edges
6. `RefreshTokenEntity` - 16 edges
7. `RedisService` - 15 edges
8. `expo` - 15 edges
9. `EventCategory` - 15 edges
10. `ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)` - 13 edges

## Surprising Connections (you probably didn't know these)
- `5. Backend Mimarisi (`apps/api`)` --references--> `AllExceptionsFilter`  [INFERRED]
  docs/PHASE_1_REPORT.md → apps/api/src/common/filters/all-exceptions.filter.ts
- `6. Yapılan Düzeltmelerin Özeti` --references--> `RolesGuard`  [INFERRED]
  docs/PHASE_2_5_VERIFICATION.md → apps/api/src/common/guards/roles.guard.ts
- `7. Graphify Bilgi Grafı Metrikleri` --references--> `RolesGuard`  [INFERRED]
  docs/PHASE_2_5_VERIFICATION.md → apps/api/src/common/guards/roles.guard.ts
- `5. Kimlik Doğrulama Uç Noktaları (Auth Endpoints)` --references--> `ZodValidationPipe`  [INFERRED]
  docs/PHASE_2_REPORT.md → apps/api/src/common/pipes/zod-validation.pipe.ts
- `1. Oluşturulan Modüller ve Mimari Bileşenler` --references--> `DatabaseModule`  [INFERRED]
  docs/PHASE_2_REPORT.md → apps/api/src/database/database.module.ts

## Import Cycles
- None detected.

## Communities (57 total, 6 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.12
Nodes (16): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI), Phase 2: Backend Çekirdek, Docker, PostGIS ve Güvenli Kimlik Doğrulama (TAMAMLANDI) (+8 more)

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

### Community 15 - "geo.schema.ts"
Cohesion: 0.17
Nodes (8): Environment, EnvironmentSchema, validateEnvironment(), ApiErrorResponseSchema, HealthCheckResponseSchema, BoundingBoxSchema, GeoCoordinateSchema, GeoRadiusQuerySchema

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
Cohesion: 0.20
Nodes (10): AppState, EventCategory, CULTURAL_EVENT, FIRE_OR_NATURAL_HAZARD, INFRASTRUCTURE_FAILURE, OTHER, PUBLIC_SAFETY, ROAD_WORK (+2 more)

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
Cohesion: 0.18
Nodes (11): scripts, build, clean, lint, start, start:dev, start:prod, test (+3 more)

### Community 25 - "2. Phase 6'da Uygulanacak Kurulum Adımları"
Cohesion: 0.20
Nodes (9): 1. Uyumluluk Durumu Analizi, 2.1 Bağımlılıkların Eklenmesi, 2.2 Expo Config Plugin Yapılandırması (`apps/mobile/app.json`), 2.3 Yerel Prebuild ve Çalıştırma, 2.4 Temel Harita Bileşeni Mimarisi, 2. Phase 6'da Uygulanacak Kurulum Adımları, Expo Go vs Expo Prebuild (Dev Client), Peer Dependency İncelemesi (+1 more)

### Community 26 - "config/package.json"
Cohesion: 0.20
Nodes (9): dependencies, prettier, description, files, prettier, main, name, private (+1 more)

### Community 27 - "event.types.ts"
Cohesion: 0.43
Nodes (5): EventDetail, EventSummary, BoundingBox, GeoCoordinate, GeoRadiusQuery

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.15
Nodes (12): 1. Ortam Hazırlığı, 2. Docker Servislerinin Başlatılması, 3.1 Geliştirme Ortamı Dosyaları, 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı), 3. Güvenli Secret ve Ortam Değişkeni Yönetimi, 4. Veritabanı ve Migration Yönetimi (TypeORM), 5. Temel Turborepo Komutları, 6.1 Backend API (`apps/api`) (+4 more)

### Community 29 - "AuthService"
Cohesion: 0.11
Nodes (8): RolesGuard, AuthController, AuthService, 6. Yapılan Düzeltmelerin Özeti, 7. Graphify Bilgi Grafı Metrikleri, AuthResponse, AuthTokens, UserResponse

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

### Community 37 - "event.schema.ts"
Cohesion: 0.17
Nodes (11): VerificationType, CONFIRM, DENY, RESOLVED, CreateEventInput, EventCategorySchema, EventSeveritySchema, EventStatusSchema (+3 more)

### Community 38 - "EventSeverity"
Cohesion: 0.40
Nodes (5): EventSeverity, CRITICAL, HIGH, LOW, MEDIUM

### Community 39 - "app.module.ts"
Cohesion: 0.22
Nodes (6): DatabaseModule, AuthModule, RedisModule, 1. Oluşturulan Modüller ve Mimari Bileşenler, 9. Graphify Bilgi Grafı Metrikleri, @nestjs/throttler

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 45 - "UserEntity"
Cohesion: 0.09
Nodes (10): AppDataSource, dataSourceOptions, RefreshTokenEntity, UserEntity, InitialAuthAndPostGis1740000000000, AccountStatus, ACTIVE, PENDING_VERIFICATION (+2 more)

### Community 46 - "ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)"
Cohesion: 0.18
Nodes (10): 10. Git ve Faz Kapanışı, 11. Teknik Borçlar, 12. Phase 3 İçin Öneriler, 2. Veritabanı Tabloları ve Şema Yapısı, 3. PostGIS ve Docker Durumu, 4. Redis Durumu ve Güvenlik Davranışı, 6. Kullanılan Güvenlik Önlemleri, 7. Test Sonuçları (+2 more)

### Community 47 - "auth.controller.ts"
Cohesion: 0.05
Nodes (32): ROLES_KEY, ZodValidationPipe, LoginDto, RefreshTokenDto, RegisterDto, JwtAuthGuard, AuthRateLimitGuard, JwtStrategy (+24 more)

### Community 48 - "RedisService"
Cohesion: 0.08
Nodes (6): HealthController, ReadinessResponse, HealthModule, RedisService, ApiResponse, HealthCheckResponse

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.15
Nodes (11): 1. Docker ve Altyapı Servisleri Durumu, 2. PostgreSQL / PostGIS ve Redis Bağlantı Sonuçları, 3. Migration ve Veritabanı Şeması Analizi, 4. Auth E2E ve Birim Test Sonuçları, 5.1 Kritik Bulgu ve Düzeltme: Eşzamanlı Refresh İsteği (Race Condition), 5.2 Üretim Ortamında Varsayılan JWT Secret Engeli, 5.3 Rol Tabanlı Erişim Kontrolü (RBAC), 5.4 Redis Kesintisinde In-Memory Fallback Risk Değerlendirmesi (+3 more)

### Community 50 - "_layout.tsx"
Cohesion: 0.13
Nodes (13): RootLayout(), RootLayoutNav(), ErrorBoundary, Props, State, styles, AppProvider(), AppProviderProps (+5 more)

### Community 51 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 52 - "main.ts"
Cohesion: 0.22
Nodes (5): AppModule, AllExceptionsFilter, bootstrap(), helmet, @nestjs/core

### Community 54 - "useAppTheme"
Cohesion: 0.27
Nodes (8): NotFoundScreen(), styles, LoadingIndicator(), LoadingIndicatorProps, styles, useAppTheme(), expo-router, react-native

### Community 55 - "index.tsx"
Cohesion: 0.47
Nodes (4): HomeScreen(), styles, useAppStore, zustand

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

## Knowledge Gaps
- **85 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `class-transformer`, `class-validator`, `passport` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 543 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `auth.controller.ts` to `api/package.json`, `app.module.ts`, `UserEntity`, `RedisService`, `main.ts`, `all-exceptions.filter.ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `class-transformer` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `zustand` connect `index.tsx` to `mobile/package.json`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `mobile/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `api/package.json`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `api/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._