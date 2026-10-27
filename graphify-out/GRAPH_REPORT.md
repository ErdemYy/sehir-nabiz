# Graph Report - ŞehirNabız  (2026-10-27)

## Corpus Check
- 223 files · ~113,381 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .xml 10, (none) 2, .example 2)

## Summary
- 1848 nodes · 4009 edges · 109 communities (90 shown, 19 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 217 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6936c962`
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
- ModerationEventsQueryDto
- devDependencies
- design-tokens/package.json
- [id].tsx
- tasks
- dependencies
- scripts
- geoUtils.ts
- dependencies
- compilerOptions
- compilerOptions
- compilerOptions
- scripts
- 2. Phase 6 Mimari ve Kurulum Adımları
- config/package.json
- mediaUploadService.ts
- ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)
- auth.controller.ts
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- IStorageService
- mobile/tsconfig.json
- nest-cli.json
- EventFeedbackEntity
- StorageService
- EventSeverity
- EventsController
- tsconfig.build.json
- ŞehirNabız — Phase 8 Geliştirme ve Doğrulama Raporu (PHASE_8_REPORT.md)
- ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu
- RedisService
- useAppTheme
- ŞehirNabız — Phase 6.5: Android Native Doğrulama, Demo Veri Güvenliği ve Harita Kalite Kontrol Raporu
- ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)
- AppProvider.tsx
- EventCategory
- all-exceptions.filter.ts
- UploadUrlDto
- react
- EventsService
- devDependencies
- .getUploadUrl
- ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)
- event.schema.ts
- ThemeContext.tsx
- ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)
- CategoryCode
- jest
- shared/src/index.ts
- phase_7.test.js
- event.types.ts
- CreateEventDto
- MainApplication.kt
- MediaStatus
- UserEntity
- events.controller.ts
- MainActivity.kt
- auth.service.ts
- ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)
- CategoryEntity
- generate-assets.js
- UserRole
- ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)
- ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)
- app/_layout.tsx
- 3. Güvenlik ve Doğrulama Katmanları
- BBoxEventsDto
- NearbyEventsDto
- tokens.test.ts
- map.types.ts
- phase_8.test.js
- eventsApi.ts
- map.test.js
- ZodValidationPipe
- (tabs)/index.tsx
- index.test.ts
- phase_6_5.test.js
- 9. Graphify Bilgi Grafiği Güncellemesi
- CreateFeedbackDto
- CreateEventFlow.tsx
- media.controller.ts
- ŞehirNabız — Phase 7 Kapanış ve Doğrulama Raporu (PHASE_7_REPORT.md)
- AppModule
- zod-validation.pipe.ts
- @nestjs/common
- CorrelationIdMiddleware
- EventEntity
- EventStatus
- VerificationType

## God Nodes (most connected - your core abstractions)
1. `useAppTheme()` - 89 edges
2. `AppText()` - 59 edges
3. `react` - 50 edges
4. `react-native` - 49 edges
5. `EventStatus` - 42 edges
6. `@nestjs/common` - 41 edges
7. `UserEntity` - 38 edges
8. `EventEntity` - 35 edges
9. `EventSeverity` - 33 edges
10. `EventsService` - 30 edges

## Surprising Connections (you probably didn't know these)
- `4.2 Görünürlük Kuralları` --references--> `OptionalJwtAuthGuard`  [INFERRED]
  docs/architecture/MEDIA_SECURITY.md → apps/api/src/common/guards/optional-jwt-auth.guard.ts
- `Phase 8: Doğrulama, Topluluk Oylaması & Moderasyon (TAMAMLANDI)` --references--> `EventFeedbackEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event-feedback.entity.ts
- `2.1 `EventFeedbackEntity` (`event_feedbacks` Tablosu)` --references--> `EventFeedbackEntity`  [INFERRED]
  docs/PHASE_8_REPORT.md → apps/api/src/database/entities/event-feedback.entity.ts
- `Phase 4: Medya & Güvenli Depolama Altyapısı (TAMAMLANDI)` --references--> `EventMediaEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event-media.entity.ts
- `Phase 3: Coğrafi Veri & Olay Yönetimi API'si (TAMAMLANDI)` --references--> `EventEntity`  [INFERRED]
  docs/architecture/ROADMAP_PHASES.md → apps/api/src/database/entities/event.entity.ts

## Import Cycles
- None detected.

## Communities (109 total, 19 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.12
Nodes (16): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI), Phase 2.5: Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü (TAMAMLANDI) (+8 more)

