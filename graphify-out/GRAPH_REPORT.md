# Graph Report - ŞehirNabız  (2026-10-27)

## Corpus Check
- 207 files · ~99,344 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .xml 10, (none) 2, .example 2)

## Summary
- 1679 nodes · 3500 edges · 112 communities (88 shown, 24 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 197 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c97287f6`
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
- categoriesApi.ts
- devDependencies
- design-tokens/package.json
- (tabs)/index.tsx
- tasks
- dependencies
- scripts
- useUserLocation.ts
- dependencies
- compilerOptions
- compilerOptions
- compilerOptions
- scripts
- 2. Phase 6 Mimari ve Kurulum Adımları
- config/package.json
- UserRole
- ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)
- useAuthStore.ts
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- IStorageService
- mobile/tsconfig.json
- nest-cli.json
- EventEntity
- StorageService
- EventSeverity
- EventsController
- tsconfig.build.json
- mediaUploadService.ts
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
- ThemeContext.tsx
- ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)
- CategoryCode
- jest
- events.service.ts
- phase_7.test.js
- event.types.ts
- CreateEventDto
- MainApplication.kt
- MediaStatus
- data-source.ts
- events.controller.ts
- MainActivity.kt
- UserEntity
- ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)
- app.module.ts
- generate-assets.js
- shared/src/index.ts
- ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)
- ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)
- ErrorBoundary
- OptionalJwtAuthGuard
- BBoxEventsDto
- NearbyEventsDto
- tokens.test.ts
- map.types.ts
- FloatingTabBar.tsx
- eventsApi.ts
- map.test.js
- auth.controller.ts
- phase_6_5.test.js
- .generateUploadUrl
- CategoryDto
- BottomSheet
- ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)
- CreateEventFlow.tsx
- AuthController
- ŞehirNabız — Phase 7 Kapanış ve Doğrulama Raporu (PHASE_7_REPORT.md)
- AuthService
- ref_zod
- health.controller.ts
- EventStatus
- all-exceptions.filter.ts
- 9. Graphify Bilgi Grafiği Güncellemesi
- RegisterDto
- JwtStrategy
- VerificationType
- geo.schema.ts

## God Nodes (most connected - your core abstractions)
1. `useAppTheme()` - 84 edges
2. `AppText()` - 55 edges
3. `react` - 48 edges
4. `react-native` - 47 edges
5. `@nestjs/common` - 39 edges
6. `EventStatus` - 37 edges
7. `UserEntity` - 34 edges
8. `EventEntity` - 32 edges
9. `EventSeverity` - 31 edges
10. `EventCategory` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Phase 4: Medya & Güvenli Depolama Altyapısı (TAMAMLANDI)` --references--> `EventMediaEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event-media.entity.ts
- `Phase 3: Coğrafi Veri & Olay Yönetimi API'si (TAMAMLANDI)` --references--> `EventEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event.entity.ts
- `1. Yönetici Özeti (Executive Summary)` --references--> `IStorageService`  [INFERRED]
  docs/PHASE_4_REPORT.md → apps/api/src/modules/storage/storage.interface.ts
- `Yeni Eklenen Dosyalar` --references--> `IStorageService`  [INFERRED]
  docs/PHASE_4_REPORT.md → apps/api/src/modules/storage/storage.interface.ts
- `Phase 6 Hedefleri (Harita Motoru ve Vektör Katmanları):` --references--> `BottomSheet()`  [INFERRED]
  docs/PHASE_5_REPORT.md → apps/mobile/src/components/ui/BottomSheet.tsx

## Import Cycles
- None detected.

## Communities (112 total, 24 thin omitted)

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
Nodes (23): description, @sehir-nabiz/config, @sehir-nabiz/shared, typescript, main, name, private, version (+15 more)

### Community 6 - "api/package.json"
Cohesion: 0.05
Nodes (36): description, @sehir-nabiz/config, @sehir-nabiz/shared, @types/node, typescript, zod, name, private (+28 more)

### Community 7 - "ŞehirNabız — Phase 1 Doğrulama ve Tamamlanma Raporu (PHASE_1_REPORT.md)"
Cohesion: 0.12
Nodes (12): 1. Genel Özet ve Mimari Kazanımlar, 2. Oluşturulan Dizin ve Paket Yapısı, 3. Kurulan Paketler ve Sürümleri, 4. Expo SDK 58 ve MapLibre Uyumluluk Analizi, 5. Backend Mimarisi (`apps/api`), 6. Kalite ve Test Doğrulama Sonuçları, 7. Graphify Bilgi Grafı Durumu, 8. Eksik Kalanlar ve Phase 2 Önerileri (+4 more)

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

### Community 12 - "categoriesApi.ts"
Cohesion: 0.25
Nodes (5): FALLBACK_CATEGORIES, darkTheme, lightTheme, palette, ThemeColors

### Community 13 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, source-map-support, supertest (+15 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.10
Nodes (19): description, devDependencies, @sehir-nabiz/config, @types/node, typescript, @sehir-nabiz/config, @types/node, typescript (+11 more)

### Community 15 - "(tabs)/index.tsx"
Cohesion: 0.08
Nodes (9): MOCK_FEED_EVENTS, CATEGORIES_LIST, MOCK_NOTIFICATIONS, styles, LocationPickerModalProps, styles, SelectedLocation, lucide-react-native (+1 more)

### Community 16 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, cache, cache, persistent, dependsOn, $schema, tasks (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-dev-client, expo-file-system, expo-font, @expo-google-fonts/manrope, @expo-google-fonts/plus-jakarta-sans (+19 more)

### Community 18 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, clean, ios, lint, start, test, typecheck (+1 more)

### Community 19 - "useUserLocation.ts"
Cohesion: 0.33
Nodes (5): useUserLocation(), UserLocationState, 14. Graphify Bilgi Grafiği Güncellemesi, 15. Phase 7 İçin Hazırlık ve Geçiş Önerileri, expo-location

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
Cohesion: 0.21
Nodes (11): AccountStatus, ACTIVE, PENDING_VERIFICATION, SUSPENDED, UserRole, ADMIN, CITIZEN, MODERATOR (+3 more)

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.09
Nodes (22): 1. Ortam Hazırlığı, 2. Docker Servislerinin Başlatılması, 3.1 Geliştirme Ortamı Dosyaları, 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı), 3. Güvenli Secret ve Ortam Değişkeni Yönetimi, 4. Veritabanı, Migration ve Seed Yönetimi (TypeORM), 5. Temel Turborepo Komutları, 6.1 Backend API (`apps/api`) (+14 more)

