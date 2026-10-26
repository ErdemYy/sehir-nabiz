# Graph Report - ŞehirNabız  (2026-10-26)

## Corpus Check
- 189 files · ~84,585 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .xml 10, (none) 2, .example 2)

## Summary
- 1570 nodes · 3144 edges · 99 communities (82 shown, 17 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 176 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `044d9906`
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
- (tabs)/index.tsx
- tasks
- dependencies
- scripts
- map.types.ts
- dependencies
- compilerOptions
- compilerOptions
- compilerOptions
- scripts
- 2. Phase 6 Mimari ve Kurulum Adımları
- config/package.json
- auth.service.ts
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
- ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu
- ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)
- useAppTheme
- RedisService
- ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)
- app/_layout.tsx
- EventCategory
- main.ts
- app.module.ts
- react
- JwtPayload
- devDependencies
- UserEntity
- ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)
- event.schema.ts
- health.controller.ts
- ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)
- CategoryCode
- jest
- media.e2e-spec.ts
- events.service.ts
- event.types.ts
- CreateEventDto
- MainApplication.kt
- 11. Dosya ve Dizin Değişiklikleri Özeti
- data-source.ts
- MainActivity.kt
- media.service.ts
- ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)
- 1. Oluşturulan Dosyalar ve Modüller
- generate-assets.js
- @nestjs/common
- ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)
- ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)
- ErrorBoundary
- 3. Güvenlik ve Doğrulama Katmanları
- BBoxEventsDto
- NearbyEventsDto
- auth.module.ts
- 7. Yerel Geliştirme ve MinIO Entegrasyonu
- FloatingTabBar
- LoadingIndicator.tsx
- StatusBadge.tsx
- UpdateEventStatusDto
- useAppStore.ts
- 4. Olay ve Medya Erişim Kontrolü (Authorization & Privacy)
- 2. Mimari Değişiklikler ve Kararlar
- 3. Veritabanı ve Migration Sonuçları
- 8. Test Sonuçları ve Kapsam

## God Nodes (most connected - your core abstractions)
1. `useAppTheme()` - 76 edges
2. `AppText()` - 47 edges
3. `react` - 43 edges
4. `@nestjs/common` - 39 edges
5. `react-native` - 39 edges
6. `EventStatus` - 36 edges
7. `UserEntity` - 34 edges
8. `EventEntity` - 32 edges
9. `EventCategory` - 30 edges
10. `EventSeverity` - 29 edges

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

## Communities (99 total, 17 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.12
Nodes (15): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI), Phase 2.5: Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü (TAMAMLANDI) (+7 more)

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
Cohesion: 0.09
Nodes (22): description, @sehir-nabiz/config, @sehir-nabiz/shared, typescript, main, name, private, version (+14 more)

### Community 6 - "api/package.json"
Cohesion: 0.05
Nodes (34): description, @sehir-nabiz/config, @sehir-nabiz/shared, @types/node, typescript, zod, name, private (+26 more)

### Community 7 - "ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)"
Cohesion: 0.15
Nodes (11): 1. Genel Özet ve Mimari Kazanımlar, 2. Oluşturulan Dizin ve Paket Yapısı, 3. Kurulan Paketler ve Sürümleri, 4. Expo SDK 58 ve MapLibre Uyumluluk Analizi, 5. Backend Mimarisi (`apps/api`), 6. Kalite ve Test Doğrulama Sonuçları, 7. Graphify Bilgi Grafı Durumu, 8. Eksik Kalanlar ve Phase 2 Önerileri (+3 more)

### Community 8 - "expo"
Cohesion: 0.07
Nodes (28): backgroundColor, adaptiveIcon, package, permissions, typedRoutes, expo, android, experiments (+20 more)

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
Cohesion: 0.06
Nodes (32): ThemeContext, ThemeContextValue, ThemeMode, ThemeProviderProps, assert, { palette }, test, assert (+24 more)

### Community 13 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, source-map-support, supertest (+15 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.10
Nodes (19): description, devDependencies, @sehir-nabiz/config, @types/node, typescript, @sehir-nabiz/config, @types/node, typescript (+11 more)

### Community 15 - "(tabs)/index.tsx"
Cohesion: 0.10
Nodes (3): CATEGORIES, MOCK_FEED_EVENTS, CATEGORIES_LIST

