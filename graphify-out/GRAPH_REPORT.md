# Graph Report - ŞehirNabız  (2026-10-27)

## Corpus Check
- 290 files · ~137,399 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: .xml 10, (none) 2, .example 2)

## Summary
- 2295 nodes · 5301 edges · 126 communities (96 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 269 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d57101aa`
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
- all-exceptions.filter.ts
- expo
- package.json
- compilerOptions
- shared/package.json
- ModerationEventsQueryDto
- devDependencies
- design-tokens/package.json
- showcase.tsx
- tasks
- dependencies
- scripts
- map.types.ts
- dependencies
- compilerOptions
- compilerOptions
- compilerOptions
- JwtStrategy
- 2. Phase 6 Mimari ve Kurulum Adımları
- config/package.json
- categoriesApi.ts
- ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)
- auth.controller.ts
- compilerOptions
- ŞehirNabız (Pulse of the City) 🏙️⚡
- api/tsconfig.json
- 3. Güvenlik ve Doğrulama Katmanları
- mobile/tsconfig.json
- nest-cli.json
- EventEntity
- StorageService
- shared/src/index.ts
- EventsController
- tsconfig.build.json
- ŞehirNabız — Phase 8 Geliştirme ve Doğrulama Raporu (PHASE_8_REPORT.md)
- ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu
- ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)
- useAppTheme
- ŞehirNabız — Phase 6.5: Android Native Doğrulama, Demo Veri Güvenliği ve Harita Kalite Kontrol Raporu
- ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)
- app/_layout.tsx
- EventCategory
- main.ts
- UploadUrlDto
- react
- EventsService
- devDependencies
- .getUploadUrl
- event.types.ts
- event.schema.ts
- ThemeContext.tsx
- ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)
- CategoryCode
- jest
- stats.controller.ts
- phase_7.test.js
- StatsService
- CreateEventDto
- MainApplication.kt
- MediaStatus
- UserEntity
- events.controller.ts
- MainActivity.kt
- EventMediaEntity
- ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)
- @nestjs/common
- generate-assets.js
- media.e2e-spec.ts
- ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)
- ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)
- ErrorBoundary
- NotificationsQueryDto
- BBoxEventsDto
- EventStatus
- ThemeContextValue
- RedisService
- phase_8.test.js
- eventsApi.ts
- map.test.js
- enums/index.ts
- (tabs)/index.tsx
- index.test.ts
- phase_6_5.test.js
- app.module.ts
- scripts
- CreateEventFlow.tsx
- JwtAuthGuard
- ŞehirNabız — Phase 7 Kapanış ve Doğrulama Raporu (PHASE_7_REPORT.md)
- RealtimeGateway
- DevicePushTokenEntity
- health.controller.ts
- notifications.service.ts
- NotificationsController
- events.e2e-spec.ts
- getApiBaseUrl
- RegisterPushTokenApiDto
- socketService
- useRealtimeEvents.ts
- seed-demo-events.ts
- NotificationsService
- IStorageService
- ŞehirNabız — Phase 9: Gerçek Zamanlı Şehir Olayları, WebSocket ve Akıllı Bildirim Sistemi Tamamlama Raporu
- EventResponseDto
- statsApi.ts
- media.controller.ts
- ŞehirNabız — Akıllı Push Bildirimleri ve Cihaz Token Rehberi (PUSH_NOTIFICATIONS_GUIDE.md)
- stats.service.ts
- UserNotificationPreferenceEntity
- NearbyEventsDto
- useEventsBbox.ts
- isDevelopmentDemoEnabled
- create.tsx

## God Nodes (most connected - your core abstractions)
1. `useAppTheme()` - 97 edges
2. `AppText()` - 67 edges
3. `@nestjs/common` - 58 edges
4. `react` - 56 edges
5. `react-native` - 54 edges
6. `EventStatus` - 52 edges
7. `UserEntity` - 50 edges
8. `EventEntity` - 42 edges
9. `typeorm` - 38 edges
10. `EventSeverity` - 36 edges

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
- 3-file cycle: `apps/api/src/database/entities/event.entity.ts -> apps/api/src/database/entities/user.entity.ts -> apps/api/src/database/entities/user-notification.entity.ts -> apps/api/src/database/entities/event.entity.ts`
- 4-file cycle: `apps/api/src/database/entities/event-feedback.entity.ts -> apps/api/src/database/entities/user.entity.ts -> apps/api/src/database/entities/user-notification.entity.ts -> apps/api/src/database/entities/event.entity.ts -> apps/api/src/database/entities/event-feedback.entity.ts`

## Communities (126 total, 30 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.12
Nodes (15): 1. Geliştirme Fazları, 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI), Phase 2.5: Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü (TAMAMLANDI) (+7 more)

### Community 1 - "ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)"
Cohesion: 0.12
Nodes (15): NotificationsModule, 1. Mimari Genel Bakış, 2. Mobil Harita Kütüphanesi Seçimi ve Analizi, 3.1 Neden NestJS?, 3.2 ORM Karar Analizi: TypeORM vs Prisma vs Drizzle, 3.3 Oturum ve Token Yaşam Döngüsü (Token Rotation & Reuse Detection), 3.4 PostgreSQL + PostGIS Uzamsal (Spatial) Stratejisi, 3. Backend Mimarisi (`apps/api`: NestJS 12 + PostgreSQL/PostGIS) (+7 more)

### Community 2 - "ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)"
Cohesion: 0.07
Nodes (26): 1.1 Güvenli Yayın Konumu Politikası (Safe Published Location Policy), 1.2 Mükerrer Olay Uyarısı Gizlilik Kalkanı (Duplicate Warning Privacy Shield), 1.3 Medya Sanitizasyonu (EXIF / Metadata Stripping), 1. Konum Gizliliği, Güvenli Yayın Politikası ve KVKK / GDPR Uyumu, 2.1 İtibar (Reputation / Karma) Algoritması, 2.2 Coğrafi Mükerrer Bildirim Engelleme (Spatial Deduplication), 2. Sahte Bildirim ve Spam Önleme Mekanizmaları, 3. Topluluk Moderasyonu ve Güvenilirlik Skoru (+18 more)

### Community 3 - "ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)"
Cohesion: 0.25
Nodes (7): 1. Proje Özeti ve Vizyon, 2. Temel Çalışma Kuralları, 3. Monorepo Yapı Şeması, 4. Graphify Kuralları ve Kullanımı, 5. Güvenlik ve Gizlilik Standartları, 6. Geliştirme Fazları Özeti, ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)

### Community 4 - "ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)"
Cohesion: 0.25
Nodes (7): 1. Veritabanı Varlık-İlişki Diyagramı (ERD), 2. PostgreSQL + PostGIS Tablo Şemaları (SQL), 3. İndeksleme Stratejileri, 3. Phase 9: Bildirim ve Cihaz Tabloları (DDL), 4.1 Zod Validasyon Şeması (Olay Oluşturma Örneği), 4. Ortak Tipler ve DTO'lar (`packages/shared`), ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)

### Community 5 - "mobile/package.json"
Cohesion: 0.08
Nodes (25): description, @sehir-nabiz/config, @sehir-nabiz/shared, socket.io-client, typescript, main, name, private (+17 more)

### Community 6 - "api/package.json"
Cohesion: 0.06
Nodes (34): description, @sehir-nabiz/config, @sehir-nabiz/shared, socket.io-client, @types/node, typescript, zod, name (+26 more)

### Community 7 - "all-exceptions.filter.ts"
Cohesion: 0.12
Nodes (12): CORRELATION_ID_HEADER, CorrelationIdMiddleware, 1. Genel Özet ve Mimari Kazanımlar, 2. Oluşturulan Dizin ve Paket Yapısı, 3. Kurulan Paketler ve Sürümleri, 4. Expo SDK 58 ve MapLibre Uyumluluk Analizi, 5. Backend Mimarisi (`apps/api`), 6. Kalite ve Test Doğrulama Sonuçları (+4 more)

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

### Community 13 - "devDependencies"
Cohesion: 0.08
Nodes (24): devDependencies, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @sehir-nabiz/config, socket.io-client, source-map-support (+16 more)

### Community 14 - "design-tokens/package.json"
Cohesion: 0.10
Nodes (19): description, devDependencies, @sehir-nabiz/config, @types/node, typescript, @sehir-nabiz/config, @types/node, typescript (+11 more)

### Community 15 - "showcase.tsx"
Cohesion: 0.08
Nodes (12): STATUS_FILTERS, CITIES, PERIODS, MOCK_FEED_EVENTS, fetchEventDetail(), fetchFeedbackSummary(), removeEventFeedback(), submitEventFeedback() (+4 more)

### Community 16 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, cache, cache, persistent, dependsOn, $schema, tasks (+8 more)

### Community 17 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, expo, expo-constants, expo-dev-client, expo-file-system, expo-font, @expo-google-fonts/manrope, @expo-google-fonts/plus-jakarta-sans (+21 more)

### Community 18 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, android, clean, ios, lint, start, test, typecheck (+1 more)

### Community 19 - "map.types.ts"
Cohesion: 0.23
Nodes (10): MapLayerSheetProps, PulseMapViewProps, MAP_CONFIG, BBoxCoordinates, EventGeoJsonCollection, EventGeoJsonFeature, MapEventProperties, MapStyleMode (+2 more)

### Community 20 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcryptjs, class-transformer, class-validator, helmet, ioredis (+21 more)

### Community 21 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, emitDecoratorMetadata, experimentalDecorators, module, moduleResolution, sourceMap, target (+3 more)

### Community 22 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, declarationMap, module, moduleResolution, outDir, rootDir, target (+3 more)

### Community 23 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, declarationMap, module, moduleResolution, outDir, rootDir, target (+3 more)

### Community 25 - "2. Phase 6 Mimari ve Kurulum Adımları"
Cohesion: 0.15
Nodes (12): 1.1 Peer Dependency & New Architecture İncelemesi, 1.2 Expo Go vs Expo Development Client (Prebuild), 1. Uyumluluk Durumu Analizi, 2.1 Paket Bağımlılıkları, 2.2 Expo Config Plugin Yapılandırması (`apps/mobile/app.json`), 2.3 Expo Prebuild Süreci, 2.4 Yerel Derleme ve Çalıştırma (Native Build), 2. Phase 6 Mimari ve Kurulum Adımları (+4 more)

### Community 26 - "config/package.json"
Cohesion: 0.20
Nodes (9): dependencies, prettier, description, files, prettier, main, name, private (+1 more)

### Community 27 - "categoriesApi.ts"
Cohesion: 0.05
Nodes (38): env, getApiBaseUrl(), MobileEnv, FALLBACK_CATEGORIES, fetchCategories(), createEventApi(), CreateEventApiError, completeMediaUpload() (+30 more)

### Community 28 - "ŞehirNabız — Geliştirici Çalışma Rehberi (DEVELOPMENT.md)"
Cohesion: 0.06
Nodes (30): 10.1 Geri Bildirim API'leri, 10.2 Moderasyon Paneli, 10. Topluluk Teyit ve Moderasyon Akışı (Phase 8), 11.1 WebSocket Gateway ve İletişim Protokolü, 11.2 Redis Pub/Sub Adapter (Yatay Ölçeklenebilirlik), 11.3 Expo Push Bildirim Geliştirme ve Test Modu, 11.4 Reconnection ve Senkronizasyon Testleri, 11. Gerçek Zamanlı Harita, WebSocket ve Push Bildirimleri (Phase 9) (+22 more)

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

### Community 33 - "3. Güvenlik ve Doğrulama Katmanları"
Cohesion: 0.12
Nodes (15): 1. Mimari Genel Bakış ve Temel İlkeler, 2. Medya Yaşam Döngüsü ve Durum Makinesi, 3.1 İzin Verilen MIME Türleri (MIME Whitelist), 3.2 Sihirli Bayt (Magic Bytes / File Signature) Denetimi, 3.3 Dekompresyon Bombası (Zip Bomb / Pixel Flood) Koruması, 3.4 EXIF, GPS ve Meta Veri Temizleme (Sanitization), 3.5 Bütünlük Sağlama (SHA-256 Checksum), 3. Güvenlik ve Doğrulama Katmanları (+7 more)

### Community 34 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, extends, include, @sehir-nabiz/config/typescript/react-native.json

### Community 35 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 36 - "EventEntity"
Cohesion: 0.05
Nodes (7): EventEntity, EventFeedbackEntity, EventModerationLogEntity, UserNotificationEntity, UserReputationLogEntity, Index(), 12. Phase 8 Hazırlık Durumu

### Community 38 - "shared/src/index.ts"
Cohesion: 0.15
Nodes (11): EventSeverity, CRITICAL, HIGH, LOW, MEDIUM, FeedbackType, CONFIRM, DISPUTE (+3 more)

### Community 40 - "tsconfig.build.json"
Cohesion: 0.50
Nodes (3): exclude, extends, ./tsconfig.json

### Community 41 - "ŞehirNabız — Phase 8 Geliştirme ve Doğrulama Raporu (PHASE_8_REPORT.md)"
Cohesion: 0.11
Nodes (18): 10. Commit Bilgisi, 11. Açık Teknik Sorunlar, 12. Android Native Doğrulama Durumu, 13. Phase 9 Önerileri, 1. Feedback Sistemi (Topluluk Geri Bildirimi), 2.1 `EventFeedbackEntity` (`event_feedbacks` Tablosu), 2.2 `UserReputationLogEntity` (`user_reputation_logs` Tablosu), 2.3 `events` Tablosu Sayaç Genişletmesi (+10 more)

### Community 45 - "ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu"
Cohesion: 0.10
Nodes (20): 10. Test ve Kalite Güvence Sonuçları, 11. Performans & 60 FPS Değerlendirmesi, 12. Güvenlik, Gizlilik ve KVKK Standartları, 13. Karşılaşılan Zorluklar ve Çözümleri, 1. Yönetici Özeti (Executive Summary), 2.1 Teknoloji Yığını ve Uyum Matrisi, 2.2 Neden MapLibre React Native 11.5.0?, 2. Mimari Kararlar ve Uyumluluk Analizi (+12 more)

### Community 46 - "ŞehirNabız — Phase 2 Tamamlanma ve Doğrulama Raporu (PHASE_2_REPORT.md)"
Cohesion: 0.11
Nodes (15): DatabaseModule, AuthModule, RedisModule, 10. Git ve Faz Kapanışı, 11. Teknik Borçlar, 12. Phase 3 İçin Öneriler, 1. Oluşturulan Modüller ve Mimari Bileşenler, 2. Veritabanı Tabloları ve Şema Yapısı (+7 more)

### Community 47 - "useAppTheme"
Cohesion: 0.20
Nodes (50): EventDetailScreen(), ModerationScreen(), MyEventsScreen(), SettingsScreen(), ShowcaseScreen(), StatsScreen(), FeedScreen(), MapScreen() (+42 more)

### Community 48 - "ŞehirNabız — Phase 6.5: Android Native Doğrulama, Demo Veri Güvenliği ve Harita Kalite Kontrol Raporu"
Cohesion: 0.13
Nodes (14): 10. Açık Kalan Engeller (Known Constraints), 11. Phase 7 Hazırlık Durumu, 1. Yönetici Özeti (Executive Summary), 3. Çevrimdışı ve Önbellek (Offline & Cache) Yönetimi, 4. Bounding Box Çoklu Sayfalama ve Performans Optimizasyonu, 5.1 EAS Yapılandırması (`apps/mobile/eas.json` & `eas.json`), 5.2 Android Native Proje Doğrulaması, 5. EAS Build ve Android Native Yapılandırması (+6 more)

### Community 49 - "ŞehirNabız — Phase 2.5: Entegrasyon Doğrulaması ve Güvenlik Denetimi Raporu (PHASE_2_5_VERIFICATION.md)"
Cohesion: 0.12
Nodes (14): InitialAuthAndPostGis1740000000000, 1. Docker ve Altyapı Servisleri Canlı Durumu, 2.1 PostGIS 3.4 Sürüm ve Coğrafi Fonksiyon Doğrulaması, 2.2 Redis 7 Kimlik Doğrulama ve TTL Doğrulaması, 2. Gerçek PostgreSQL / PostGIS ve Redis Doğrulama Sonuçları, 3. Gerçek TypeORM Migration & Şema Testleri, 4. Canlı API ve Auth Uç Nokta Testleri, 5.1 Eşzamanlı İstek Yarış Durumu (Race Condition) & Token Çalınma Tespiti (+6 more)

### Community 50 - "app/_layout.tsx"
Cohesion: 0.22
Nodes (10): RootLayout(), RootLayoutNav(), useAppFonts(), AppProvider(), AppProviderProps, queryClient, ThemeProvider(), 4. Tema Sistemi (+2 more)

### Community 51 - "EventCategory"
Cohesion: 0.09
Nodes (22): CategoryChipProps, AppState, useAppStore, EventCategory, ACCIDENT, CULTURAL_EVENT, DISASTER, EVENT (+14 more)

### Community 52 - "main.ts"
Cohesion: 0.17
Nodes (8): AllExceptionsFilter, bootstrap(), RedisIoAdapter, 2. Gerçek Zamanlı Mimari ve WebSocket Ağ Geçidi, helmet, @nestjs/core, @nestjs/platform-socket.io, @socket.io/redis-adapter

### Community 54 - "react"
Cohesion: 0.07
Nodes (46): NotFoundScreen(), styles, MapScreenLayoutProps, LoadingIndicator(), LoadingIndicatorProps, styles, AppAvatarProps, AvatarSize (+38 more)

### Community 55 - "EventsService"
Cohesion: 0.19
Nodes (6): SearchEventsDto, EventsService, 1. Oluşturulan Dosyalar ve Modüller, JwtPayload, FeedbackSummaryDto, PaginatedEventsResponse

### Community 56 - "devDependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @babel/core, @sehir-nabiz/config, @types/react, typescript

### Community 58 - "event.types.ts"
Cohesion: 0.07
Nodes (25): DuplicateWarningModalProps, 10. Graphify Metrikleri, 11. Git Commit, 12. Teknik Riskler ve Alınan Önlemler, 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri, 2. Veritabanı Tabloları, 3. PostGIS Veri Tipi ve İndeksleme Stratejisi, 4. API Uç Noktaları (+17 more)

### Community 59 - "event.schema.ts"
Cohesion: 0.05
Nodes (34): Environment, EnvironmentSchema, validateEnvironment(), VerificationType, CONFIRM, DENY, RESOLVED, ApiErrorResponseSchema (+26 more)

### Community 60 - "ThemeContext.tsx"
Cohesion: 0.13
Nodes (10): ThemeContext, ThemeMode, ThemeProviderProps, assert, { lightTheme, darkTheme, radii, spacing }, test, darkTheme, lightTheme (+2 more)

### Community 61 - "ŞehirNabız — Mobil Ekran Planları (SCREEN_BLUEPRINTS.md)"
Cohesion: 0.07
Nodes (29): 1. Harita Ekranı (`/` veya `/(tabs)/index`), 2. Şehir Akışı Ekranı (`/(tabs)/feed`), 3. Olay Bildir Ekranı (`/(tabs)/create`), 4. Bildirimler Ekranı (`/(tabs)/notifications`), 5. Profil ve Ayarlar Ekranı (`/(tabs)/profile`), 6. Olay Detay ve Teyit Ekranı (`/events/[id]` — Phase 8 Uygulaması), 7. Moderatör Paneli Ekranı (`/moderation` — Phase 8 Uygulaması), Auth Gereksinimi: (+21 more)

### Community 62 - "CategoryCode"
Cohesion: 0.17
Nodes (12): CategoryCode, ACCIDENT, DISASTER, EVENT, INFRASTRUCTURE, OTHER, POWER_OUTAGE, PUBLIC_TRANSPORT (+4 more)

### Community 63 - "jest"
Cohesion: 0.20
Nodes (10): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment, testRegex, transform (+2 more)

### Community 64 - "stats.controller.ts"
Cohesion: 0.12
Nodes (7): ZodValidationPipe, HeatmapQuerySchema, MyEventsQuery, MyEventsQuerySchema, SearchEventsQuerySchema, StatsOverviewQuery, StatsOverviewQuerySchema

### Community 65 - "phase_7.test.js"
Cohesion: 0.14
Nodes (8): assert, { describe, it }, assert, {
  CreateEventDtoSchema,
  RegisterInputSchema,
  LoginInputSchema,
  UploadUrlInputSchema,
  EventCategory,
  EventSeverity,
  EventStatus,
  MediaStatus,
}, { palette }, test, assert, { describe, it }

### Community 66 - "StatsService"
Cohesion: 0.18
Nodes (5): HeatmapQueryDto, StatsController, StatsService, HeatmapResponseDto, StatsOverviewDto

### Community 69 - "MediaStatus"
Cohesion: 0.22
Nodes (9): 11. Dosya ve Dizin Değişiklikleri Özeti, Güncellenen Dosyalar, Yeni Eklenen Dosyalar, MediaStatus, DELETED, PENDING_UPLOAD, PROCESSING, READY (+1 more)

### Community 70 - "UserEntity"
Cohesion: 0.15
Nodes (6): UserEntity, CreateCategoriesAndEvents1740000001000, CreateEventMedia1740000002000, CreateEventFeedbackAndReputationLogs1740000003000, CreateNotificationsAndPushTokens1740000004000, typeorm

### Community 73 - "EventMediaEntity"
Cohesion: 0.15
Nodes (5): EventMediaEntity, MediaModule, StorageModule, 3.5 Medya Depolama ve Güvenlik Mimarisi (`StorageModule` & `MediaModule`), 9. Graphify Bilgi Grafiği Güncellemesi

### Community 74 - "ŞehirNabız — Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi Raporu (PHASE_5_REPORT.md)"
Cohesion: 0.17
Nodes (11): 10. Commit Hash, 11. Eksik Cihaz Testleri (Açık Beyan), 12. Phase 6 Hazırlık Durumu ve Öneriler, 2. Tasarım Tokenları (`@sehir-nabiz/design-tokens`), 3. Navigasyon Mimarisi, 5. Animasyon Altyapısı, 7. Expo Uyumluluk Durumu, 8. Test Sonuçları ve Kapsam (+3 more)

### Community 75 - "@nestjs/common"
Cohesion: 0.11
Nodes (7): CategoryEntity, CategoriesController, CategoriesModule, CategoriesService, ioredis, @nestjs/common, @nestjs/typeorm

### Community 76 - "generate-assets.js"
Cohesion: 0.29
Nodes (4): fs, generateAssets(), path, sharp

### Community 77 - "media.e2e-spec.ts"
Cohesion: 0.13
Nodes (12): Roles(), ROLES_KEY, RolesGuard, ALLOWED_MIME_TYPES, AllowedMimeType, UserRole, ADMIN, CITIZEN (+4 more)

### Community 78 - "ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)"
Cohesion: 0.13
Nodes (14): 1. Ürün Tasarım Vizyonu: Urban Floating UI, 2.1 Tema Karşılaştırması, 2.2 Backend Uyumlu 11 Olay Kategorisi Renkleri, 2. Renk Sistemi ve Semantic Tokenlar, 3. Tipografi Sistemi, 4. Spacing ve Radius Sistemi (4px Grid), 5. Gölge ve Yükseklik (Shadows & Elevation), 7. Animasyon Prensipleri (+6 more)

### Community 79 - "ŞehirNabız — Phase 4: Güvenli Fotoğraf Yükleme ve Medya Depolama Sistemi Doğrulama Raporu (PHASE_4_REPORT.md)"
Cohesion: 0.09
Nodes (20): 10. Karşılaşılan Zorluklar ve Çözümler, 12. Phase 5 Hazırlık Durumu ve Öneriler, 1. Yönetici Özeti (Executive Summary), 2.1 Doğrudan Depolamaya Yükleme (Direct-to-Storage Presigned URL) vs Sunucu Üzerinden Yükleme (Multipart Form-Data), 2.2 S3 API ve Cloudflare R2 / MinIO Soyutlama Katmanı, 2. Mimari Değişiklikler ve Kararlar, 3.1 Tablo Şeması, 3.2 Canlı Migration & Rollback Doğrulaması (+12 more)

### Community 80 - "ErrorBoundary"
Cohesion: 0.20
Nodes (4): ErrorBoundary, Props, State, styles

### Community 83 - "EventStatus"
Cohesion: 0.10
Nodes (15): MyEventsQueryDto, UsersController, UsersService, usersApi, EventStatus, ACTIVE, DISPUTED, EXPIRED (+7 more)

### Community 84 - "ThemeContextValue"
Cohesion: 0.20
Nodes (13): ThemeContextValue, radii, shadows, ShadowStyle, spacing, fontFamilies, fontSizes, fontWeights (+5 more)

### Community 85 - "RedisService"
Cohesion: 0.14
Nodes (3): AuthRateLimitGuard, RedisService, 5. Kimlik Doğrulama Uç Noktaları (Auth Endpoints)

### Community 88 - "eventsApi.ts"
Cohesion: 0.24
Nodes (4): fetchModerationEventDetail(), FALLBACK_DEMO_EVENTS, FetchEventsBboxOptions, PaginatedModerationEventsResponse

### Community 89 - "map.test.js"
Cohesion: 0.22
Nodes (3): assert, { palette }, test

### Community 93 - "enums/index.ts"
Cohesion: 0.10
Nodes (20): NotificationType, EVENT_APPROVED, EVENT_DISPUTED, EVENT_FEEDBACK, EVENT_REJECTED, EVENT_RESOLVED, MODERATION_QUEUE, SYSTEM (+12 more)

### Community 94 - "(tabs)/index.tsx"
Cohesion: 0.09
Nodes (16): CATEGORIES_LIST, BottomSheet(), LAYER_OPTIONS, MapLayerSheet(), PulseMapView(), useUserLocation(), useHeatmap(), Phase 6: Harita Katmanı & Vektör Render (MapLibre) (TAMAMLANDI) (+8 more)

### Community 96 - "phase_6_5.test.js"
Cohesion: 0.25
Nodes (5): assert, fs, { palette }, path, test

### Community 97 - "app.module.ts"
Cohesion: 0.12
Nodes (9): AppModule, EventsModule, ModerationModule, RealtimeModule, StatsModule, UsersModule, @nestjs/testing, @nestjs/throttler (+1 more)

### Community 98 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, clean, lint, migration:revert, migration:run, migration:show, seed (+7 more)

### Community 99 - "CreateEventFlow.tsx"
Cohesion: 0.12
Nodes (22): AuthModalProps, styles, styles, DuplicateWarningModal(), styles, LocationPickerModal(), LocationPickerModalProps, styles (+14 more)

### Community 100 - "JwtAuthGuard"
Cohesion: 0.18
Nodes (4): OptionalJwtAuthGuard, JwtAuthGuard, 7. Kimlik Doğrulama, Token ve Mutex Koruması, 3. API Endpointleri

### Community 101 - "ŞehirNabız — Phase 7 Kapanış ve Doğrulama Raporu (PHASE_7_REPORT.md)"
Cohesion: 0.13
Nodes (14): 10. Tasarım Sistemi Tutarlılığı (Urban Floating UI), 11. Test Sonuçları ve Kapsam, 12. Android Native Derleme Durumu (Teknik Borç Raporu), 13. Graphify Bilgi Grafı Metrikleri, 14. Açık Sorunlar ve Riskler, 15. Phase 8 Önerileri (Doğrulama, Topluluk Oylaması ve Moderasyon), 2. Oluşturulan Ekranlar ve Bileşen Mimarisi, 3. Navigasyon ve Ekran Akışı (+6 more)

### Community 102 - "RealtimeGateway"
Cohesion: 0.06
Nodes (25): RealtimeGateway, 1. Genel Mimari Şeması, 2.1 Bağlantı El Sıkışması (Handshake), 2.2 Yetkili Moderasyon Odası (`moderation:queue`), 2. Ağ Geçidi ve Güvenlik İlkeleri (`RealtimeGateway`), 3. Coğrafi Abonelik ve Oda Tasarımı, 4.1 Mükerrer Mesaj Filtresi (Deduplication), 4.2 Monotonik Sürüm Koruması (Monotonic Versioning) (+17 more)

### Community 103 - "DevicePushTokenEntity"
Cohesion: 0.10
Nodes (5): DevicePushTokenEntity, DevicesController, PushNotificationPayload, PushNotificationService, PushSendResult

### Community 104 - "health.controller.ts"
Cohesion: 0.16
Nodes (4): HealthController, ReadinessResponse, HealthModule, HealthCheckResponse

### Community 105 - "notifications.service.ts"
Cohesion: 0.27
Nodes (3): UpdateNotificationPreferencesDto, NotificationPreferencesDto, PaginatedNotificationsResponse

### Community 107 - "events.e2e-spec.ts"
Cohesion: 0.09
Nodes (10): dataSourceOptions, RefreshTokenEntity, AccountStatus, ACTIVE, PENDING_VERIFICATION, SUSPENDED, bcryptjs, @nestjs/config (+2 more)

### Community 108 - "getApiBaseUrl"
Cohesion: 0.22
Nodes (13): getApiBaseUrl(), useNotificationPreferences(), useNotifications(), UseNotificationsOptions, deactivatePushTokenApi(), fetchNotificationPreferences(), fetchNotifications(), fetchUnreadCount() (+5 more)

### Community 111 - "useRealtimeEvents.ts"
Cohesion: 0.28
Nodes (5): ConnectionStatusBadgeProps, UseRealtimeEventsOptions, UseRealtimeEventsResult, RealtimeConnectionStatus, RealtimeEventPayload

### Community 112 - "seed-demo-events.ts"
Cohesion: 0.60
Nodes (3): AppDataSource, run(), seedDemoEvents()

### Community 115 - "ŞehirNabız — Phase 9: Gerçek Zamanlı Şehir Olayları, WebSocket ve Akıllı Bildirim Sistemi Tamamlama Raporu"
Cohesion: 0.22
Nodes (8): 1. Faz Özeti ve Kapsam, 3. Coğrafi Abonelik ve Veri Tutarlılığı, 4. Bildirim Veritabanı ve Modeller, 5. Bildirim ve Cihaz API'leri, 7. Test ve Doğrulama Sonuçları, 8. Graphify Bilgi Grafı Metrikleri, 9. Sorumluluk Reddi ve Native Push Notu, ŞehirNabız — Phase 9: Gerçek Zamanlı Şehir Olayları, WebSocket ve Akıllı Bildirim Sistemi Tamamlama Raporu

### Community 117 - "statsApi.ts"
Cohesion: 0.32
Nodes (4): StatsOverviewQueryDto, statsApi, HeatmapQuery, StatsPeriod

### Community 118 - "media.controller.ts"
Cohesion: 0.22
Nodes (3): EventMediaDto, UploadUrlRequestDto, UploadUrlResponseDto

### Community 119 - "ŞehirNabız — Akıllı Push Bildirimleri ve Cihaz Token Rehberi (PUSH_NOTIFICATIONS_GUIDE.md)"
Cohesion: 0.29
Nodes (6): 1. Mimari Genel Bakış, 2. Gizlilik ve Veri Minimizasyonu, 3. Expo Push Backend Adaptörü ve Geliştirici Modu, 4. Android Bildirim Kanalı (Notification Channel), 5. Doğrulama Durumu ve Sorumluluk Reddi, ŞehirNabız — Akıllı Push Bildirimleri ve Cihaz Token Rehberi (PUSH_NOTIFICATIONS_GUIDE.md)

### Community 120 - "stats.service.ts"
Cohesion: 0.24
Nodes (4): CategoryStatDto, DistrictStatDto, HeatmapPointDto, TimelineStatDto

### Community 123 - "useEventsBbox.ts"
Cohesion: 0.43
Nodes (6): useEventsBbox(), UseEventsBboxOptions, UseEventsBboxResult, fetchEventsBbox(), convertEventsToGeoJson(), validateBBox()

### Community 124 - "isDevelopmentDemoEnabled"
Cohesion: 0.50
Nodes (4): isDevelopmentDemoEnabled(), 2.1 Güvenlik Açığı Analizi (Önceki Durum), 2.2 Uygulanan Güvenlik Kuralları, 2. Demo Veri Güvenliği ve İzolasyon Mimarisi

## Knowledge Gaps
- **137 isolated node(s):** `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport`, `pg`, `reflect-metadata` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1192 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `api/package.json`, `all-exceptions.filter.ts`, `auth.controller.ts`, `shared/src/index.ts`, `main.ts`, `stats.controller.ts`, `UserEntity`, `events.controller.ts`, `EventMediaEntity`, `media.e2e-spec.ts`, `EventStatus`, `app.module.ts`, `JwtAuthGuard`, `RealtimeGateway`, `DevicePushTokenEntity`, `health.controller.ts`, `notifications.service.ts`, `events.e2e-spec.ts`, `IStorageService`, `media.controller.ts`, `stats.service.ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useAppTheme()` (e.g. with `4. Tema Sistemi` and `7. Gerçek Ekran ve Tasarım Sistemi Kontrolü`) actually correct?**
  _`useAppTheme()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@nestjs/platform-express`, `@sehir-nabiz/shared`, `passport` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `1. Geliştirme Fazları` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `EventStatus` connect `EventStatus` to `ModerationEventsQueryDto`, `showcase.tsx`, `map.types.ts`, `EventEntity`, `shared/src/index.ts`, `useAppTheme`, `react`, `EventsService`, `event.types.ts`, `event.schema.ts`, `stats.controller.ts`, `UserEntity`, `events.controller.ts`, `media.e2e-spec.ts`, `enums/index.ts`, `index.test.ts`, `events.e2e-spec.ts`, `seed-demo-events.ts`, `EventResponseDto`, `stats.service.ts`, `NearbyEventsDto`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `AppText()` (e.g. with `Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi (TAMAMLANDI)` and `6. Temel UI Bileşen Kütüphanesi`) actually correct?**
  _`AppText()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._