### Community 1 - "ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)"
Cohesion: 0.14
Nodes (13): 1. Mimari Genel Bakış, 2. Mobil Harita Kütüphanesi Seçimi ve Analizi, 3.1 Neden NestJS?, 3.2 ORM Karar Analizi: TypeORM vs Prisma vs Drizzle, 3.3 Oturum ve Token Yaşam Döngüsü (Token Rotation & Reuse Detection), 3.4 PostgreSQL + PostGIS Uzamsal (Spatial) Stratejisi, 3. Backend Mimarisi (`apps/api`: NestJS 12 + PostgreSQL/PostGIS), 4. Durum Yönetimi ve Veri Akışı (+5 more)

### Community 2 - "ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)"
Cohesion: 0.09
Nodes (22): 1.1 Güvenli Yayın Konumu Politikası (Safe Published Location Policy), 1.2 Mükerrer Olay Uyarısı Gizlilik Kalkanı (Duplicate Warning Privacy Shield), 1.3 Medya Sanitizasyonu (EXIF / Metadata Stripping), 1. Konum Gizliliği, Güvenli Yayın Politikası ve KVKK / GDPR Uyumu, 2.1 İtibar (Reputation / Karma) Algoritması, 2.2 Coğrafi Mükerrer Bildirim Engelleme (Spatial Deduplication), 2. Sahte Bildirim ve Spam Önleme Mekanizmaları, 3. Topluluk Moderasyonu ve Güvenilirlik Skoru (+14 more)

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

### Community 12 - "ModerationEventsQueryDto"
Cohesion: 0.12
Nodes (3): ModerationEventsQueryDto, ModerationController, PaginatedModerationEventsResponse

### Community 13 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, source-map-support, supertest (+15 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.10
Nodes (19): description, devDependencies, @sehir-nabiz/config, @types/node, typescript, @sehir-nabiz/config, @types/node, typescript (+11 more)

### Community 15 - "[id].tsx"
Cohesion: 0.15
Nodes (8): MOCK_FEED_EVENTS, MOCK_NOTIFICATIONS, AuthModalProps, styles, useAuthStore, LAYER_OPTIONS, expo-router, lucide-react-native

### Community 16 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, cache, cache, persistent, dependsOn, $schema, tasks (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, expo, expo-constants, expo-dev-client, expo-file-system, expo-font, @expo-google-fonts/manrope, @expo-google-fonts/plus-jakarta-sans (+19 more)

### Community 18 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, clean, ios, lint, start, test, typecheck (+1 more)

### Community 19 - "geoUtils.ts"
Cohesion: 0.30
Nodes (9): useEventsBbox(), UseEventsBboxOptions, UseEventsBboxResult, fetchEventsBbox(), BBoxCoordinates, EventGeoJsonCollection, EventGeoJsonFeature, convertEventsToGeoJson() (+1 more)

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

### Community 27 - "mediaUploadService.ts"
Cohesion: 0.06
Nodes (36): env, getApiBaseUrl(), MobileEnv, FALLBACK_CATEGORIES, fetchCategories(), createEventApi(), CreateEventApiError, completeMediaUpload() (+28 more)

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.09
Nodes (22): 1. Ortam Hazırlığı, 2. Docker Servislerinin Başlatılması, 3.1 Geliştirme Ortamı Dosyaları, 3.2 Güvenli JWT Secret Üretimi (Geliştirme vs Üretim Ayrımı), 3. Güvenli Secret ve Ortam Değişkeni Yönetimi, 4. Veritabanı, Migration ve Seed Yönetimi (TypeORM), 5. Temel Turborepo Komutları, 6.1 Backend API (`apps/api`) (+14 more)

### Community 29 - "auth.controller.ts"
Cohesion: 0.06
Nodes (21): AuthController, AuthService, LoginDto, RefreshTokenDto, RegisterDto, authApi, AuthApiError, secureTokenStorage (+13 more)

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

### Community 36 - "EventFeedbackEntity"
Cohesion: 0.08
Nodes (4): EventFeedbackEntity, EventModerationLogEntity, UserReputationLogEntity, Index()

