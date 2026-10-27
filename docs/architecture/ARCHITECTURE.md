# ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)

Bu belge, ŞehirNabız mobil uygulaması ve sunucu altyapısının uçtan uca teknik mimarisini, teknoloji seçimlerinin gerekçelerini ve sistem tasarım prensiplerini detaylandırır.

---

## 1. Mimari Genel Bakış

ŞehirNabız; yüksek frekansta coğrafi olay bildirimleri alan, bu bildirimleri doğruluk filtresinden geçiren ve on binlerce eşzamanlı mobil kullanıcıya akıcı harita deneyimi sunan dağıtık bir sistemdir.

```mermaid
flowchart TD
    subgraph MobileApp ["Mobil İstemci (React Native + Expo)"]
        UI["Arayüz & Expo Router"]
        MapEngine["MapLibre Native (Metal/OpenGL)"]
        State["Zustand + TanStack Query"]
        Cache["MMKV Offline Depolama"]
        UI --> State
        UI --> MapEngine
        State --> Cache
    end

    subgraph CDN_Storage ["CDN & Depolama"]
        VectorTiles["Vector Tile Sunucusu (MapTiler / OSM)"]
        S3Storage["Cloudflare R2 / S3 (Fotoğraflar)"]
    end

    subgraph BackendCluster ["NestJS Backend Kümesi"]
        Gateway["API Gateway / Reverse Proxy (Nginx / Traefik)"]
        AuthModule["Auth & Identity Modülü"]
        EventModule["Event & Geo Modülü"]
        VerifyModule["Moderation & Karma Engine"]
        OutboxModule["Transactional Outbox & Worker"]
        RealtimeGW["WebSocket Gateway (Socket.io)"]
        QueueWorker["BullMQ Worker (Arka Plan Görevleri)"]
    end

    subgraph DataTier ["Veri Katmanı"]
        Postgres[(PostgreSQL 16 + PostGIS)]
        Redis[(Redis 7 - Cache & Pub/Sub)]
    end

    MapEngine -->|Vektör Karoları| VectorTiles
    MobileApp -->|Presigned Upload| S3Storage
    MobileApp -->|REST API / HTTPS| Gateway
    MobileApp -->|Canlı Olay Akışı| RealtimeGW

    Gateway --> AuthModule
    Gateway --> EventModule
    Gateway --> VerifyModule
    EventModule --> OutboxModule
    OutboxModule --> Postgres
    OutboxModule --> RealtimeGW
    OutboxModule --> Redis
    EventModule --> Postgres
    EventModule --> Redis
    VerifyModule --> Postgres
    QueueWorker --> Postgres
    QueueWorker --> Redis
    RealtimeGW --> Redis
```

---

## 2. Mobil Harita Kütüphanesi Seçimi ve Analizi

Mobil harita katmanı, uygulamanın çekirdek bileşenidir. Expo ekosistemindeki başlıca çözümler karşılaştırmalı olarak incelenmiştir:

| Kriter | `react-native-maps` | `@maplibre/maplibre-react-native` | `react-native-webview` + Leaflet |
| :--- | :--- | :--- | :--- |
| **Render Motoru** | Apple Maps (iOS) / Google Maps (Android) | MapLibre Native (GPU / OpenGL / Metal) | WebView (DOM / Canvas) |
| **Expo Go Uyumluluğu** | Kısmi (Temel haritalar çalışır) | **Çalışmaz** (Dev Client gerektirir) | Çalışır |
| **Expo Dev Client (Prebuild)** | Desteklenir (Config Plugin) | **Tam Destek** (Official Config Plugin) | Desteklenir |
| **New Architecture (Fabric)** | Kısmi / Geçiş aşamasında | **Tam Uyumlu** (v11+ Native C++ Core) | Uyumlu |
| **Büyük Ölçekli Marker Performansı**| 150-300+ markerdan sonra FPS düşüşü | **10.000+ marker GPU clustering (60 FPS)**| Düşük performans / Donma |
| **Özel Vektör Tile ve Stiller** | Çok sınırlı (Sadece Google JSON stili) | **Sınırsız** (Mapbox GL Style Spec uyumlu) | Yüksek |
| **Maliyet ve Sağlayıcı Kilidi** | Google Cloud faturalandırması zorunlu | **Sağlayıcı Bağımsız** (OSM, MapTiler, Self-host)| Sağlayıcı Bağımsız |
| **Offline Vektör Önbellek** | Desteklenmez (Google önbelleğine bağımlı) | **Tam Destek** (Offline Pack Manager) | Sınırlı |

