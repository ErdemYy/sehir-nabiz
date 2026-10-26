# Graph Report - ŞehirNabız  (2026-10-26)

## Corpus Check
- 206 files · ~95,472 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .xml 10, (none) 2, .example 2)

## Summary
- 1656 nodes · 3457 edges · 100 communities (80 shown, 20 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 179 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `36837b2d`
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
- UserRole
- ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)
- auth.controller.ts
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- IStorageService
- mobile/tsconfig.json
- nest-cli.json
- UserEntity
- StorageService
- EventStatus
- EventsController
- tsconfig.build.json
- CreateEventFlow.tsx
- ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu
- RedisService
- useAppTheme
- ŞehirNabız — Phase 6.5: Android Native Doğrulama, Demo Veri Güvenliği ve Harita Kalite Kontrol Raporu
- ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)
- app/_layout.tsx
- EventCategory
- main.ts
- UploadUrlDto
- react
- EventResponseDto
- devDependencies
- .getUploadUrl
- ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)
- event.schema.ts
- ThemeContextValue
- ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)
- CategoryCode
- jest
- shared/src/index.ts
- phase_7.test.js
- event.types.ts
- CreateEventDto
- MainApplication.kt
- MediaStatus
- data-source.ts
- events.controller.ts
- MainActivity.kt
- EventMediaEntity
- ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)
- CategoryEntity
- generate-assets.js
- @nestjs/common
- ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)
- ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)
- ErrorBoundary
- OptionalJwtAuthGuard
- BBoxEventsDto
- NearbyEventsDto
- tokens.test.ts
- geoUtils.ts
- FloatingTabBar.tsx
- eventsApi.ts
- map.test.js
- UpdateEventStatusDto
- phase_6_5.test.js
- .generateUploadUrl
- CategoryDto
- PulseMapView
- api.types.ts
- create.tsx