### Community 37 - "StorageService"
Cohesion: 0.14
Nodes (3): MediaService, StorageService, EventMediaDto

### Community 38 - "EventSeverity"
Cohesion: 0.27
Nodes (7): EventSeverity, CRITICAL, HIGH, LOW, MEDIUM, class-transformer, class-validator

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 41 - "ŞehirNabız — Phase 8 Geliştirme ve Doğrulama Raporu (PHASE_8_REPORT.md)"
Cohesion: 0.11
Nodes (18): 10. Commit Bilgisi, 11. Açık Teknik Sorunlar, 12. Android Native Doğrulama Durumu, 13. Phase 9 Önerileri, 1. Feedback Sistemi (Topluluk Geri Bildirimi), 2.1 `EventFeedbackEntity` (`event_feedbacks` Tablosu), 2.2 `UserReputationLogEntity` (`user_reputation_logs` Tablosu), 2.3 `events` Tablosu Sayaç Genişletmesi (+10 more)

### Community 45 - "ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu"
Cohesion: 0.09
Nodes (23): useUserLocation(), 10. Test ve Kalite Güvence Sonuçları, 11. Performans & 60 FPS Değerlendirmesi, 12. Güvenlik, Gizlilik ve KVKK Standartları, 13. Karşılaşılan Zorluklar ve Çözümleri, 14. Graphify Bilgi Grafiği Güncellemesi, 15. Phase 7 İçin Hazırlık ve Geçiş Önerileri, 1. Yönetici Özeti (Executive Summary) (+15 more)

### Community 46 - "RedisService"
Cohesion: 0.06
Nodes (18): DatabaseModule, AuthModule, AuthRateLimitGuard, RedisModule, RedisService, 10. Git ve Faz Kapanışı, 11. Teknik Borçlar, 12. Phase 3 İçin Öneriler (+10 more)

### Community 47 - "useAppTheme"
Cohesion: 0.23
Nodes (41): EventDetailScreen(), ModerationScreen(), ShowcaseScreen(), FeedScreen(), MapScreen(), TabsLayout(), NotificationsScreen(), ProfileScreen() (+33 more)

### Community 48 - "ŞehirNabız — Phase 6.5: Android Native Doğrulama, Demo Veri Güvenliği ve Harita Kalite Kontrol Raporu"
Cohesion: 0.11
Nodes (18): isDevelopmentDemoEnabled(), 10. Açık Kalan Engeller (Known Constraints), 11. Phase 7 Hazırlık Durumu, 1. Yönetici Özeti (Executive Summary), 2.1 Güvenlik Açığı Analizi (Önceki Durum), 2.2 Uygulanan Güvenlik Kuralları, 2. Demo Veri Güvenliği ve İzolasyon Mimarisi, 3. Çevrimdışı ve Önbellek (Offline & Cache) Yönetimi (+10 more)

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.15
Nodes (12): 1. Docker ve Altyapı Servisleri Canlı Durumu, 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması, 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması, 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları, 4. Canlı API ve Auth Uç Nokta Testleri, 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti, 5.2 NestJS ValidationPipe ve DTO Güvenliği, 5.3 Rol Tabanlı Erişim Kontrolü (RBAC) (+4 more)

### Community 50 - "AppProvider.tsx"
Cohesion: 0.29
Nodes (6): AppProvider(), AppProviderProps, queryClient, ThemeProvider(), 4. Tema Sistemi, @tanstack/react-query

### Community 51 - "EventCategory"
Cohesion: 0.11
Nodes (19): CategoryChipProps, EventCategory, ACCIDENT, CULTURAL_EVENT, DISASTER, EVENT, FIRE_OR_NATURAL_HAZARD, INFRASTRUCTURE (+11 more)

### Community 52 - "all-exceptions.filter.ts"
Cohesion: 0.20
Nodes (7): AllExceptionsFilter, CORRELATION_ID_HEADER, bootstrap(), 5. Backend Mimarisi (`apps/api`), ApiErrorResponse, helmet, @nestjs/core

### Community 53 - "UploadUrlDto"
Cohesion: 0.17
Nodes (3): ALLOWED_MIME_TYPES, AllowedMimeType, UploadUrlDto