### Community 16 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, cache, cache, persistent, dependsOn, $schema, tasks (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, expo, expo-constants, expo-dev-client, expo-font, @expo-google-fonts/manrope, @expo-google-fonts/plus-jakarta-sans, expo-linking (+16 more)

### Community 18 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, clean, ios, lint, start, test, typecheck (+1 more)

### Community 19 - "map.types.ts"
Cohesion: 0.12
Nodes (21): MapLayerSheetProps, PulseMapViewProps, MAP_CONFIG, useEventsBbox(), UseEventsBboxOptions, UseEventsBboxResult, FALLBACK_DEMO_EVENTS, fetchEventsBbox() (+13 more)

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

### Community 25 - "2. Phase 6 Mimari ve Kurulum Adımları"
Cohesion: 0.15
Nodes (12): 1.1 Peer Dependency & New Architecture İncelemesi, 1.2 Expo Go vs Expo Development Client (Prebuild), 1. Uyumluluk Durumu Analizi, 2.1 Paket Bağımlılıkları, 2.2 Expo Config Plugin Yapılandırması (`apps/mobile/app.json`), 2.3 Expo Prebuild Süreci, 2.4 Yerel Derleme ve Çalıştırma (Native Build), 2. Phase 6 Mimari ve Kurulum Adımları (+4 more)

### Community 26 - "config/package.json"
Cohesion: 0.20
Nodes (9): dependencies, prettier, description, files, prettier, main, name, private (+1 more)

### Community 27 - "auth.service.ts"
Cohesion: 0.11
Nodes (13): ROLES_KEY, RolesGuard, AccountStatus, ACTIVE, PENDING_VERIFICATION, SUSPENDED, UserRole, ADMIN (+5 more)

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.11
Nodes (17): 1. Ortam Hazırlığı, 2. Docker Servislerinin Başlatılması, 3.1 Geliştirme Ortamı Dosyaları, 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı), 3. Güvenli Secret ve Ortam Değişkeni Yönetimi, 4. Veritabanı, Migration ve Seed Yönetimi (TypeORM), 5. Temel Turborepo Komutları, 6.1 Backend API (`apps/api`) (+9 more)

### Community 29 - "auth.controller.ts"
Cohesion: 0.06
Nodes (15): AuthController, AuthService, LoginDto, RefreshTokenDto, RegisterDto, AccountStatusSchema, LoginInput, LoginInputSchema (+7 more)

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
Cohesion: 0.18
Nodes (3): IStorageService, 5. Nesne Depolama Entegrasyonu: MinIO (Dev) -> Cloudflare R2 (Prod), Üretime Geçiş Konfigürasyonu

### Community 34 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, extends, include, @sehir-nabiz/config/typescript/react-native.json

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "EventStatus"
Cohesion: 0.08
Nodes (11): EventEntity, EventModerationLogEntity, EventStatus, ACTIVE, DISPUTED, EXPIRED, PENDING_REVIEW, PENDING_VERIFICATION (+3 more)

### Community 37 - "StorageService"
Cohesion: 0.07
Nodes (7): UploadUrlDto, MediaController, MediaService, StorageService, EventMediaDto, UploadUrlRequestDto, UploadUrlResponseDto

### Community 38 - "shared/src/index.ts"
Cohesion: 0.20
Nodes (10): AppDataSource, run(), seedDemoEvents(), EventSeverity, CRITICAL, HIGH, LOW, MEDIUM (+2 more)

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 45 - "ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu"
Cohesion: 0.10
Nodes (20): 10. Test ve Kalite Güvence Sonuçları, 11. Performans & 60 FPS Değerlendirmesi, 12. Güvenlik, Gizlilik ve KVKK Standartları, 13. Karşılaşılan Zorluklar ve Çözümleri, 1. Yönetici Özeti (Executive Summary), 2.1 Teknoloji Yığını ve Uyum Matrisi, 2.2 Neden MapLibre React Native 11.5.0?, 2. Mimari Kararlar ve Uyumluluk Analizi (+12 more)