### Community 29 - "useAuthStore.ts"
Cohesion: 0.16
Nodes (8): LoginDto, authApi, AuthApiError, secureTokenStorage, AuthState, LoginInput, RegisterInput, expo-secure-store

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
Nodes (4): IStorageService, 2.1 Doğrudan Depolamaya Yükleme (Direct-to-Storage Presigned URL) vs Sunucu Üzerinden Yükleme (Multipart Form-Data), 2.2 S3 API ve Cloudflare R2 / MinIO Soyutlama Katmanı, 2. Mimari Değişiklikler ve Kararlar

### Community 34 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, extends, include, @sehir-nabiz/config/typescript/react-native.json

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "EventEntity"
Cohesion: 0.08
Nodes (4): EventEntity, EventMediaEntity, EventModerationLogEntity, Index()

### Community 38 - "EventSeverity"
Cohesion: 0.21
Nodes (9): ALLOWED_MIME_TYPES, AllowedMimeType, EventSeverity, CRITICAL, HIGH, LOW, MEDIUM, class-transformer (+1 more)

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 41 - "mediaUploadService.ts"
Cohesion: 0.13
Nodes (18): env, getApiBaseUrl(), MobileEnv, PhotoPickerSectionProps, styles, draftService, createEventApi(), CreateEventApiError (+10 more)

### Community 45 - "ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu"
Cohesion: 0.10
Nodes (20): 10. Test ve Kalite Güvence Sonuçları, 11. Performans & 60 FPS Değerlendirmesi, 12. Güvenlik, Gizlilik ve KVKK Standartları, 13. Karşılaşılan Zorluklar ve Çözümleri, 1. Yönetici Özeti (Executive Summary), 2.1 Teknoloji Yığını ve Uyum Matrisi, 2.2 Neden MapLibre React Native 11.5.0?, 2. Mimari Kararlar ve Uyumluluk Analizi (+12 more)

### Community 46 - "RedisService"
Cohesion: 0.09
Nodes (5): JwtAuthGuard, AuthRateLimitGuard, RedisService, 5. Kimlik Doğrulama Uç Noktaları (Auth Endpoints), 7. Kimlik Doğrulama, Token ve Mutex Koruması

### Community 47 - "useAppTheme"
Cohesion: 0.29
Nodes (32): ShowcaseScreen(), FeedScreen(), MapScreen(), NotificationsScreen(), ProfileScreen(), MapScreenLayout(), AppAvatar(), AppBadge() (+24 more)