### Community 54 - "react"
Cohesion: 0.07
Nodes (45): NotFoundScreen(), styles, MapScreenLayoutProps, LoadingIndicator(), LoadingIndicatorProps, styles, AppAvatarProps, AvatarSize (+37 more)

### Community 55 - "EventsService"
Cohesion: 0.22
Nodes (4): EventsService, 1. Oluşturulan Dosyalar ve Modüller, EventResponseDto, PaginatedEventsResponse

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

### Community 58 - "ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Graphify Metrikleri, 11. Git Commit, 12. Teknik Riskler ve Alınan Önlemler, 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri, 2. Veritabanı Tabloları, 3. PostGIS Veri Tipi ve İndeksleme Stratejisi, 4. API Uç Noktaları, 5. Filtreleme ve Cursor Tabanlı Sayfalama (+6 more)

### Community 59 - "event.schema.ts"
Cohesion: 0.13
Nodes (14): BBoxEventsQueryInput, CategoryCodeSchema, CreateFeedbackInput, EventCategorySchema, EventSeveritySchema, EventStatusSchema, FeedbackTypeSchema, ModerationEventsQueryInput (+6 more)

### Community 60 - "ThemeContext.tsx"
Cohesion: 0.14
Nodes (16): ThemeContext, ThemeContextValue, ThemeMode, ThemeProviderProps, radii, shadows, ShadowStyle, spacing (+8 more)

### Community 61 - "ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)"
Cohesion: 0.06
Nodes (30): 1. Harita Ekranı (`/` veya `/(tabs)/index`), 2. Şehir Akışı Ekranı (`/(tabs)/feed`), 3. Olay Bildir Ekranı (`/(tabs)/create`), 4. Bildirimler Ekranı (`/(tabs)/notifications`), 5. Profil ve Ayarlar Ekranı (`/(tabs)/profile`), 6. Olay Detay ve Teyit Ekranı (`/events/[id]` — Phase 8 Uygulaması), 7. Moderatör Paneli Ekranı (`/moderation` — Phase 8 Uygulaması), Auth Gereksinimi: (+22 more)

### Community 62 - "CategoryCode"
Cohesion: 0.12
Nodes (13): CategoryCode, ACCIDENT, DISASTER, EVENT, INFRASTRUCTURE, OTHER, POWER_OUTAGE, PUBLIC_TRANSPORT (+5 more)

### Community 63 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 64 - "shared/src/index.ts"
Cohesion: 0.21
Nodes (7): dataSourceOptions, AccountStatus, ACTIVE, PENDING_VERIFICATION, SUSPENDED, bcryptjs, vitest

### Community 65 - "phase_7.test.js"
Cohesion: 0.22
Nodes (4): assert, {
  CreateEventDtoSchema,
  RegisterInputSchema,
  LoginInputSchema,
  UploadUrlInputSchema,
  EventCategory,
  EventSeverity,
  EventStatus,
  MediaStatus,
}, { palette }, test

### Community 66 - "event.types.ts"
Cohesion: 0.15
Nodes (14): DuplicateWarningModalProps, FeedbackType, CONFIRM, DISPUTE, RESOLVED_REPORT, ApiResponse, DuplicateWarningDto, EventDetail (+6 more)

### Community 69 - "MediaStatus"
Cohesion: 0.17
Nodes (11): 11. Dosya ve Dizin Değişiklikleri Özeti, Güncellenen Dosyalar, Yeni Eklenen Dosyalar, MediaStatus, DELETED, PENDING_UPLOAD, PROCESSING, READY (+3 more)

### Community 70 - "UserEntity"
Cohesion: 0.11
Nodes (10): AppDataSource, UserEntity, InitialAuthAndPostGis1740000000000, CreateCategoriesAndEvents1740000001000, CreateEventMedia1740000002000, CreateEventFeedbackAndReputationLogs1740000003000, run(), seedDemoEvents() (+2 more)

### Community 71 - "events.controller.ts"
Cohesion: 0.13
Nodes (5): BBoxEventsQuerySchema, CreateEventDtoSchema, CreateFeedbackSchema, NearbyEventsQuerySchema, UpdateEventStatusSchema