### Community 46 - "ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)"
Cohesion: 0.11
Nodes (15): DatabaseModule, AuthModule, RedisModule, 10. Git ve Faz Kapanışı, 11. Teknik Borçlar, 12. Phase 3 İçin Öneriler, 1. Oluşturulan Modüller ve Mimari Bileşenler, 2. Veritabanı Tabloları ve Şema Yapısı (+7 more)

### Community 47 - "useAppTheme"
Cohesion: 0.22
Nodes (43): ShowcaseScreen(), CreateEventScreen(), FeedScreen(), MapScreen(), NotificationsScreen(), ProfileScreen(), MapScreenLayout(), AppAvatar() (+35 more)

### Community 48 - "RedisService"
Cohesion: 0.11
Nodes (4): ZodValidationPipe, AuthRateLimitGuard, RedisService, 5. Kimlik Doğrulama Uç Noktaları (Auth Endpoints)

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.15
Nodes (12): 1. Docker ve Altyapı Servisleri Canlı Durumu, 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması, 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması, 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları, 4. Canlı API ve Auth Uç Nokta Testleri, 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti, 5.2 NestJS ValidationPipe ve DTO Güvenliği, 5.3 Rol Tabanlı Erişim Kontrolü (RBAC) (+4 more)

### Community 50 - "app/_layout.tsx"
Cohesion: 0.22
Nodes (10): RootLayout(), RootLayoutNav(), useAppFonts(), AppProvider(), AppProviderProps, queryClient, ThemeProvider(), 4. Tema Sistemi (+2 more)

### Community 51 - "EventCategory"
Cohesion: 0.11
Nodes (19): CategoryChipProps, EventCategory, ACCIDENT, CULTURAL_EVENT, DISASTER, EVENT, FIRE_OR_NATURAL_HAZARD, INFRASTRUCTURE (+11 more)

### Community 52 - "main.ts"
Cohesion: 0.22
Nodes (5): AppModule, AllExceptionsFilter, bootstrap(), helmet, @nestjs/core

### Community 53 - "app.module.ts"
Cohesion: 0.16
Nodes (9): CorrelationIdMiddleware, Environment, EnvironmentSchema, validateEnvironment(), MediaModule, StorageModule, 3.5 Medya Depolama ve Güvenlik Mimarisi (`StorageModule` & `MediaModule`), 9. Graphify Bilgi Grafiği Güncellemesi (+1 more)

### Community 54 - "react"
Cohesion: 0.08
Nodes (38): MOCK_NOTIFICATIONS, MapScreenLayoutProps, AppAvatarProps, AvatarSize, AppButtonProps, ButtonSize, ButtonVariant, AppCardProps (+30 more)

### Community 55 - "JwtPayload"
Cohesion: 0.29
Nodes (4): EventsService, JwtPayload, EventResponseDto, PaginatedEventsResponse

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

### Community 57 - "UserEntity"
Cohesion: 0.12
Nodes (3): RefreshTokenEntity, UserEntity, Index()

### Community 58 - "ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Graphify Metrikleri, 11. Git Commit, 12. Teknik Riskler ve Alınan Önlemler, 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri, 2. Veritabanı Tabloları, 3. PostGIS Veri Tipi ve İndeksleme Stratejisi, 4. API Uç Noktaları, 5. Filtreleme ve Cursor Tabanlı Sayfalama (+6 more)

### Community 59 - "event.schema.ts"
Cohesion: 0.07
Nodes (27): VerificationType, CONFIRM, DENY, RESOLVED, ApiErrorResponseSchema, HealthCheckResponseSchema, BBoxEventsQueryInput, BBoxEventsQuerySchema (+19 more)

### Community 60 - "health.controller.ts"
Cohesion: 0.16
Nodes (4): HealthController, ReadinessResponse, HealthModule, HealthCheckResponse

### Community 61 - "ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)"
Cohesion: 0.07
Nodes (26): 1. Harita Ekranı (`/` veya `/(tabs)/index`), 2. Şehir Akışı Ekranı (`/(tabs)/feed`), 3. Olay Bildir Ekranı (`/(tabs)/create`), 4. Bildirimler Ekranı (`/(tabs)/notifications`), 5. Profil ve Ayarlar Ekranı (`/(tabs)/profile`), 6. Olay Detay ve Teyit Ekranı (Planlanan Detay Ekranı), Auth Gereksinimi:, Auth Gereksinimi: (+18 more)