### Seçim Kararı ve Gerekçe: `@maplibre/maplibre-react-native`

1. **Performans:** Şehir ölçeğinde aynı anda yüzlerce olayın (trafik, kaza, yol çalışması, etkinlik) haritada pinlenmesi gerekir. MapLibre, verileri GPU seviyesinde GeoJSON kaynağı ve `SymbolLayer` / `CircleLayer` olarak doğrudan ekrana çizer; React Native JS köprüsünü (bridge) meşgul etmez.
2. **Maliyet ve Bağımsızlık:** Google Maps API, kullanıcı sayısı arttıkça yüksek harita yükleme ve geocoding faturalarına yol açar. MapLibre ile açık kaynak MapTiler, Stadia veya kendi sunucumuzda barındırılan OpenStreetMap vektör karo sunucuları (Martin / pg_tileserv) kullanılabilir.
3. **Expo Prebuild & SDK 58 Uyumu:** Projemiz profesyonel bir üretim (production) mimarisi hedeflediğinden Expo Go kısıtlamalarına bağımlı değildir; Expo SDK 58 (`expo-dev-client`) ile React Native 0.88 New Architecture üzerinde derleme yapılandırılmıştır.

---

## 3. Backend Mimarisi (`apps/api`: NestJS 12 + PostgreSQL/PostGIS)

### 3.1 Neden NestJS?
- **Katmanlı ve Modüler Yapı:** Controller, Service, Repository, DTO ve Entity ayrımı ile kurumsal kod kalitesi (`apps/api` modülü).
- **Dependency Injection (DI):** Test edilebilirlik (Vitest / E2E) ve modüller arası gevşek bağlılık (loose coupling).
- **TypeScript Strict Entegrasyonu:** Derleme zamanı tip güvenliği ve Zod tabanlı ortak DTO doğrulaması.
- **WebSocket & Microservice Desteği:** İlerleyen fazlarda bildirim veya analitik servislerinin ayrılmasına hazır yapı.

### 3.2 ORM Karar Analizi: TypeORM vs Prisma vs Drizzle
PostgreSQL + PostGIS uzamsal yetenekleri ve NestJS 12 ekosistemi için üç temel ORM değerlendirilmiştir:

| Kriter | TypeORM (Seçilen) | Prisma | Drizzle ORM |
| :--- | :--- | :--- | :--- |
| **PostGIS Spatial Tipleri** | **Tam Destek (`@Column('geometry')`)** | Kısıtlı (`Unsupported` veri tipi) | Eklenti/Custom Type gerekir |
| **Spatial Fonksiyonlar & GIST** | **Dahili (`@Index({ spatial: true })`)** | Sadece `$queryRaw` ile mümkün | SQL template ile mümkün |
| **NestJS Entegrasyonu** | **Resmi `@nestjs/typeorm` (Birinci sınıf)** | Topluluk paketi / Servis wrapper | Manuel Provider yapılandırması |
| **Migration Yönetimi** | **Dahili çift yönlü (Up/Down) CLI** | Şema odaklı deklaratif migration | Drizzle-kit migration |
| **TypeScript Strict Uyum** | Tam uyumlu (`strictPropertyInitialization` ! ile)| Tam uyumlu | Tam uyumlu |

**Karar Gerekçesi:** ŞehirNabız'ın çekirdeği coğrafi uzamsal sorgulardır (`ST_DWithin`, `ST_MakeEnvelope`, `GIST`). Prisma'nın PostGIS tiplerini birinci sınıf desteklemeyip raw SQL'e zorlaması dezavantajdır. TypeORM, NestJS'in yerleşik modüler yapısına, transaction yönetim mekanizmasına ve PostGIS spatial entity desteğine en uygun çözümdür.

