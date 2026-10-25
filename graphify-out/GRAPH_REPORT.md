# Graph Report - ŞehirNabız  (2026-10-25)

## Corpus Check
- 126 files · ~35,107 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 2, (none) 1)

## Summary
- 1176 nodes · 2017 edges · 78 communities (61 shown, 17 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 59 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e2108368`
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
- events.service.ts
- ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)
- AuthService
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- IStorageService
- mobile/tsconfig.json
- nest-cli.json
- EventStatus
- StorageService
- EventSeverity
- EventsController
- tsconfig.build.json
- env.ts
- .getUploadUrl
- ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)
- RolesGuard
- RedisService
- ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)
- _layout.tsx
- app.module.ts
- main.ts
- all-exceptions.filter.ts
- useAppTheme
- index.tsx
- devDependencies
- auth.module.ts
- ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)
- ref_zod
- health.controller.ts
- enums/index.ts
- CategoryCode
- jest
- auth.controller.ts
- JwtPayload
- event.types.ts
- media.controller.ts
- NearbyEventsDto
- MediaStatus
- index.test.ts
- event.schema.ts
- DatabaseModule
- EventMediaEntity
- CreateEventDto
- CategoryDto
- BBoxEventsDto
- OptionalJwtAuthGuard

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 39 edges
2. `UserEntity` - 34 edges
3. `EventEntity` - 32 edges
4. `EventStatus` - 30 edges
5. `CategoryEntity` - 26 edges
6. `UserRole` - 25 edges
7. `EventSeverity` - 24 edges
8. `EventCategory` - 24 edges
9. `typeorm` - 23 edges
10. `EventMediaEntity` - 22 edges

## Surprising Connections (you probably didn't know these)
- `4.2 Görünürlük Kuralları` --references--> `OptionalJwtAuthGuard`  [INFERRED]
  docs/architecture/MEDIA_SECURITY.md → apps/api/src/common/guards/optional-jwt-auth.guard.ts
- `Phase 4: Medya & Güvenli Depolama Altyapısı (TAMAMLANDI)` --references--> `EventMediaEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event-media.entity.ts
- `Phase 3: Coğrafi Veri & Olay Yönetimi API'si (TAMAMLANDI)` --references--> `EventEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event.entity.ts
- `1. Oluşturulan Dosyalar ve Modüller` --references--> `DuplicateWarningDto`  [INFERRED]
  docs/PHASE_3_REPORT.md → packages/shared/src/types/event.types.ts
- `5. Backend Mimarisi (`apps/api`)` --references--> `AllExceptionsFilter`  [INFERRED]
  docs/PHASE_1_REPORT.md → apps/api/src/common/filters/all-exceptions.filter.ts

## Import Cycles
- None detected.

## Communities (78 total, 17 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.11
Nodes (17): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI), Phase 2.5: Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü (TAMAMLANDI) (+9 more)

### Community 1 - "ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)"
Cohesion: 0.15
Nodes (12): 1. Mimari Genel Bakış, 2. Mobil Harita Kütüphanesi Seçimi ve Analizi, 3.1 Neden NestJS?, 3.2 ORM Karar Analizi: TypeORM vs Prisma vs Drizzle, 3.3 Oturum ve Token Yaşam Döngüsü (Token Rotation & Reuse Detection), 3.4 PostgreSQL + PostGIS Uzamsal (Spatial) Stratejisi, 3. Backend Mimarisi (`apps/api`: NestJS 12 + PostgreSQL/PostGIS), 4. Durum Yönetimi ve Veri Akışı (+4 more)

### Community 2 - "ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)"
Cohesion: 0.12
Nodes (16): 1.1 Konum Bulanıklaştırma (Fuzzy Location & Noise Injection), 1.2 Medya Sanitizasyonu (EXIF / Metadata Stripping), 1. Konum Gizliliği ve KVKK / GDPR Uyumu, 2.1 İtibar (Reputation / Karma) Algoritması, 2.2 Coğrafi Mükerrer Bildirim Engelleme (Spatial Deduplication), 2. Sahte Bildirim ve Spam Önleme Mekanizmaları, 3. Topluluk Moderasyonu ve Güvenilirlik Skoru, 4. Kullanım Maliyetleri ve Optimizasyon Projeksiyonu (+8 more)

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
Nodes (32): description, @sehir-nabiz/config, @sehir-nabiz/shared, @types/node, typescript, zod, name, private (+24 more)

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
Nodes (23): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, source-map-support, supertest (+15 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.11
Nodes (17): description, devDependencies, @sehir-nabiz/config, typescript, @sehir-nabiz/config, typescript, main, name (+9 more)

### Community 15 - "events.controller.ts"
Cohesion: 0.14
Nodes (3): BBoxEventsQuerySchema, CreateEventDtoSchema, NearbyEventsQuerySchema

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
Cohesion: 0.08
Nodes (25): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcryptjs, class-transformer, class-validator, helmet, ioredis (+17 more)

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

### Community 27 - "events.service.ts"
Cohesion: 0.05
Nodes (29): ROLES_KEY, AppDataSource, dataSourceOptions, CategoryEntity, EventEntity, EventModerationLogEntity, RefreshTokenEntity, UserEntity (+21 more)

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.15
Nodes (12): 1. Ortam Hazırlığı, 2. Docker Servislerinin Başlatılması, 3.1 Geliştirme Ortamı Dosyaları, 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı), 3. Güvenli Secret ve Ortam Değişkeni Yönetimi, 4. Veritabanı, Migration ve Seed Yönetimi (TypeORM), 5. Temel Turborepo Komutları, 6.1 Backend API (`apps/api`) (+4 more)

### Community 29 - "AuthService"
Cohesion: 0.06
Nodes (12): AuthController, AuthService, LoginDto, RefreshTokenDto, RegisterDto, LoginInput, RefreshTokenInput, RegisterInput (+4 more)

### Community 30 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, jsx, lib, moduleResolution, extends, ./base.json, $schema

### Community 31 - "ŞehirNabız (Pulse of the City) 🏙️⚡"
Cohesion: 0.22
Nodes (8): 📚 Dokümantasyon Bağlantıları, Gereksinimler, 🛠️ Hızlı Başlangıç, Kurulum, 📦 Monorepo Klasör Yapısı, 🚀 Proje Mimarisi Özeti, Uygulamaları Çalıştırma, ŞehirNabız (Pulse of the City) 🏙️⚡

### Community 32 - "api/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, baseUrl, outDir, paths, extends, include, @sehir-nabiz/config/typescript/node.json

### Community 33 - "IStorageService"
Cohesion: 0.07
Nodes (18): IStorageService, 1. Mimari Genel Bakış ve Temel İlkeler, 2. Medya Yaşam Döngüsü ve Durum Makinesi, 3.1 İzin Verilen MIME Türleri (MIME Whitelist), 3.2 Sihirli Bayt (Magic Bytes / File Signature) Denetimi, 3.3 Dekompresyon Bombası (Zip Bomb / Pixel Flood) Koruması, 3.4 EXIF, GPS ve Meta Veri Temizleme (Sanitization), 3.5 Bütünlük Sağlama (SHA-256 Checksum) (+10 more)

### Community 34 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, extends, include, @sehir-nabiz/config/typescript/react-native.json

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "EventStatus"
Cohesion: 0.14
Nodes (10): UpdateEventStatusDto, EventStatus, ACTIVE, DISPUTED, EXPIRED, PENDING_REVIEW, PENDING_VERIFICATION, REJECTED (+2 more)

### Community 38 - "EventSeverity"
Cohesion: 0.21
Nodes (9): ALLOWED_MIME_TYPES, AllowedMimeType, EventSeverity, CRITICAL, HIGH, LOW, MEDIUM, class-transformer (+1 more)

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 46 - "ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)"
Cohesion: 0.18
Nodes (10): 10. Git ve Faz Kapanışı, 11. Teknik Borçlar, 12. Phase 3 İçin Öneriler, 2. Veritabanı Tabloları ve Şema Yapısı, 3. PostGIS ve Docker Durumu, 4. Redis Durumu ve Güvenlik Davranışı, 6. Kullanılan Güvenlik Önlemleri, 7. Test Sonuçları (+2 more)

### Community 48 - "RedisService"
Cohesion: 0.14
Nodes (3): AuthRateLimitGuard, RedisService, ioredis

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.12
Nodes (14): InitialAuthAndPostGis1740000000000, 1. Docker ve Altyapı Servisleri Canlı Durumu, 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması, 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması, 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları, 3. Gerçek TypeORM Migration & Şema Testleri, 4. Canlı API ve Auth Uç Nokta Testleri, 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti (+6 more)

### Community 50 - "_layout.tsx"
Cohesion: 0.16
Nodes (9): RootLayout(), RootLayoutNav(), ErrorBoundary, AppProvider(), AppProviderProps, queryClient, expo-status-bar, react-native-safe-area-context (+1 more)

### Community 51 - "app.module.ts"
Cohesion: 0.14
Nodes (9): Environment, EnvironmentSchema, validateEnvironment(), CategoriesModule, EventsModule, MediaModule, StorageModule, 3.5 Medya Depolama ve Güvenlik Mimarisi (`StorageModule` & `MediaModule`) (+1 more)

### Community 52 - "main.ts"
Cohesion: 0.22
Nodes (5): AppModule, AllExceptionsFilter, bootstrap(), helmet, @nestjs/core

### Community 54 - "useAppTheme"
Cohesion: 0.18
Nodes (12): NotFoundScreen(), styles, Props, State, styles, LoadingIndicator(), LoadingIndicatorProps, styles (+4 more)

### Community 55 - "index.tsx"
Cohesion: 0.32
Nodes (5): HomeScreen(), styles, AppState, useAppStore, zustand

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

### Community 57 - "auth.module.ts"
Cohesion: 0.27
Nodes (5): JwtStrategy, @nestjs/config, @nestjs/jwt, @nestjs/passport, passport-jwt

### Community 58 - "ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Graphify Metrikleri, 11. Git Commit, 12. Teknik Riskler ve Alınan Önlemler, 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri, 2. Veritabanı Tabloları, 3. PostGIS Veri Tipi ve İndeksleme Stratejisi, 4. API Uç Noktaları, 5. Filtreleme ve Cursor Tabanlı Sayfalama (+6 more)

### Community 59 - "ref_zod"
Cohesion: 0.16
Nodes (8): ApiErrorResponseSchema, HealthCheckResponseSchema, BoundingBoxSchema, GeoCoordinateSchema, GeoRadiusQuerySchema, MediaMimeTypeSchema, UploadUrlInput, UploadUrlInputSchema

### Community 60 - "health.controller.ts"
Cohesion: 0.16
Nodes (4): HealthController, ReadinessResponse, HealthModule, HealthCheckResponse

### Community 61 - "enums/index.ts"
Cohesion: 0.18
Nodes (9): VerificationType, CONFIRM, DENY, RESOLVED, AccountStatusSchema, LoginInputSchema, RefreshTokenInputSchema, RegisterInputSchema (+1 more)

### Community 62 - "CategoryCode"
Cohesion: 0.17
Nodes (12): CategoryCode, ACCIDENT, DISASTER, EVENT, INFRASTRUCTURE, OTHER, POWER_OUTAGE, PUBLIC_TRANSPORT (+4 more)

### Community 63 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 64 - "auth.controller.ts"
Cohesion: 0.14
Nodes (3): ZodValidationPipe, JwtAuthGuard, 5. Kimlik Doğrulama Uç Noktaları (Auth Endpoints)

### Community 65 - "JwtPayload"
Cohesion: 0.34
Nodes (5): EventsService, 1. Oluşturulan Dosyalar ve Modüller, JwtPayload, EventResponseDto, PaginatedEventsResponse

### Community 66 - "event.types.ts"
Cohesion: 0.39
Nodes (6): DuplicateWarningDto, EventDetail, EventSummary, BoundingBox, GeoCoordinate, GeoRadiusQuery

### Community 69 - "MediaStatus"
Cohesion: 0.18
Nodes (9): MediaStatus, DELETED, PENDING_UPLOAD, PROCESSING, READY, REJECTED, EventMediaDto, UploadUrlRequestDto (+1 more)

### Community 71 - "event.schema.ts"
Cohesion: 0.15
Nodes (12): BBoxEventsQueryInput, CategoryCodeSchema, CreateEventInput, EventCategorySchema, EventSeveritySchema, EventStatusSchema, NearbyEventsQueryInput, UpdateEventStatusInput (+4 more)

### Community 72 - "DatabaseModule"
Cohesion: 0.22
Nodes (5): DatabaseModule, AuthModule, RedisModule, 1. Oluşturulan Modüller ve Mimari Bileşenler, 9. Graphify Bilgi Grafı Metrikleri

## Knowledge Gaps
- **112 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport`, `pg`, `reflect-metadata` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 734 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `events.service.ts` to `auth.controller.ts`, `IStorageService`, `media.controller.ts`, `api/package.json`, `DatabaseModule`, `OptionalJwtAuthGuard`, `events.controller.ts`, `RedisService`, `app.module.ts`, `main.ts`, `all-exceptions.filter.ts`, `auth.module.ts`, `ref_zod`, `health.controller.ts`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `zustand` connect `index.tsx` to `mobile/package.json`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `EventEntity` connect `events.service.ts` to `1. Geliştirme Fazları`, `EventMediaEntity`, `EventStatus`, `EventSeverity`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `mobile/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._