### Community 62 - "CategoryCode"
Cohesion: 0.17
Nodes (12): CategoryCode, ACCIDENT, DISASTER, EVENT, INFRASTRUCTURE, OTHER, POWER_OUTAGE, PUBLIC_TRANSPORT (+4 more)

### Community 63 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 64 - "media.e2e-spec.ts"
Cohesion: 0.26
Nodes (3): dataSourceOptions, bcryptjs, vitest

### Community 66 - "event.types.ts"
Cohesion: 0.39
Nodes (6): DuplicateWarningDto, EventDetail, EventSummary, BoundingBox, GeoCoordinate, GeoRadiusQuery

### Community 69 - "11. Dosya ve Dizin Değişiklikleri Özeti"
Cohesion: 0.67
Nodes (3): 11. Dosya ve Dizin Değişiklikleri Özeti, Güncellenen Dosyalar, Yeni Eklenen Dosyalar

### Community 70 - "data-source.ts"
Cohesion: 0.21
Nodes (4): InitialAuthAndPostGis1740000000000, CreateCategoriesAndEvents1740000001000, CreateEventMedia1740000002000, 3. Gerçek TypeORM Migration & Şema Testleri

### Community 73 - "media.service.ts"
Cohesion: 0.13
Nodes (10): EventMediaEntity, ALLOWED_MIME_TYPES, AllowedMimeType, MediaStatus, DELETED, PENDING_UPLOAD, PROCESSING, READY (+2 more)

### Community 74 - "ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)"
Cohesion: 0.17
Nodes (11): 10. Commit Hash, 11. Eksik Cihaz Testleri (Açık Beyan), 12. Phase 6 Hazırlık Durumu ve Öneriler, 2. Tasarım Tokenları (`@sehir-nabiz/design-tokens`), 3. Navigasyon Mimarisi, 5. Animasyon Altyapısı, 7. Expo Uyumluluk Durumu, 8. Test Sonuçları ve Kapsam (+3 more)

### Community 75 - "1. Oluşturulan Dosyalar ve Modüller"
Cohesion: 0.13
Nodes (7): CategoriesController, CategoriesModule, CategoriesService, EventsModule, 1. Oluşturulan Dosyalar ve Modüller, CategoryDto, @nestjs/typeorm

### Community 76 - "generate-assets.js"
Cohesion: 0.29
Nodes (4): fs, generateAssets(), path, sharp

### Community 77 - "@nestjs/common"
Cohesion: 0.13
Nodes (5): OptionalJwtAuthGuard, CORRELATION_ID_HEADER, JwtAuthGuard, ioredis, @nestjs/common

### Community 78 - "ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)"
Cohesion: 0.12
Nodes (15): 1. Ürün Tasarım Vizyonu: Urban Floating UI, 2.1 Tema Karşılaştırması, 2.2 Backend Uyumlu 11 Olay Kategorisi Renkleri, 2. Renk Sistemi ve Semantic Tokenlar, 3. Tipografi Sistemi, 4. Spacing ve Radius Sistemi (4px Grid), 5. Gölge ve Yükseklik (Shadows & Elevation), 7. Animasyon Prensipleri (+7 more)

### Community 79 - "ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)"
Cohesion: 0.22
Nodes (8): 10. Karşılaşılan Zorluklar ve Çözümler, 12. Phase 5 Hazırlık Durumu ve Öneriler, 1. Yönetici Özeti (Executive Summary), 4. Medya Yükleme Yaşam Döngüsü (Upload Lifecycle), 5. Güvenlik ve Gizlilik Denetimleri, 6. Olay ve Medya İlişkisi Kuralları, Phase 5 Hedefleri (Mobil Temel, Navigasyon & Durum Yönetimi):, ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)

### Community 80 - "ErrorBoundary"
Cohesion: 0.20
Nodes (4): ErrorBoundary, Props, State, styles