### 3.3 Oturum ve Token Yaşam Döngüsü (Token Rotation & Reuse Detection)
```mermaid
sequenceDiagram
    autonumber
    actor Client as Mobil İstemci (SecureStore)
    participant Auth as NestJS AuthModule
    participant DB as PostgreSQL (RefreshTokens)

    Client->>Auth: POST /api/v1/auth/login
    Auth->>DB: Kullanıcı ve Şifre Doğrula
    Auth->>DB: Refresh Token Hash'ini Kaydet
    Auth-->>Client: Access Token (15m) + Refresh Token (7d)

    Note over Client,Auth: Access Token Süresi Dolduğunda
    Client->>Auth: POST /api/v1/auth/refresh (Mevcut Refresh Token)
    Auth->>DB: Token Hash Sorgula
    alt Token Daha Önce Kullanılmış / İptal Edilmiş (Reuse Detection)
        Auth->>DB: KULLANICININ TÜM AKTİF OTURUMLARINI DERHAL İPTAL ET!
        Auth-->>Client: 401 Unauthorized (Güvenlik ihlali şüphesi)
    else Token Geçerli ve Aktif
        Auth->>DB: Eski Token'ı İptal Et (isRevoked = true, replacedByTokenHash = newHash)
        Auth->>DB: Yeni Token Hash'ini Kaydet
        Auth-->>Client: Yeni Access Token + Yeni Refresh Token
    end
```

### 3.4 PostgreSQL + PostGIS Uzamsal (Spatial) Stratejisi
Tüm coğrafi veriler WGS 84 (`SRID 4326`) projeksiyon sisteminde tutulur.

- **Veri Tipi:** `geometry(Point, 4326)` (Hassas mesafe hesaplamaları için gerektiğinde `geography(Point, 4326)` fonksiyonları veya `ST_Transform` kullanılır).
- **Uzamsal İndeksleme:** Coğrafi sorguların milisaniye altında yanıt vermesi için tüm konum sütunlarında `GIST (Generalized Search Tree)` indeksi kullanılır:
  ```sql
  CREATE INDEX idx_events_location_gist ON events USING GIST(location);
  ```
- **Kritik Uzamsal Sorgular:**
  1. **Yarıçap Sorgusu (`ST_DWithin`):** Kullanıcının bulunduğu noktadan $R$ km uzaklıktaki olayları listeleme.
     ```sql
     SELECT id, title, category, ST_AsGeoJSON(location) 
     FROM events 
     WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radiusInMeters)
       AND status = 'ACTIVE';
     ```
  2. **Görünür Ekran Kapsama Sorgusu (`ST_MakeEnvelope`):** Haritanın bounding box (bbox) sınırları içindeki olayları çekme:
     ```sql
     SELECT id, title, location 
     FROM events 
     WHERE location && ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326);
     ```
  3. **Mükerrer Bildirim Tespiti:** Yeni bildirilen bir olayın 150 metre yakınında son 30 dakikada benzer kategoride açılmış olay var mı kontrolü.

### 3.5 Medya Depolama ve Güvenlik Mimarisi (`StorageModule` & `MediaModule`)
- **Direct-to-Storage Presigned Uploads:** Mobil cihazlar fotoğrafları doğrudan S3 uyumlu nesne deposuna (Yerelde MinIO, Üretimde Cloudflare R2) yükler. NestJS API bellek darboğazına girmez.
- **Güvenlik Doğrulamaları:** Magic bytes denetimi, dekompresyon bombası kalkanı (`limitInputPixels`), EXIF/GPS meta verisi sıfırlama, Full HD WebP dönüştürme ve SHA-256 bütünlük özeti.
- **Eşzamanlılık ve Kota:** Olay başına en fazla 3 aktif/bekleyen fotoğraf; veritabanı düzeyinde pessimistic lock (`SELECT ... FOR UPDATE`) ile korunur.
- Detaylı inceleme için: [docs/architecture/MEDIA_SECURITY.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/MEDIA_SECURITY.md).

---

## 4. Durum Yönetimi ve Veri Akışı

1. **Sunucu Durumu (Server State):** `@tanstack/react-query`
   - Olay listeleri, kullanıcı profilleri ve harita pinleri için otomatik arka plan tazeleme, stale-while-revalidate ve offline önbellek desteği.
2. **İstemci Durumu (Client State):** `zustand`
   - Aktif harita filtreleri (kategori, zaman aralığı, güvenilirlik eşiği), oturum belirteçleri (tokens) ve tema ayarları.
3. **Yerel Kalıcı Depolama:** `react-native-mmkv`
   - AsyncStorage'a göre 30 kat daha hızlı, C++ tabanlı güvenli yerel anahtar-değer deposu.

---