### Community 73 - "auth.service.ts"
Cohesion: 0.15
Nodes (5): RefreshTokenEntity, JwtStrategy, @nestjs/config, @nestjs/jwt, @nestjs/passport

### Community 74 - "ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)"
Cohesion: 0.15
Nodes (12): 10. Commit Hash, 11. Eksik Cihaz Testleri (Açık Beyan), 12. Phase 6 Hazırlık Durumu ve Öneriler, 2. Tasarım Tokenları (`@sehir-nabiz/design-tokens`), 3. Navigasyon Mimarisi, 5. Animasyon Altyapısı, 7. Expo Uyumluluk Durumu, 8. Test Sonuçları ve Kapsam (+4 more)

### Community 75 - "CategoryEntity"
Cohesion: 0.14
Nodes (5): CategoryEntity, CategoriesController, CategoriesModule, CategoriesService, @nestjs/typeorm

### Community 76 - "generate-assets.js"
Cohesion: 0.29
Nodes (4): fs, generateAssets(), path, sharp

### Community 77 - "UserRole"
Cohesion: 0.13
Nodes (10): Roles(), ROLES_KEY, RolesGuard, UserRole, ADMIN, CITIZEN, MODERATOR, MUNICIPAL_OFFICER (+2 more)

### Community 78 - "ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)"
Cohesion: 0.12
Nodes (17): PulseMapView(), 11. Topluluk Teyit Sistemi ve Moderasyon Arayüzü (Phase 8), 1. Ürün Tasarım Vizyonu: Urban Floating UI, 2.1 Tema Karşılaştırması, 2.2 Backend Uyumlu 11 Olay Kategorisi Renkleri, 2. Renk Sistemi ve Semantic Tokenlar, 3. Tipografi Sistemi, 4. Spacing ve Radius Sistemi (4px Grid) (+9 more)

### Community 79 - "ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)"
Cohesion: 0.11
Nodes (17): 10. Karşılaşılan Zorluklar ve Çözümler, 12. Phase 5 Hazırlık Durumu ve Öneriler, 1. Yönetici Özeti (Executive Summary), 3.1 Tablo Şeması, 3.2 Canlı Migration & Rollback Doğrulaması, 3. Veritabanı ve Migration Sonuçları, 4. Medya Yükleme Yaşam Döngüsü (Upload Lifecycle), 5. Güvenlik ve Gizlilik Denetimleri (+9 more)

### Community 80 - "app/_layout.tsx"
Cohesion: 0.17
Nodes (8): RootLayout(), RootLayoutNav(), ErrorBoundary, Props, State, styles, useAppFonts(), expo-status-bar

### Community 81 - "3. Güvenlik ve Doğrulama Katmanları"
Cohesion: 0.12
Nodes (15): 1. Mimari Genel Bakış ve Temel İlkeler, 2. Medya Yaşam Döngüsü ve Durum Makinesi, 3.1 İzin Verilen MIME Türleri (MIME Whitelist), 3.2 Sihirli Bayt (Magic Bytes / File Signature) Denetimi, 3.3 Dekompresyon Bombası (Zip Bomb / Pixel Flood) Koruması, 3.4 EXIF, GPS ve Meta Veri Temizleme (Sanitization), 3.5 Bütünlük Sağlama (SHA-256 Checksum), 3. Güvenlik ve Doğrulama Katmanları (+7 more)

### Community 84 - "tokens.test.ts"
Cohesion: 0.16
Nodes (7): assert, { lightTheme, darkTheme, radii, spacing }, test, darkTheme, lightTheme, palette, ThemeColors

### Community 85 - "map.types.ts"
Cohesion: 0.27
Nodes (7): MapLayerSheetProps, PulseMapViewProps, MAP_CONFIG, MapEventProperties, MapStyleMode, UserLocationState, expo-location

### Community 88 - "eventsApi.ts"
Cohesion: 0.23
Nodes (10): fetchEventDetail(), fetchFeedbackSummary(), removeEventFeedback(), submitEventFeedback(), fetchModerationEventDetail(), fetchModerationEvents(), updateEventStatus(), FALLBACK_DEMO_EVENTS (+2 more)

### Community 89 - "map.test.js"
Cohesion: 0.22
Nodes (3): assert, { palette }, test

### Community 93 - "ZodValidationPipe"
Cohesion: 0.21
Nodes (4): ZodValidationPipe, Environment, EnvironmentSchema, validateEnvironment()