## God Nodes (most connected - your core abstractions)
1. `useAppTheme()` - 84 edges
2. `AppText()` - 55 edges
3. `react` - 48 edges
4. `react-native` - 47 edges
5. `@nestjs/common` - 39 edges
6. `EventStatus` - 36 edges
7. `UserEntity` - 34 edges
8. `EventEntity` - 32 edges
9. `EventSeverity` - 31 edges
10. `EventCategory` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Phase 4: Medya & Güvenli Depolama Altyapısı (TAMAMLANDI)` --references--> `EventMediaEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event-media.entity.ts
- `Phase 3: Coğrafi Veri & Olay Yönetimi API'si (TAMAMLANDI)` --references--> `EventEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event.entity.ts
- `3. Gerçek TypeORM Migration & Şema Testleri` --references--> `InitialAuthAndPostGis1740000000000`  [INFERRED]
  docs/PHASE_2_5_VERIFICATION.md → apps/api/src/database/migrations/1740000000000-InitialAuthAndPostGis.ts
- `1. Yönetici Özeti (Executive Summary)` --references--> `IStorageService`  [INFERRED]
  docs/PHASE_4_REPORT.md → apps/api/src/modules/storage/storage.interface.ts
- `Yeni Eklenen Dosyalar` --references--> `IStorageService`  [INFERRED]
  docs/PHASE_4_REPORT.md → apps/api/src/modules/storage/storage.interface.ts

## Import Cycles
- None detected.

## Communities (100 total, 20 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.12
Nodes (16): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI), Phase 2.5: Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü (TAMAMLANDI) (+8 more)

### Community 1 - "ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)"
Cohesion: 0.14
Nodes (13): 1. Mimari Genel Bakış, 2. Mobil Harita Kütüphanesi Seçimi ve Analizi, 3.1 Neden NestJS?, 3.2 ORM Karar Analizi: TypeORM vs Prisma vs Drizzle, 3.3 Oturum ve Token Yaşam Döngüsü (Token Rotation & Reuse Detection), 3.4 PostgreSQL + PostGIS Uzamsal (Spatial) Stratejisi, 3.5 Medya Depolama ve Güvenlik Mimarisi (`StorageModule` & `MediaModule`), 3. Backend Mimarisi (`apps/api`: NestJS 12 + PostgreSQL/PostGIS) (+5 more)

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
Cohesion: 0.08
Nodes (24): description, @sehir-nabiz/config, @sehir-nabiz/shared, typescript, main, name, private, version (+16 more)

### Community 6 - "api/package.json"
Cohesion: 0.06
Nodes (33): description, @sehir-nabiz/config, @sehir-nabiz/shared, @types/node, typescript, zod, name, private (+25 more)

### Community 7 - "ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)"
Cohesion: 0.22
Nodes (8): 1. Genel Özet ve Mimari Kazanımlar, 2. Oluşturulan Dizin ve Paket Yapısı, 3. Kurulan Paketler ve Sürümleri, 4. Expo SDK 58 ve MapLibre Uyumluluk Analizi, 6. Kalite ve Test Doğrulama Sonuçları, 7. Graphify Bilgi Grafı Durumu, 8. Eksik Kalanlar ve Phase 2 Önerileri, ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)

### Community 8 - "expo"
Cohesion: 0.06
Nodes (30): backgroundColor, adaptiveIcon, package, permissions, typedRoutes, expo, android, experiments (+22 more)

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
Cohesion: 0.17
Nodes (7): ThemeContext, ThemeMode, ThemeProviderProps, darkTheme, lightTheme, palette, ThemeColors

### Community 13 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, source-map-support, supertest (+15 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.10
Nodes (19): description, devDependencies, @sehir-nabiz/config, @types/node, typescript, @sehir-nabiz/config, @types/node, typescript (+11 more)

### Community 15 - "(tabs)/index.tsx"
Cohesion: 0.08
Nodes (8): NotFoundScreen(), styles, MOCK_FEED_EVENTS, CATEGORIES_LIST, MOCK_NOTIFICATIONS, LAYER_OPTIONS, expo-router, @maplibre/maplibre-react-native

### Community 16 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, cache, cache, persistent, dependsOn, $schema, tasks (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-dev-client, expo-file-system, expo-font, @expo-google-fonts/manrope, @expo-google-fonts/plus-jakarta-sans (+19 more)

### Community 18 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, clean, ios, lint, start, test, typecheck (+1 more)

### Community 19 - "map.types.ts"
Cohesion: 0.27
Nodes (7): MapLayerSheetProps, PulseMapViewProps, MAP_CONFIG, MapEventProperties, MapStyleMode, UserLocationState, expo-location

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

### Community 27 - "UserRole"
Cohesion: 0.12
Nodes (12): ROLES_KEY, RolesGuard, AccountStatus, ACTIVE, PENDING_VERIFICATION, SUSPENDED, UserRole, ADMIN (+4 more)

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.11
Nodes (17): 1. Ortam Hazırlığı, 2. Docker Servislerinin Başlatılması, 3.1 Geliştirme Ortamı Dosyaları, 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı), 3. Güvenli Secret ve Ortam Değişkeni Yönetimi, 4. Veritabanı, Migration ve Seed Yönetimi (TypeORM), 5. Temel Turborepo Komutları, 6.1 Backend API (`apps/api`) (+9 more)

### Community 29 - "auth.controller.ts"
Cohesion: 0.06
Nodes (20): AuthController, AuthService, LoginDto, RefreshTokenDto, RegisterDto, authApi, AuthApiError, secureTokenStorage (+12 more)

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
Cohesion: 0.17
Nodes (4): IStorageService, 2.1 Doğrudan Depolamaya Yükleme (Direct-to-Storage Presigned URL) vs Sunucu Üzerinden Yükleme (Multipart Form-Data), 2.2 S3 API ve Cloudflare R2 / MinIO Soyutlama Katmanı, 2. Mimari Değişiklikler ve Kararlar

### Community 34 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, extends, include, @sehir-nabiz/config/typescript/react-native.json

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "UserEntity"
Cohesion: 0.08
Nodes (4): EventEntity, EventModerationLogEntity, UserEntity, Index()

### Community 37 - "StorageService"
Cohesion: 0.18
Nodes (3): MediaService, StorageService, EventMediaDto

### Community 38 - "EventStatus"
Cohesion: 0.12
Nodes (18): ALLOWED_MIME_TYPES, AllowedMimeType, EventSeverity, CRITICAL, HIGH, LOW, MEDIUM, EventStatus (+10 more)

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 41 - "CreateEventFlow.tsx"
Cohesion: 0.16
Nodes (17): AuthModalProps, styles, useAuthStore, styles, styles, LocationPickerModalProps, styles, PhotoPickerSection() (+9 more)

### Community 45 - "ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu"
Cohesion: 0.10
Nodes (20): 10. Test ve Kalite Güvence Sonuçları, 11. Performans & 60 FPS Değerlendirmesi, 12. Güvenlik, Gizlilik ve KVKK Standartları, 13. Karşılaşılan Zorluklar ve Çözümleri, 1. Yönetici Özeti (Executive Summary), 2.1 Teknoloji Yığını ve Uyum Matrisi, 2.2 Neden MapLibre React Native 11.5.0?, 2. Mimari Kararlar ve Uyumluluk Analizi (+12 more)

### Community 46 - "RedisService"
Cohesion: 0.05
Nodes (21): DatabaseModule, AuthModule, JwtAuthGuard, AuthRateLimitGuard, HealthController, RedisModule, RedisService, 10. Git ve Faz Kapanışı (+13 more)

### Community 47 - "useAppTheme"
Cohesion: 0.25
Nodes (41): ShowcaseScreen(), FeedScreen(), MapScreen(), NotificationsScreen(), ProfileScreen(), MapScreenLayout(), AppAvatar(), AppBadge() (+33 more)

### Community 48 - "ŞehirNabız — Phase 6.5: Android Native Doğrulama, Demo Veri Güvenliği ve Harita Kalite Kontrol Raporu"
Cohesion: 0.12
Nodes (15): 10. Açık Kalan Engeller (Known Constraints), 11. Phase 7 Hazırlık Durumu, 1. Yönetici Özeti (Executive Summary), 2.1 Güvenlik Açığı Analizi (Önceki Durum), 2. Demo Veri Güvenliği ve İzolasyon Mimarisi, 3. Çevrimdışı ve Önbellek (Offline & Cache) Yönetimi, 5.1 EAS Yapılandırması (`apps/mobile/eas.json` & `eas.json`), 5.2 Android Native Proje Doğrulaması (+7 more)

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.14
Nodes (13): 1. Docker ve Altyapı Servisleri Canlı Durumu, 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması, 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması, 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları, 3. Gerçek TypeORM Migration & Şema Testleri, 4. Canlı API ve Auth Uç Nokta Testleri, 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti, 5.2 NestJS ValidationPipe ve DTO Güvenliği (+5 more)

### Community 50 - "app/_layout.tsx"
Cohesion: 0.24
Nodes (9): RootLayout(), RootLayoutNav(), useAppFonts(), AppProvider(), AppProviderProps, queryClient, ThemeProvider(), expo-status-bar (+1 more)

### Community 51 - "EventCategory"
Cohesion: 0.06
Nodes (35): CategoryChipProps, env, getApiBaseUrl(), MobileEnv, FALLBACK_CATEGORIES, fetchCategories(), createEventApi(), CreateEventApiError (+27 more)

### Community 52 - "main.ts"
Cohesion: 0.22
Nodes (5): AppModule, AllExceptionsFilter, bootstrap(), helmet, @nestjs/core

### Community 53 - "UploadUrlDto"
Cohesion: 0.17
Nodes (3): UploadUrlDto, MediaModule, 9. Graphify Bilgi Grafiği Güncellemesi

### Community 54 - "react"
Cohesion: 0.07
Nodes (40): MapScreenLayoutProps, LoadingIndicator(), LoadingIndicatorProps, styles, AppAvatarProps, AvatarSize, AppBadgeProps, BadgeSize (+32 more)

### Community 55 - "EventResponseDto"
Cohesion: 0.33
Nodes (3): EventsService, 1. Oluşturulan Dosyalar ve Modüller, EventResponseDto

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

### Community 58 - "ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Graphify Metrikleri, 11. Git Commit, 12. Teknik Riskler ve Alınan Önlemler, 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri, 2. Veritabanı Tabloları, 3. PostGIS Veri Tipi ve İndeksleme Stratejisi, 4. API Uç Noktaları, 5. Filtreleme ve Cursor Tabanlı Sayfalama (+6 more)

### Community 59 - "event.schema.ts"
Cohesion: 0.06
Nodes (30): Environment, EnvironmentSchema, validateEnvironment(), VerificationType, CONFIRM, DENY, RESOLVED, ApiErrorResponseSchema (+22 more)

### Community 60 - "ThemeContextValue"
Cohesion: 0.20
Nodes (13): ThemeContextValue, radii, shadows, ShadowStyle, spacing, fontFamilies, fontSizes, fontWeights (+5 more)

### Community 61 - "ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)"
Cohesion: 0.07
Nodes (26): 1. Harita Ekranı (`/` veya `/(tabs)/index`), 2. Şehir Akışı Ekranı (`/(tabs)/feed`), 3. Olay Bildir Ekranı (`/(tabs)/create`), 4. Bildirimler Ekranı (`/(tabs)/notifications`), 5. Profil ve Ayarlar Ekranı (`/(tabs)/profile`), 6. Olay Detay ve Teyit Ekranı (Planlanan Detay Ekranı), Auth Gereksinimi:, Auth Gereksinimi: (+18 more)

### Community 62 - "CategoryCode"
Cohesion: 0.17
Nodes (12): CategoryCode, ACCIDENT, DISASTER, EVENT, INFRASTRUCTURE, OTHER, POWER_OUTAGE, PUBLIC_TRANSPORT (+4 more)

### Community 63 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 64 - "shared/src/index.ts"
Cohesion: 0.25
Nodes (6): dataSourceOptions, bcryptjs, ioredis, sharp, typeorm, vitest

### Community 65 - "phase_7.test.js"
Cohesion: 0.15
Nodes (5): assert, {
  CreateEventDtoSchema,
  RegisterInputSchema,
  LoginInputSchema,
  UploadUrlInputSchema,
  EventCategory,
  EventSeverity,
  EventStatus,
  MediaStatus,
}, { palette }, test, CreateEventInputSchema

### Community 66 - "event.types.ts"
Cohesion: 0.31
Nodes (7): DuplicateWarningModalProps, DuplicateWarningDto, EventDetail, EventSummary, BoundingBox, GeoCoordinate, GeoRadiusQuery

### Community 69 - "MediaStatus"
Cohesion: 0.22
Nodes (9): 11. Dosya ve Dizin Değişiklikleri Özeti, Güncellenen Dosyalar, Yeni Eklenen Dosyalar, MediaStatus, DELETED, PENDING_UPLOAD, PROCESSING, READY (+1 more)

### Community 70 - "data-source.ts"
Cohesion: 0.12
Nodes (7): AppDataSource, RefreshTokenEntity, InitialAuthAndPostGis1740000000000, CreateCategoriesAndEvents1740000001000, CreateEventMedia1740000002000, run(), seedDemoEvents()

### Community 74 - "ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)"
Cohesion: 0.15
Nodes (12): 10. Commit Hash, 11. Eksik Cihaz Testleri (Açık Beyan), 12. Phase 6 Hazırlık Durumu ve Öneriler, 2. Tasarım Tokenları (`@sehir-nabiz/design-tokens`), 3. Navigasyon Mimarisi, 4. Tema Sistemi, 5. Animasyon Altyapısı, 7. Expo Uyumluluk Durumu (+4 more)

### Community 75 - "CategoryEntity"
Cohesion: 0.12
Nodes (6): CategoryEntity, CategoriesController, CategoriesModule, CategoriesService, EventsModule, @nestjs/typeorm

### Community 76 - "generate-assets.js"
Cohesion: 0.29
Nodes (4): fs, generateAssets(), path, sharp

### Community 77 - "@nestjs/common"
Cohesion: 0.07
Nodes (14): CORRELATION_ID_HEADER, CorrelationIdMiddleware, JwtStrategy, ReadinessResponse, HealthModule, StorageModule, JwtPayload, @aws-sdk/client-s3 (+6 more)

### Community 78 - "ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)"
Cohesion: 0.12
Nodes (15): 1. Ürün Tasarım Vizyonu: Urban Floating UI, 2.1 Tema Karşılaştırması, 2.2 Backend Uyumlu 11 Olay Kategorisi Renkleri, 2. Renk Sistemi ve Semantic Tokenlar, 3. Tipografi Sistemi, 4. Spacing ve Radius Sistemi (4px Grid), 5. Gölge ve Yükseklik (Shadows & Elevation), 7. Animasyon Prensipleri (+7 more)

### Community 79 - "ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)"
Cohesion: 0.11
Nodes (17): 10. Karşılaşılan Zorluklar ve Çözümler, 12. Phase 5 Hazırlık Durumu ve Öneriler, 1. Yönetici Özeti (Executive Summary), 3.1 Tablo Şeması, 3.2 Canlı Migration & Rollback Doğrulaması, 3. Veritabanı ve Migration Sonuçları, 4. Medya Yükleme Yaşam Döngüsü (Upload Lifecycle), 5. Güvenlik ve Gizlilik Denetimleri (+9 more)

### Community 80 - "ErrorBoundary"
Cohesion: 0.20
Nodes (4): ErrorBoundary, Props, State, styles

### Community 81 - "OptionalJwtAuthGuard"
Cohesion: 0.10
Nodes (16): OptionalJwtAuthGuard, 1. Mimari Genel Bakış ve Temel İlkeler, 2. Medya Yaşam Döngüsü ve Durum Makinesi, 3.1 İzin Verilen MIME Türleri (MIME Whitelist), 3.2 Sihirli Bayt (Magic Bytes / File Signature) Denetimi, 3.3 Dekompresyon Bombası (Zip Bomb / Pixel Flood) Koruması, 3.4 EXIF, GPS ve Meta Veri Temizleme (Sanitization), 3.5 Bütünlük Sağlama (SHA-256 Checksum) (+8 more)

### Community 84 - "tokens.test.ts"
Cohesion: 0.21
Nodes (3): assert, { lightTheme, darkTheme, radii, spacing }, test

### Community 85 - "geoUtils.ts"
Cohesion: 0.33
Nodes (8): useEventsBbox(), UseEventsBboxOptions, UseEventsBboxResult, BBoxCoordinates, EventGeoJsonCollection, EventGeoJsonFeature, convertEventsToGeoJson(), validateBBox()

### Community 86 - "FloatingTabBar.tsx"
Cohesion: 0.32
Nodes (6): TabsLayout(), FloatingTabBar(), FloatingTabBarProps, MAIN_TABS, TabItem, 9. Graphify Bilgi Grafiği Güncellemesi

### Community 88 - "eventsApi.ts"
Cohesion: 0.24
Nodes (7): FALLBACK_DEMO_EVENTS, fetchEventsBbox(), FetchEventsBboxOptions, getApiBaseUrl(), isDevelopmentDemoEnabled(), 2.2 Uygulanan Güvenlik Kuralları, 4. Bounding Box Çoklu Sayfalama ve Performans Optimizasyonu

### Community 89 - "map.test.js"
Cohesion: 0.22
Nodes (3): assert, { palette }, test

### Community 94 - "phase_6_5.test.js"
Cohesion: 0.25
Nodes (5): assert, fs, { palette }, path, test

### Community 97 - "PulseMapView"
Cohesion: 0.50
Nodes (5): PulseMapView(), useUserLocation(), Phase 6: Harita Katmanı & Vektör Render (MapLibre) (TAMAMLANDI), 14. Graphify Bilgi Grafiği Güncellemesi, 15. Phase 7 İçin Hazırlık ve Geçiş Önerileri

### Community 98 - "api.types.ts"
Cohesion: 0.50
Nodes (3): 5. Backend Mimarisi (`apps/api`), ApiErrorResponse, ApiResponse

## Knowledge Gaps
- **116 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport`, `pg`, `reflect-metadata` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 931 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `shared/src/index.ts`, `data-source.ts`, `api/package.json`, `events.controller.ts`, `CategoryEntity`, `main.ts`, `UserRole`, `auth.controller.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AppText()` (e.g. with `Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi (TAMAMLANDI)` and `6. Temel UI Bileşen Kütüphanesi`) actually correct?**
  _`AppText()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `EventStatus` connect `EventStatus` to `shared/src/index.ts`, `phase_7.test.js`, `event.types.ts`, `UserEntity`, `event.schema.ts`, `(tabs)/index.tsx`, `NearbyEventsDto`, `map.types.ts`, `react`, `EventResponseDto`, `UserRole`, `UpdateEventStatusDto`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `useAppTheme()` connect `useAppTheme` to `PulseMapView`, `CreateEventFlow.tsx`, `ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)`, `ThemeContext.tsx`, `(tabs)/index.tsx`, `app/_layout.tsx`, `map.types.ts`, `react`, `FloatingTabBar.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._