## 5. Gerçek Zamanlı İletişim Stratejisi

- **İstemci -> Sunucu:** Olay bildirimi, fotoğraf yükleme ve teyit oylamaları HTTPS REST API üzerinden gerçekleşir.
- **Sunucu -> İstemci:**
  - **Kritik Acil Durumlar (Afet, Yol Kapanması):** Expo Push Notifications (APNs / FCM) üzerinden hedef coğrafi bölgedeki kullanıcılara anlık bildirim.
  - **Canlı Harita Güncellemeleri:** Harita ekranı açıkken WebSocket (Socket.io) kanalı üzerinden kullanıcının aktif koordinat bounding box'ına giren yeni olaylar anında haritaya eklenir.

---

## 6. Güvenilirlik ve Süreklilik Garantisi

- **Docker Compose:** Yerel geliştirme ortamında tek komutla PostgreSQL (PostGIS), Redis ve NestJS ayağa kaldırılır.
- **Graceful Degradation (Kademeli Bozulma):** Harita karo sunucusuna erişilemediğinde offline raster önbellek devreye girer. Backend bağlantısı koptuğunda MMKV'deki son başarılı sorgu verileri kullanıcıya hissettirilmeden sunulur.

---

## 7. Topluluk Teyit Sistemi ve Moderasyon Mimarisi (Phase 8 Uygulaması)

1. **Topluluk Katılımı ve Açıklanabilir Güvenilirlik:**
   - Vatandaşlar sahadaki olaylar için "Ben de Gördüm" (`CONFIRM`), "Yanlış Bilgi Bildir" (`DISPUTE`) ve "Sorun Çözüldü" (`RESOLVED_REPORT`) bildirimlerinde bulunur.
   - Her kullanıcı için olay bazında tek aktif geri bildirim kuralı uygulanır (`uq_event_feedback_event_user`).
   - Sahte kesinlik ("%95 doğru" gibi) algoritmaları yerine şeffaf ve açıklanabilir bildirim özeti sunulur (Örnek: "12 kişi gördüğünü bildirdi, 3 kişi itiraz etti").
   - Topluluk oyları olayı otomatik olarak onaylamaz veya kapatmaz; durum yönetimi moderatör ve yetkililere aittir.
2. **Rol Tabanlı Moderasyon ve Denetim İzi (Audit Trail):**
   - `MODERATOR` ve `ADMIN` rolleri bekleyen olayları inceler, topluluk itirazlarını değerlendirir ve gerekçeli kararlar alır.
   - Her durum değişikliği transaction içerisinde `event_moderation_logs` tablosuna kalıcı denetim kaydı olarak işlenir.
3. **Kullanıcı İtibar Denetimi:**
   - İlk sürümde manipülasyona ve puan kasmaya karşı oylamayla sınırsız itibar kazanımı engellenmiştir.
   - İleride moderasyon teyitli puanlama için `user_reputation_logs` audit trail altyapısı hazır tutulmaktadır.

---

## 8. Gerçek Zamanlı Sistem, WebSocket & Akıllı Bildirimler (Phase 9 Uygulaması)

1. **WebSocket Ağ Geçidi & Redis Adaptörü (`RealtimeGateway` & `RedisIoAdapter`):**
   - `/realtime` ad alanında Socket.IO sunucusu ve `@socket.io/redis-adapter` kümeleme desteği.
   - JWT handshake ile oturumlu kullanıcılar için özel `user:${userId}` odası, anonim kullanıcılar için genel `events:global` odası.
   - `join_moderation` korumalı odası ile sadece `MODERATOR` ve `ADMIN` rollerine canlı kuyruk akışı.
2. **Mesaj Tutarlılığı ve Sıralama Garantisi:**
   - Her olay mesajı `serverEventId` (UUID) ve `eventVersion` taşır.
   - İstemci tarafında son 500 olay kimliği ile deduplication ve eski durumların yeni durumu ezmesini önleyen monotonik sürüm denetimi.
   - Ağ kopmaları (Wi-Fi/Mobil veri geçişi) sonrası snapshot mutabakatı (reconciliation) ile REST üzerinden veri tazeleme.