### Community 95 - "index.test.ts"
Cohesion: 0.18
Nodes (4): AppState, useAppStore, CreateEventInputSchema, zustand

### Community 96 - "phase_6_5.test.js"
Cohesion: 0.22
Nodes (5): assert, fs, { palette }, path, test

### Community 97 - "9. Graphify Bilgi Grafiği Güncellemesi"
Cohesion: 0.33
Nodes (4): MediaModule, StorageModule, 3.5 Medya Depolama ve Güvenlik Mimarisi (`StorageModule` & `MediaModule`), 9. Graphify Bilgi Grafiği Güncellemesi

### Community 99 - "CreateEventFlow.tsx"
Cohesion: 0.14
Nodes (21): CreateEventScreen(), AuthModal(), CreateEventFlow(), styles, DuplicateWarningModal(), styles, LocationPickerModal(), LocationPickerModalProps (+13 more)

### Community 100 - "media.controller.ts"
Cohesion: 0.16
Nodes (4): OptionalJwtAuthGuard, JwtAuthGuard, 7. Kimlik Doğrulama, Token ve Mutex Koruması, 3. API Endpointleri

### Community 101 - "ŞehirNabız — Phase 7 Kapanış ve Doğrulama Raporu (PHASE_7_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Tasarım Sistemi Tutarlılığı (Urban Floating UI), 11. Test Sonuçları ve Kapsam, 12. Android Native Derleme Durumu (Teknik Borç Raporu), 13. Graphify Bilgi Grafı Metrikleri, 14. Açık Sorunlar ve Riskler, 15. Phase 8 Önerileri (Doğrulama, Topluluk Oylaması ve Moderasyon), 2. Oluşturulan Ekranlar ve Bileşen Mimarisi, 3. Navigasyon ve Ekran Akışı (+6 more)

### Community 103 - "zod-validation.pipe.ts"
Cohesion: 0.16
Nodes (8): ApiErrorResponseSchema, HealthCheckResponseSchema, BoundingBoxSchema, GeoCoordinateSchema, GeoRadiusQuerySchema, MediaMimeTypeSchema, UploadUrlInput, UploadUrlInputSchema

### Community 104 - "@nestjs/common"
Cohesion: 0.11
Nodes (8): EventsModule, HealthController, ReadinessResponse, HealthModule, ModerationModule, HealthCheckResponse, ioredis, @nestjs/common

### Community 107 - "EventEntity"
Cohesion: 0.12
Nodes (3): EventEntity, EventMediaEntity, sharp

### Community 108 - "EventStatus"
Cohesion: 0.14
Nodes (10): UpdateEventStatusDto, EventStatus, ACTIVE, DISPUTED, EXPIRED, PENDING_REVIEW, PENDING_VERIFICATION, REJECTED (+2 more)

### Community 110 - "VerificationType"
Cohesion: 0.50
Nodes (4): VerificationType, CONFIRM, DENY, RESOLVED

## Knowledge Gaps
- **119 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport`, `pg`, `reflect-metadata` (+114 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1024 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EventStatus` connect `EventStatus` to `shared/src/index.ts`, `event.types.ts`, `EventFeedbackEntity`, `EventSeverity`, `event.schema.ts`, `EventEntity`, `ModerationEventsQueryDto`, `[id].tsx`, `useAppTheme`, `NearbyEventsDto`, `map.types.ts`, `react`, `EventsService`, `mediaUploadService.ts`, `index.test.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useAppTheme()` (e.g. with `4. Tema Sistemi` and `7. Gerçek Ekran ve Tasarım Sistemi Kontrolü`) actually correct?**
  _`useAppTheme()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport` to the rest of the system?**
  _119 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `@nestjs/common` connect `@nestjs/common` to `shared/src/index.ts`, `media.controller.ts`, `api/package.json`, `zod-validation.pipe.ts`, `UserEntity`, `auth.service.ts`, `events.controller.ts`, `CategoryEntity`, `EventEntity`, `UserRole`, `all-exceptions.filter.ts`, `auth.controller.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AppText()` (e.g. with `Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi (TAMAMLANDI)` and `6. Temel UI Bileşen Kütüphanesi`) actually correct?**
  _`AppText()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._