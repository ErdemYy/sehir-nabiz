# Graph Report - ŞehirNabız  (2026-10-25)

## Corpus Check
- 167 files · ~49,537 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 2, (none) 1)

## Summary
- 1409 nodes · 2799 edges · 91 communities (71 shown, 20 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 120 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd4975ff`
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
- ThemeContext.tsx
- devDependencies
- design-tokens/package.json
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
- media.e2e-spec.ts
- ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)
- auth.controller.ts
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- IStorageService
- mobile/tsconfig.json
- nest-cli.json
- EventStatus
- StorageService
- shared/src/index.ts
- EventsController
- tsconfig.build.json
- env.ts
- .getUploadUrl
- ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)
- packages_shared_src_index_userrole
- RedisService
- ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)
- app/_layout.tsx
- @nestjs/common
- all-exceptions.filter.ts
- CorrelationIdMiddleware
- useAppTheme
- useAppStore.ts
- devDependencies
- UserEntity
- ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)
- event.schema.ts
- health.controller.ts
- ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)
- CategoryCode
- jest
- ZodValidationPipe
- JwtPayload
- event.types.ts
- UploadUrlDto
- NearbyEventsDto
- MediaStatus
- events.service.ts
- EventEntity
- DatabaseModule
- EventMediaEntity
- CreateEventDto
- CategoryDto
- BBoxEventsDto
- media.controller.ts
- ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)
- ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)
- ErrorBoundary
- ŞehirNabız — Medya Güvenliği ve Depolama Mimarisi (MEDIA_SECURITY.md)
- 3. Güvenlik ve Doğrulama Katmanları
- UpdateEventStatusDto
- JwtStrategy
- 7. Yerel Geliştirme ve MinIO Entegrasyonu
- AppModule
- 11. Dosya ve Dizin Değişiklikleri Özeti
- 2. Mimari Değişiklikler ve Kararlar
- 3. Veritabanı ve Migration Sonuçları

## God Nodes (most connected - your core abstractions)
1. `useAppTheme()` - 71 edges
2. `AppText()` - 44 edges
3. `@nestjs/common` - 39 edges
4. `react` - 39 edges
5. `react-native` - 36 edges
6. `EventStatus` - 35 edges
7. `UserEntity` - 34 edges
8. `EventEntity` - 32 edges
9. `EventCategory` - 28 edges
10. `CategoryEntity` - 26 edges

## Surprising Connections (you probably didn't know these)
- `4.2 Görünürlük Kuralları` --references--> `OptionalJwtAuthGuard`  [INFERRED]
  docs/architecture/MEDIA_SECURITY.md → apps/api/src/common/guards/optional-jwt-auth.guard.ts
- `Phase 4: Medya & Güvenli Depolama Altyapısı (TAMAMLANDI)` --references--> `EventMediaEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event-media.entity.ts
- `Phase 3: Coğrafi Veri & Olay Yönetimi API'si (TAMAMLANDI)` --references--> `EventEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event.entity.ts
- `1. Yönetici Özeti (Executive Summary)` --references--> `IStorageService`  [INFERRED]
  docs/PHASE_4_REPORT.md → apps/api/src/modules/storage/storage.interface.ts
- `2.2 S3 API ve Cloudflare R2 / MinIO Soyutlama Katmanı` --references--> `IStorageService`  [INFERRED]
  docs/PHASE_4_REPORT.md → apps/api/src/modules/storage/storage.interface.ts

## Import Cycles
- None detected.

## Communities (91 total, 20 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.12
Nodes (16): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI), Phase 2.5: Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü (TAMAMLANDI) (+8 more)

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
Cohesion: 0.10
Nodes (20): description, @sehir-nabiz/config, @sehir-nabiz/shared, typescript, main, name, private, version (+12 more)

### Community 6 - "api/package.json"
Cohesion: 0.06
Nodes (34): description, @sehir-nabiz/config, @sehir-nabiz/shared, @types/node, typescript, zod, name, private (+26 more)

### Community 7 - "ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)"
Cohesion: 0.22
Nodes (8): 1. Genel Özet ve Mimari Kazanımlar, 2. Oluşturulan Dizin ve Paket Yapısı, 3. Kurulan Paketler ve Sürümleri, 4. Expo SDK 58 ve MapLibre Uyumluluk Analizi, 6. Kalite ve Test Doğrulama Sonuçları, 7. Graphify Bilgi Grafı Durumu, 8. Eksik Kalanlar ve Phase 2 Önerileri, ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)

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

### Community 12 - "ThemeContext.tsx"
Cohesion: 0.09
Nodes (23): ThemeContext, ThemeContextValue, ThemeMode, ThemeProviderProps, assert, { lightTheme, darkTheme, radii, spacing }, test, darkTheme (+15 more)

### Community 13 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, source-map-support, supertest (+15 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.10
Nodes (19): description, devDependencies, @sehir-nabiz/config, @types/node, typescript, @sehir-nabiz/config, @types/node, typescript (+11 more)

### Community 16 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, cache, cache, persistent, dependsOn, $schema, tasks (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, expo, expo-constants, expo-font, @expo-google-fonts/manrope, @expo-google-fonts/plus-jakarta-sans, expo-linking, expo-router (+12 more)

### Community 18 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, clean, ios, lint, start, test, typecheck (+1 more)

### Community 19 - "EventCategory"
Cohesion: 0.11
Nodes (19): CategoryChipProps, EventCategory, ACCIDENT, CULTURAL_EVENT, DISASTER, EVENT, FIRE_OR_NATURAL_HAZARD, INFRASTRUCTURE (+11 more)

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

### Community 27 - "media.e2e-spec.ts"
Cohesion: 0.13
Nodes (14): dataSourceOptions, AccountStatus, ACTIVE, PENDING_VERIFICATION, SUSPENDED, UserRole, ADMIN, CITIZEN (+6 more)

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.14
Nodes (13): 1. Ortam Hazırlığı, 2. Docker Servislerinin Başlatılması, 3.1 Geliştirme Ortamı Dosyaları, 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı), 3. Güvenli Secret ve Ortam Değişkeni Yönetimi, 4. Veritabanı, Migration ve Seed Yönetimi (TypeORM), 5. Temel Turborepo Komutları, 6.1 Backend API (`apps/api`) (+5 more)

### Community 29 - "auth.controller.ts"
Cohesion: 0.05
Nodes (16): AuthController, AuthService, LoginDto, RefreshTokenDto, RegisterDto, AccountStatusSchema, LoginInput, LoginInputSchema (+8 more)

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
Cohesion: 0.15
Nodes (3): IStorageService, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner

### Community 34 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, extends, include, @sehir-nabiz/config/typescript/react-native.json

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "EventStatus"
Cohesion: 0.14
Nodes (12): ALLOWED_MIME_TYPES, AllowedMimeType, EventStatus, ACTIVE, DISPUTED, EXPIRED, PENDING_REVIEW, PENDING_VERIFICATION (+4 more)

### Community 38 - "shared/src/index.ts"
Cohesion: 0.20
Nodes (10): AppDataSource, run(), seedDemoEvents(), EventSeverity, CRITICAL, HIGH, LOW, MEDIUM (+2 more)

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 46 - "ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)"
Cohesion: 0.18
Nodes (10): 10. Git ve Faz Kapanışı, 11. Teknik Borçlar, 12. Phase 3 İçin Öneriler, 2. Veritabanı Tabloları ve Şema Yapısı, 3. PostGIS ve Docker Durumu, 4. Redis Durumu ve Güvenlik Davranışı, 6. Kullanılan Güvenlik Önlemleri, 7. Test Sonuçları (+2 more)

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.12
Nodes (14): InitialAuthAndPostGis1740000000000, 1. Docker ve Altyapı Servisleri Canlı Durumu, 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması, 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması, 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları, 3. Gerçek TypeORM Migration & Şema Testleri, 4. Canlı API ve Auth Uç Nokta Testleri, 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti (+6 more)

### Community 50 - "app/_layout.tsx"
Cohesion: 0.24
Nodes (9): RootLayout(), RootLayoutNav(), useAppFonts(), AppProvider(), AppProviderProps, queryClient, ThemeProvider(), expo-status-bar (+1 more)

### Community 51 - "@nestjs/common"
Cohesion: 0.14
Nodes (6): CategoryEntity, CategoriesModule, CategoriesService, EventsModule, @nestjs/common, @nestjs/typeorm

### Community 52 - "all-exceptions.filter.ts"
Cohesion: 0.20
Nodes (7): AllExceptionsFilter, CORRELATION_ID_HEADER, bootstrap(), 5. Backend Mimarisi (`apps/api`), ApiErrorResponse, helmet, @nestjs/core

### Community 54 - "useAppTheme"
Cohesion: 0.06
Nodes (86): NotFoundScreen(), styles, ShowcaseScreen(), CATEGORIES, CreateEventScreen(), FeedScreen(), MOCK_FEED_EVENTS, MapScreen() (+78 more)

### Community 55 - "useAppStore.ts"
Cohesion: 0.50
Nodes (3): AppState, useAppStore, zustand

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

### Community 57 - "UserEntity"
Cohesion: 0.13
Nodes (4): RefreshTokenEntity, UserEntity, @nestjs/config, @nestjs/jwt

### Community 58 - "ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Graphify Metrikleri, 11. Git Commit, 12. Teknik Riskler ve Alınan Önlemler, 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri, 2. Veritabanı Tabloları, 3. PostGIS Veri Tipi ve İndeksleme Stratejisi, 4. API Uç Noktaları, 5. Filtreleme ve Cursor Tabanlı Sayfalama (+6 more)

### Community 59 - "event.schema.ts"
Cohesion: 0.06
Nodes (30): Environment, EnvironmentSchema, validateEnvironment(), VerificationType, CONFIRM, DENY, RESOLVED, ApiErrorResponseSchema (+22 more)

### Community 60 - "health.controller.ts"
Cohesion: 0.21
Nodes (4): HealthController, ReadinessResponse, HealthModule, HealthCheckResponse

### Community 61 - "ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)"
Cohesion: 0.07
Nodes (27): 1. Harita Ekranı (`/` veya `/(tabs)/index`), 2. Şehir Akışı Ekranı (`/(tabs)/feed`), 3. Olay Bildir Ekranı (`/(tabs)/create`), 4. Bildirimler Ekranı (`/(tabs)/notifications`), 5. Profil ve Ayarlar Ekranı (`/(tabs)/profile`), 6. Olay Detay ve Teyit Ekranı (Planlanan Detay Ekranı), Auth Gereksinimi:, Auth Gereksinimi: (+19 more)

### Community 62 - "CategoryCode"
Cohesion: 0.17
Nodes (12): CategoryCode, ACCIDENT, DISASTER, EVENT, INFRASTRUCTURE, OTHER, POWER_OUTAGE, PUBLIC_TRANSPORT (+4 more)

### Community 63 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 64 - "ZodValidationPipe"
Cohesion: 0.18
Nodes (3): ZodValidationPipe, AuthRateLimitGuard, 5. Kimlik Doğrulama Uç Noktaları (Auth Endpoints)

### Community 65 - "JwtPayload"
Cohesion: 0.33
Nodes (4): EventsService, 1. Oluşturulan Dosyalar ve Modüller, JwtPayload, EventResponseDto

### Community 66 - "event.types.ts"
Cohesion: 0.27
Nodes (7): ApiResponse, DuplicateWarningDto, EventDetail, EventSummary, BoundingBox, GeoCoordinate, GeoRadiusQuery

### Community 67 - "UploadUrlDto"
Cohesion: 0.13
Nodes (5): UploadUrlDto, MediaModule, StorageModule, 3.5 Medya Depolama ve Güvenlik Mimarisi (`StorageModule` & `MediaModule`), 9. Graphify Bilgi Grafiği Güncellemesi

### Community 69 - "MediaStatus"
Cohesion: 0.18
Nodes (9): MediaStatus, DELETED, PENDING_UPLOAD, PROCESSING, READY, REJECTED, EventMediaDto, UploadUrlRequestDto (+1 more)

### Community 70 - "events.service.ts"
Cohesion: 0.29
Nodes (3): CreateCategoriesAndEvents1740000001000, CreateEventMedia1740000002000, typeorm

### Community 71 - "EventEntity"
Cohesion: 0.12
Nodes (3): EventEntity, EventModerationLogEntity, Index()

### Community 72 - "DatabaseModule"
Cohesion: 0.24
Nodes (5): DatabaseModule, AuthModule, RedisModule, 1. Oluşturulan Modüller ve Mimari Bileşenler, 9. Graphify Bilgi Grafı Metrikleri

### Community 77 - "media.controller.ts"
Cohesion: 0.16
Nodes (3): OptionalJwtAuthGuard, JwtAuthGuard, @nestjs/passport

### Community 78 - "ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)"
Cohesion: 0.13
Nodes (14): 1. Ürün Tasarım Vizyonu: Urban Floating UI, 2.1 Tema Karşılaştırması, 2.2 Backend Uyumlu 11 Olay Kategorisi Renkleri, 2. Renk Sistemi ve Semantic Tokenlar, 3. Tipografi Sistemi, 4. Spacing ve Radius Sistemi (4px Grid), 5. Gölge ve Yükseklik (Shadows & Elevation), 7. Animasyon Prensipleri (+6 more)

### Community 79 - "ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)"
Cohesion: 0.17
Nodes (11): 10. Karşılaşılan Zorluklar ve Çözümler, 12. Phase 5 Hazırlık Durumu ve Öneriler, 1. Yönetici Özeti (Executive Summary), 4. Medya Yükleme Yaşam Döngüsü (Upload Lifecycle), 5. Güvenlik ve Gizlilik Denetimleri, 6. Olay ve Medya İlişkisi Kuralları, 8.1 Backend API Test Özeti (Vitest), 8.2 Monorepo Doğrulama Sonuçları (+3 more)

### Community 80 - "ErrorBoundary"
Cohesion: 0.20
Nodes (4): ErrorBoundary, Props, State, styles

### Community 81 - "ŞehirNabız — Medya Güvenliği ve Depolama Mimarisi (MEDIA_SECURITY.md)"
Cohesion: 0.20
Nodes (9): 1. Mimari Genel Bakış ve Temel İlkeler, 2. Medya Yaşam Döngüsü ve Durum Makinesi, 4.1 Maksimum 3 Fotoğraf Kuralı (Pessimistic Lock), 4.2 Görünürlük Kuralları, 4. Olay ve Medya Erişim Kontrolü (Authorization & Privacy), 5. Nesne Depolama Entegrasyonu: MinIO (Dev) -> Cloudflare R2 (Prod), Durum Açıklamaları, Üretime Geçiş Konfigürasyonu (+1 more)

### Community 82 - "3. Güvenlik ve Doğrulama Katmanları"
Cohesion: 0.33
Nodes (6): 3.1 İzin Verilen MIME Türleri (MIME Whitelist), 3.2 Sihirli Bayt (Magic Bytes / File Signature) Denetimi, 3.3 Dekompresyon Bombası (Zip Bomb / Pixel Flood) Koruması, 3.4 EXIF, GPS ve Meta Veri Temizleme (Sanitization), 3.5 Bütünlük Sağlama (SHA-256 Checksum), 3. Güvenlik ve Doğrulama Katmanları

### Community 85 - "7. Yerel Geliştirme ve MinIO Entegrasyonu"
Cohesion: 0.50
Nodes (3): 7.1 Docker Compose Servisi, 7.2 Otomatik Kova (Bucket) Başlatma, 7. Yerel Geliştirme ve MinIO Entegrasyonu

### Community 88 - "11. Dosya ve Dizin Değişiklikleri Özeti"
Cohesion: 0.67
Nodes (3): 11. Dosya ve Dizin Değişiklikleri Özeti, Güncellenen Dosyalar, Yeni Eklenen Dosyalar

### Community 89 - "2. Mimari Değişiklikler ve Kararlar"
Cohesion: 0.67
Nodes (3): 2.1 Doğrudan Depolamaya Yükleme (Direct-to-Storage Presigned URL) vs Sunucu Üzerinden Yükleme (Multipart Form-Data), 2.2 S3 API ve Cloudflare R2 / MinIO Soyutlama Katmanı, 2. Mimari Değişiklikler ve Kararlar

### Community 90 - "3. Veritabanı ve Migration Sonuçları"
Cohesion: 0.67
Nodes (3): 3.1 Tablo Şeması, 3.2 Canlı Migration & Rollback Doğrulaması, 3. Veritabanı ve Migration Sonuçları

## Knowledge Gaps
- **114 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport`, `pg`, `reflect-metadata` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 823 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `ZodValidationPipe`, `IStorageService`, `EventStatus`, `api/package.json`, `events.service.ts`, `media.e2e-spec.ts`, `media.controller.ts`, `packages_shared_src_index_userrole`, `events.controller.ts`, `RedisService`, `all-exceptions.filter.ts`, `UserEntity`, `event.schema.ts`, `health.controller.ts`, `auth.controller.ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `AppText()` (e.g. with `Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi (TAMAMLANDI)` and `6. Temel UI Bileşen Kütüphanesi`) actually correct?**
  _`AppText()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport` to the rest of the system?**
  _114 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `EventStatus` connect `EventStatus` to `JwtPayload`, `event.types.ts`, `NearbyEventsDto`, `shared/src/index.ts`, `events.service.ts`, `EventEntity`, `event.schema.ts`, `UpdateEventStatusDto`, `useAppTheme`, `media.e2e-spec.ts`, `auth.controller.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `BottomSheet()` connect `useAppTheme` to `ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._