3. **Akıllı Bildirimler ve Expo Push Altyapısı (`NotificationsModule`):**
   - Kullanıcıya özel olay onay, red, çözüm ve teyit bildirimleri (`user_notifications`).
   - Cihaz push tokenları (`device_push_tokens`) ve kullanıcı tercihleri (`user_notification_preferences`).
   - Geliştirme ortamında kontrollü simülasyon adaptörü; canlıda Expo Push API ve `DeviceNotRegistered` token temizliği.
   - Detaylı mimari belgeleri: [REALTIME_ARCHITECTURE.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/REALTIME_ARCHITECTURE.md) ve [PUSH_NOTIFICATIONS_GUIDE.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/PUSH_NOTIFICATIONS_GUIDE.md).

---

## 9. Şehir Analitiği, Isı Haritası ve Arama Mimarisi (Phase 10 Uygulaması)

### 9.1 Şehir İstatistikleri & Dağıtık Önbellekleme (`StatsModule`)
- **Şehir Özeti (`GET /api/v1/stats/overview`):**
  - Seçilen şehir ve zaman dilimine (`24h`, `7d`, `30d`, `all`) göre toplam, çözülen, aktif ve itirazlı olay metrikleri.
  - Kategori bazında olay sayısı ve yüzdelik dağılımı.
  - Günlük zaman çizelgesi kırılımı (`DATE_TRUNC('day', created_at)`).
  - İlçe bazlı karşılaştırma ve bildirim yoğunluğu tablosu.
  - Yüksek trafik altında veritabanı yükünü asgariye indirmek için 60 saniyelik Redis önbelleklemesi (`stats:overview:<city>:<period>`).
  - **Sorumluluk Reddi (Disclaimer):** Gerçek risk ve afet algısını manipüle etmemek adına tüm yanıtlarda zorunlu kentsel bildirim kısıtlama notu eklenir.

### 9.2 PostGIS Isı Haritası (Heatmap) ve Uzamsal Izgara Agregasyonu
- **Sınırlı Veri Yanılsamasının Önlenmesi:**
  - Haritada yalnızca ilk 300 olayı ham nokta olarak çizip bunu "şehir ısı haritası" olarak sunmak yanıltıcıdır.
  - Bunun yerine PostGIS seviyesinde uzamsal ızgara agregasyonu (`ROUND(ST_X(location)::numeric, 3)`) kullanılarak ~110 metre hassasiyetindeki hücreler toplanır (`COUNT(*)`).
  - Hücreler `weight` (0.1 - 1.0) değerine normalize edilir ve donanım ivmeli MapLibre `heatmap` katmanı ile çizdirilir.
  - `heatmap-opacity` değeri azami 0.65 ile sınırlandırılarak alt harita etiketlerinin okunabilirliği garanti altına alınır.

### 9.3 Kamusal Arama Motoru (`EventsModule.searchEvents`)
- **Metin Sorgulama:** Başlık ve açıklamalarda Türkçe karakter duyarsız (`ILIKE %q%`) arama.
- **Gizlilik Yalıtımı:** Kamusal arama yalnızca onaylanmış kamusal durumlardaki (`ACTIVE`, `RESOLVED`, `DISPUTED`) olayları listeler; `PENDING_REVIEW` veya `REJECTED` olaylar asla genel aramada çıkmaz.
- **Performans:** Minimum 2 karakter arama sınırı, kategori ve tarih filtreleri, cursor-based sayfalama.

### 9.4 Kullanıcı Portali & Bildirimlerim (`UsersModule`)
- **Kullanıcı Katkı Metrikleri (`GET /api/v1/users/me/stats`):** Kullanıcının gerçek bildirdiği, teyit ettiği ve çözülen olay sayıları ile itibar kademesi (`Yeni Katılımcı`, `Aktif Yurttaş`, `Güvenilir Gözlemci`, `Şehir Muhafızı`).
- **Bildirimlerim Ekranı (`GET /api/v1/users/me/events`):** Kullanıcının kendi gönderdiği tüm olayları (bekleyen, onaylanan, çözülen, reddedilen) görmesini sağlar. Reddedilen olaylar için moderatörün bıraktığı `rejectionReason` güvenle gösterilir; başkalarının olaylarına erişim kesinlikle engellenir.
- **Ayrı Ayarlar Ekranı:** Tema seçimi (Light/Dark/System), bildirim tercihleri anahtarları (`followedEvents`, `confirmedEvents`, `reportedEvents`, `nearbyEvents`, `pushEnabled`), gizlilik bilgilendirmesi ve sürüm bilgisi.