### Community 81 - "3. Güvenlik ve Doğrulama Katmanları"
Cohesion: 0.18
Nodes (10): 1. Mimari Genel Bakış ve Temel İlkeler, 2. Medya Yaşam Döngüsü ve Durum Makinesi, 3.1 İzin Verilen MIME Türleri (MIME Whitelist), 3.2 Sihirli Bayt (Magic Bytes / File Signature) Denetimi, 3.3 Dekompresyon Bombası (Zip Bomb / Pixel Flood) Koruması, 3.4 EXIF, GPS ve Meta Veri Temizleme (Sanitization), 3.5 Bütünlük Sağlama (SHA-256 Checksum), 3. Güvenlik ve Doğrulama Katmanları (+2 more)

### Community 84 - "auth.module.ts"
Cohesion: 0.27
Nodes (5): JwtStrategy, @nestjs/config, @nestjs/jwt, @nestjs/passport, passport-jwt

### Community 85 - "7. Yerel Geliştirme ve MinIO Entegrasyonu"
Cohesion: 0.50
Nodes (3): 7.1 Docker Compose Servisi, 7.2 Otomatik Kova (Bucket) Başlatma, 7. Yerel Geliştirme ve MinIO Entegrasyonu

### Community 86 - "FloatingTabBar"
Cohesion: 0.29
Nodes (6): NotFoundScreen(), styles, TabsLayout(), FloatingTabBar(), 9. Graphify Bilgi Grafiği Güncellemesi, expo-router

### Community 88 - "LoadingIndicator.tsx"
Cohesion: 0.50
Nodes (3): LoadingIndicator(), LoadingIndicatorProps, styles

### Community 89 - "StatusBadge.tsx"
Cohesion: 0.48
Nodes (5): AppBadgeProps, BadgeSize, BadgeType, BadgeVariant, StatusBadgeProps

### Community 94 - "useAppStore.ts"
Cohesion: 0.50
Nodes (3): AppState, useAppStore, zustand

### Community 95 - "4. Olay ve Medya Erişim Kontrolü (Authorization & Privacy)"
Cohesion: 0.67
Nodes (3): 4.1 Maksimum 3 Fotoğraf Kuralı (Pessimistic Lock), 4.2 Görünürlük Kuralları, 4. Olay ve Medya Erişim Kontrolü (Authorization & Privacy)

### Community 96 - "2. Mimari Değişiklikler ve Kararlar"
Cohesion: 0.67
Nodes (3): 2.1 Doğrudan Depolamaya Yükleme (Direct-to-Storage Presigned URL) vs Sunucu Üzerinden Yükleme (Multipart Form-Data), 2.2 S3 API ve Cloudflare R2 / MinIO Soyutlama Katmanı, 2. Mimari Değişiklikler ve Kararlar

### Community 97 - "3. Veritabanı ve Migration Sonuçları"
Cohesion: 0.67
Nodes (3): 3.1 Tablo Şeması, 3.2 Canlı Migration & Rollback Doğrulaması, 3. Veritabanı ve Migration Sonuçları

### Community 98 - "8. Test Sonuçları ve Kapsam"
Cohesion: 0.67
Nodes (3): 8.1 Backend API Test Özeti (Vitest), 8.2 Monorepo Doğrulama Sonuçları, 8. Test Sonuçları ve Kapsam

## Knowledge Gaps
- **116 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport`, `pg`, `reflect-metadata` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 903 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EventStatus` connect `EventStatus` to `media.e2e-spec.ts`, `events.service.ts`, `event.types.ts`, `shared/src/index.ts`, `media.service.ts`, `event.schema.ts`, `1. Oluşturulan Dosyalar ve Modüller`, `ThemeContext.tsx`, `(tabs)/index.tsx`, `NearbyEventsDto`, `map.types.ts`, `JwtPayload`, `StatusBadge.tsx`, `auth.service.ts`, `UpdateEventStatusDto`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AppText()` (e.g. with `Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi (TAMAMLANDI)` and `6. Temel UI Bileşen Kütüphanesi`) actually correct?**
  _`AppText()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `media.e2e-spec.ts`, `events.service.ts`, `api/package.json`, `data-source.ts`, `auth.service.ts`, `events.controller.ts`, `media.service.ts`, `1. Oluşturulan Dosyalar ve Modüller`, `main.ts`, `app.module.ts`, `auth.module.ts`, `event.schema.ts`, `health.controller.ts`, `auth.controller.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `Kullanıcı Etkileşimleri:` connect `useAppTheme` to `map.types.ts`, `ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._