### Community 48 - "ŞehirNabız — Phase 6.5: Android Native Doğrulama, Demo Veri Güvenliği ve Harita Kalite Kontrol Raporu"
Cohesion: 0.12
Nodes (15): 10. Açık Kalan Engeller (Known Constraints), 11. Phase 7 Hazırlık Durumu, 1. Yönetici Özeti (Executive Summary), 2.1 Güvenlik Açığı Analizi (Önceki Durum), 2. Demo Veri Güvenliği ve İzolasyon Mimarisi, 3. Çevrimdışı ve Önbellek (Offline & Cache) Yönetimi, 5.1 EAS Yapılandırması (`apps/mobile/eas.json` & `eas.json`), 5.2 Android Native Proje Doğrulaması (+7 more)

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.15
Nodes (12): 1. Docker ve Altyapı Servisleri Canlı Durumu, 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması, 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması, 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları, 4. Canlı API ve Auth Uç Nokta Testleri, 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti, 5.2 NestJS ValidationPipe ve DTO Güvenliği, 5.3 Rol Tabanlı Erişim Kontrolü (RBAC) (+4 more)

### Community 50 - "app/_layout.tsx"
Cohesion: 0.24
Nodes (9): RootLayout(), RootLayoutNav(), useAppFonts(), AppProvider(), AppProviderProps, queryClient, ThemeProvider(), expo-status-bar (+1 more)

### Community 51 - "EventCategory"
Cohesion: 0.11
Nodes (19): CategoryChipProps, EventCategory, ACCIDENT, CULTURAL_EVENT, DISASTER, EVENT, FIRE_OR_NATURAL_HAZARD, INFRASTRUCTURE (+11 more)

### Community 52 - "main.ts"
Cohesion: 0.22
Nodes (5): AppModule, AllExceptionsFilter, bootstrap(), helmet, @nestjs/core

### Community 54 - "react"
Cohesion: 0.07
Nodes (40): MapScreenLayoutProps, LoadingIndicator(), LoadingIndicatorProps, styles, AppAvatarProps, AvatarSize, AppBadgeProps, BadgeSize (+32 more)

### Community 55 - "EventResponseDto"
Cohesion: 0.30
Nodes (4): EventsService, 1. Oluşturulan Dosyalar ve Modüller, EventResponseDto, PaginatedEventsResponse

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

### Community 58 - "ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Graphify Metrikleri, 11. Git Commit, 12. Teknik Riskler ve Alınan Önlemler, 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri, 2. Veritabanı Tabloları, 3. PostGIS Veri Tipi ve İndeksleme Stratejisi, 4. API Uç Noktaları, 5. Filtreleme ve Cursor Tabanlı Sayfalama (+6 more)

### Community 59 - "event.schema.ts"
Cohesion: 0.13
Nodes (14): BBoxEventsQueryInput, BBoxEventsQuerySchema, CategoryCodeSchema, CreateEventDtoSchema, EventCategorySchema, EventSeveritySchema, EventStatusSchema, NearbyEventsQueryInput (+6 more)

### Community 60 - "ThemeContext.tsx"
Cohesion: 0.12
Nodes (16): ThemeContext, ThemeContextValue, ThemeMode, ThemeProviderProps, radii, shadows, ShadowStyle, spacing (+8 more)

### Community 61 - "ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)"
Cohesion: 0.07
Nodes (26): 1. Harita Ekranı (`/` veya `/(tabs)/index`), 2. Şehir Akışı Ekranı (`/(tabs)/feed`), 3. Olay Bildir Ekranı (`/(tabs)/create`), 4. Bildirimler Ekranı (`/(tabs)/notifications`), 5. Profil ve Ayarlar Ekranı (`/(tabs)/profile`), 6. Olay Detay ve Teyit Ekranı (Planlanan Detay Ekranı), Auth Gereksinimi:, Auth Gereksinimi: (+18 more)

### Community 62 - "CategoryCode"
Cohesion: 0.17
Nodes (12): CategoryCode, ACCIDENT, DISASTER, EVENT, INFRASTRUCTURE, OTHER, POWER_OUTAGE, PUBLIC_TRANSPORT (+4 more)

### Community 63 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 64 - "events.service.ts"
Cohesion: 0.26
Nodes (3): CategoryEntity, typeorm, vitest

### Community 65 - "phase_7.test.js"
Cohesion: 0.12
Nodes (8): AppState, useAppStore, assert, {
  CreateEventDtoSchema,
  RegisterInputSchema,
  LoginInputSchema,
  UploadUrlInputSchema,
  EventCategory,
  EventSeverity,
  EventStatus,
  MediaStatus,
}, { palette }, test, CreateEventInputSchema, zustand

### Community 66 - "event.types.ts"
Cohesion: 0.31
Nodes (7): DuplicateWarningModalProps, DuplicateWarningDto, EventDetail, EventSummary, BoundingBox, GeoCoordinate, GeoRadiusQuery

### Community 69 - "MediaStatus"
Cohesion: 0.22
Nodes (9): 11. Dosya ve Dizin Değişiklikleri Özeti, Güncellenen Dosyalar, Yeni Eklenen Dosyalar, MediaStatus, DELETED, PENDING_UPLOAD, PROCESSING, READY (+1 more)

### Community 70 - "data-source.ts"
Cohesion: 0.16
Nodes (7): AppDataSource, InitialAuthAndPostGis1740000000000, CreateCategoriesAndEvents1740000001000, CreateEventMedia1740000002000, run(), seedDemoEvents(), 3. Gerçek TypeORM Migration & Şema Testleri

### Community 73 - "UserEntity"
Cohesion: 0.10
Nodes (6): dataSourceOptions, RefreshTokenEntity, UserEntity, bcryptjs, @nestjs/config, @nestjs/jwt

### Community 74 - "ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)"
Cohesion: 0.15
Nodes (12): 10. Commit Hash, 11. Eksik Cihaz Testleri (Açık Beyan), 12. Phase 6 Hazırlık Durumu ve Öneriler, 2. Tasarım Tokenları (`@sehir-nabiz/design-tokens`), 3. Navigasyon Mimarisi, 4. Tema Sistemi, 5. Animasyon Altyapısı, 7. Expo Uyumluluk Durumu (+4 more)

### Community 75 - "app.module.ts"
Cohesion: 0.16
Nodes (5): CategoriesController, CategoriesModule, CategoriesService, EventsModule, @nestjs/typeorm

### Community 76 - "generate-assets.js"
Cohesion: 0.29
Nodes (4): fs, generateAssets(), path, sharp

### Community 77 - "shared/src/index.ts"
Cohesion: 0.15
Nodes (7): ROLES_KEY, RolesGuard, MediaService, JwtPayload, @nestjs/common, @nestjs/passport, sharp

### Community 78 - "ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)"
Cohesion: 0.13
Nodes (14): 1. Ürün Tasarım Vizyonu: Urban Floating UI, 2.1 Tema Karşılaştırması, 2.2 Backend Uyumlu 11 Olay Kategorisi Renkleri, 2. Renk Sistemi ve Semantic Tokenlar, 3. Tipografi Sistemi, 4. Spacing ve Radius Sistemi (4px Grid), 5. Gölge ve Yükseklik (Shadows & Elevation), 7. Animasyon Prensipleri (+6 more)

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
Cohesion: 0.27
Nodes (3): assert, { lightTheme, darkTheme, radii, spacing }, test

### Community 85 - "map.types.ts"
Cohesion: 0.22
Nodes (13): MapLayerSheetProps, PulseMapViewProps, MAP_CONFIG, useEventsBbox(), UseEventsBboxOptions, UseEventsBboxResult, BBoxCoordinates, EventGeoJsonCollection (+5 more)

### Community 86 - "FloatingTabBar.tsx"
Cohesion: 0.20
Nodes (9): NotFoundScreen(), styles, TabsLayout(), FloatingTabBar(), FloatingTabBarProps, MAIN_TABS, TabItem, 9. Graphify Bilgi Grafiği Güncellemesi (+1 more)

### Community 88 - "eventsApi.ts"
Cohesion: 0.24
Nodes (7): FALLBACK_DEMO_EVENTS, fetchEventsBbox(), FetchEventsBboxOptions, getApiBaseUrl(), isDevelopmentDemoEnabled(), 2.2 Uygulanan Güvenlik Kuralları, 4. Bounding Box Çoklu Sayfalama ve Performans Optimizasyonu

### Community 89 - "map.test.js"
Cohesion: 0.25
Nodes (3): assert, { palette }, test

### Community 93 - "auth.controller.ts"
Cohesion: 0.12
Nodes (8): ZodValidationPipe, RefreshTokenDto, AccountStatusSchema, LoginInputSchema, RefreshTokenInput, RefreshTokenInputSchema, RegisterInputSchema, UserRoleSchema

### Community 94 - "phase_6_5.test.js"
Cohesion: 0.25
Nodes (5): assert, fs, { palette }, path, test

### Community 97 - "BottomSheet"
Cohesion: 0.33
Nodes (8): BottomSheet(), LAYER_OPTIONS, MapLayerSheet(), PulseMapView(), Phase 6: Harita Katmanı & Vektör Render (MapLibre) (TAMAMLANDI), 9. Harita Görsel Dili ve Vektör Katman Entegrasyonu (Phase 6), Kullanıcı Etkileşimleri:, 6. UI Showcase Durumu

### Community 98 - "ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)"
Cohesion: 0.11
Nodes (15): DatabaseModule, AuthModule, RedisModule, 10. Git ve Faz Kapanışı, 11. Teknik Borçlar, 12. Phase 3 İçin Öneriler, 1. Oluşturulan Modüller ve Mimari Bileşenler, 2. Veritabanı Tabloları ve Şema Yapısı (+7 more)

### Community 99 - "CreateEventFlow.tsx"
Cohesion: 0.19
Nodes (16): CreateEventScreen(), AppInput(), AuthModal(), AuthModalProps, styles, useAuthStore, CreateEventFlow(), styles (+8 more)

### Community 101 - "ŞehirNabız — Phase 7 Kapanış ve Doğrulama Raporu (PHASE_7_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Tasarım Sistemi Tutarlılığı (Urban Floating UI), 11. Test Sonuçları ve Kapsam, 12. Android Native Derleme Durumu (Teknik Borç Raporu), 13. Graphify Bilgi Grafı Metrikleri, 14. Açık Sorunlar ve Riskler, 15. Phase 8 Önerileri (Doğrulama, Topluluk Oylaması ve Moderasyon), 2. Oluşturulan Ekranlar ve Bileşen Mimarisi, 3. Navigasyon ve Ekran Akışı (+6 more)

### Community 103 - "ref_zod"
Cohesion: 0.17
Nodes (8): Environment, EnvironmentSchema, validateEnvironment(), ApiErrorResponseSchema, HealthCheckResponseSchema, MediaMimeTypeSchema, UploadUrlInput, UploadUrlInputSchema

### Community 104 - "health.controller.ts"
Cohesion: 0.20
Nodes (4): HealthController, ReadinessResponse, HealthModule, ioredis

### Community 105 - "EventStatus"
Cohesion: 0.22
Nodes (9): EventStatus, ACTIVE, DISPUTED, EXPIRED, PENDING_REVIEW, PENDING_VERIFICATION, REJECTED, REJECTED_SPAM (+1 more)

### Community 107 - "9. Graphify Bilgi Grafiği Güncellemesi"
Cohesion: 0.33
Nodes (4): MediaModule, StorageModule, 3.5 Medya Depolama ve Güvenlik Mimarisi (`StorageModule` & `MediaModule`), 9. Graphify Bilgi Grafiği Güncellemesi

### Community 110 - "VerificationType"
Cohesion: 0.50
Nodes (4): VerificationType, CONFIRM, DENY, RESOLVED

### Community 111 - "geo.schema.ts"
Cohesion: 0.50
Nodes (3): BoundingBoxSchema, GeoCoordinateSchema, GeoRadiusQuerySchema

## Knowledge Gaps
- **116 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport`, `pg`, `reflect-metadata` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 942 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `shared/src/index.ts` to `events.service.ts`, `data-source.ts`, `api/package.json`, `events.controller.ts`, `UserEntity`, `all-exceptions.filter.ts`, `app.module.ts`, `health.controller.ts`, `RedisService`, `main.ts`, `auth.controller.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AppText()` (e.g. with `Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi (TAMAMLANDI)` and `6. Temel UI Bileşen Kütüphanesi`) actually correct?**
  _`AppText()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `EventStatus` connect `EventStatus` to `events.service.ts`, `phase_7.test.js`, `event.types.ts`, `EventEntity`, `EventSeverity`, `events.controller.ts`, `event.schema.ts`, `shared/src/index.ts`, `(tabs)/index.tsx`, `NearbyEventsDto`, `map.types.ts`, `react`, `EventResponseDto`, `UserRole`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `useAppTheme()` connect `useAppTheme` to `BottomSheet`, `CreateEventFlow.tsx`, `mediaUploadService.ts`, `ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)`, `(tabs)/index.tsx`, `app/_layout.tsx`, `map.types.ts`, `react`, `FloatingTabBar.tsx`, `ThemeContext.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._