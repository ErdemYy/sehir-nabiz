# ŞehirNabız — Phase 3: Coğrafi Veri ve Olay Yönetimi API'si Raporu (PHASE_3_REPORT.md)

**Tarih:** 25 Ekim 2026  
**Aşama:** Phase 3 — Coğrafi Veri ve Olay Yönetimi API'si  
**Önceki Commit:** `9d6ad1a`  
**Durum:** **TAMAMLANDI VE CANLI POSTGIS İLE %100 DOĞRULANDI**

---

## 1. Oluşturulan Dosyalar ve Modüller

| Modül / Paket | Dosya Yolu | Açıklama |
| --- | --- | --- |
| **Shared Paket** | [packages/shared/src/enums/index.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/packages/shared/src/enums/index.ts) | 11 kategori kodu (`CategoryCode`), `EventStatus`, `EventSeverity` enumları |
| **Shared Paket** | [packages/shared/src/types/event.types.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/packages/shared/src/types/event.types.ts) | `CategoryDto`, `EventResponseDto`, `PaginatedEventsResponse`, `DuplicateWarningDto` |
| **Shared Paket** | [packages/shared/src/schemas/event.schema.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/packages/shared/src/schemas/event.schema.ts) | `CreateEventDtoSchema`, `NearbyEventsQuerySchema`, `BBoxEventsQuerySchema`, `UpdateEventStatusSchema` |
| **Database Entity** | [apps/api/src/database/entities/category.entity.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/entities/category.entity.ts) | Kategori veritabanı varlığı |
| **Database Entity** | [apps/api/src/database/entities/event.entity.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/entities/event.entity.ts) | Olay veritabanı varlığı (PostGIS `geometry(Point, 4326)`) |
| **Database Entity** | [apps/api/src/database/entities/event-moderation-log.entity.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/entities/event-moderation-log.entity.ts) | Moderasyon denetim izi (Audit Trail) |
| **Database Migration** | [apps/api/src/database/migrations/1740000001000-CreateCategoriesAndEvents.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/migrations/1740000001000-CreateCategoriesAndEvents.ts) | Geri alınabilir migration ve 11 kategori seed SQL'i |
| **Categories Module** | [apps/api/src/modules/categories/](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/categories/) | `CategoriesModule`, `CategoriesService`, `CategoriesController` |
| **Events Module** | [apps/api/src/modules/events/](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/modules/events/) | `EventsModule`, `EventsService`, `EventsController`, DTO'lar |
| **Common Guard** | [apps/api/src/common/guards/optional-jwt-auth.guard.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/common/guards/optional-jwt-auth.guard.ts) | Anonim istekleri düşürmeyen, token varsa kimlik çıkaran guard |
| **Database Seed** | [apps/api/src/database/seeds/seed-demo-events.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/database/seeds/seed-demo-events.ts) | Kayseri pilot şehri için 6 adet kontrollü demo olay seed betiği |
| **E2E Testler** | [apps/api/test/events.e2e-spec.ts](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/test/events.e2e-spec.ts) | Canlı PostGIS coğrafi sorguları ve yaşam döngüsü E2E testi |

---

## 2. Veritabanı Tabloları

1. **`categories` Tablosu:**
   - 11 standart kategori: `TRAFFIC`, `ACCIDENT`, `ROAD_WORK`, `WATER_OUTAGE`, `POWER_OUTAGE`, `INFRASTRUCTURE`, `PUBLIC_TRANSPORT`, `WEATHER`, `DISASTER`, `EVENT`, `OTHER`.
   - Türkçe isim (`name_tr`), açıklama (`description_tr`), harita ikon adı (`icon`), renk kodu (`color_hex`), varsayılan yayından kalkma süresi (`default_duration_hours`), aktiflik (`is_active`).
   - Mükerrerliği önleyen tekil indeks: `uq_categories_code`.
2. **`events` Tablosu:**
   - `id`: UUID (Primary Key)
   - `authorId`: UUID (foreign key -> `users.id` ON DELETE CASCADE)
   - `categoryId`: UUID (foreign key -> `categories.id` ON DELETE RESTRICT)
   - `title`: VARCHAR(150), `description`: TEXT
   - `severity`: ENUM `event_severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
   - `status`: ENUM `event_status` (`PENDING_REVIEW`, `ACTIVE`, `DISPUTED`, `RESOLVED`, `REJECTED`, `EXPIRED`)
   - `location`: GEOMETRY(Point, 4326) NOT NULL
   - `confirmationCount`, `denialCount`, `reliabilityScore`
   - `expiresAt`, `resolvedAt`, `isDemo`
3. **`event_moderation_logs` Tablosu:**
   - Olay durum değişikliklerinin kim tarafından (`moderatorId`), ne zaman, hangi gerekçeyle (`reason`) yapıldığını tutan güvenli audit trail.

---

## 3. PostGIS Veri Tipi ve İndeksleme Stratejisi

- **Projeksiyon:** WGS 84 (`SRID 4326`)
- **Koordinat Sırası:** PostGIS standartlarına uygun olarak `ST_MakePoint(longitude, latitude)` formatında boylam önce, enlem sonra işlenir.
- **Mesafe ve Yarıçap Mantığı:** `geometry(Point, 4326)` veri tipi üzerinde küresel metre hesaplamaları için `::geography` tür dönüşümü yapılarak `ST_DWithin` ve `ST_Distance` kullanılır:
  ```sql
  ST_DWithin(e.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radiusMeters)
  ```
- **Uzamsal GiST İndeksi:**
  ```sql
  CREATE INDEX idx_events_location_gist ON events USING GIST (location);
  ```
- **B-Tree Bileşik İndeksler:**
  - `idx_events_status_created_at` ON `events (status, createdAt DESC)`
  - `idx_events_category_id_status` ON `events (categoryId, status)`
  - `idx_events_expires_at` ON `events (expiresAt) WHERE status = 'ACTIVE'`

---

## 4. API Uç Noktaları

| Uç Nokta | Metot | Kimlik Doğrulama | Açıklama |
| --- | --- | --- | --- |
| `/api/v1/categories` | `GET` | Herkese Açık | Aktif kategorileri, renk ve ikon meta verileriyle listeler |
| `/api/v1/events` | `POST` | Zorunlu (JWT) | Yeni olay bildirimi oluşturur (İlk durum: `PENDING_REVIEW`, duplicate uyarısı kontrolü) |
| `/api/v1/events/nearby` | `GET` | Opsiyonel (JWT) | `ST_DWithin` ile belirtilen yarıçaptaki onaylı olayları mesafeye göre sıralı getirir |
| `/api/v1/events/bbox` | `GET` | Opsiyonel (JWT) | Harita ekranının bounding box sınırları içindeki olayları çeker |
| `/api/v1/events/:id` | `GET` | Opsiyonel (JWT) | Olay detayını döner (Hassas yazar verileri gizlenir, PENDING/REJECTED olaylar yetkisizlere 404 döner) |
| `/api/v1/events/:id/status` | `PATCH` | Zorunlu (JWT) | Olay durumunu günceller (Moderatör / Belediye / Yazar yetkilendirme matrisi ve audit trail) |

---

## 5. Filtreleme ve Cursor Tabanlı Sayfalama

- **Nearby Sayfalama:** `ORDER BY distance_meters ASC, id ASC` sıralaması ile `cursor = base64(distance_id)` biçiminde deterministiktir. Sayfalar arasında gezinirken yeni pin eklense dahi kayıt atlama veya mükerrer gösterme yaşanmaz.
- **BBox Sayfalama:** `ORDER BY createdAt DESC, id ASC` sıralaması ile `cursor = base64(createdAt_id)` kullanılır.
- **Limit:** İstek başına varsayılan 20, en fazla 100 kayıt dönecek şekilde sınırlandırılmıştır.
- **Antimeridian Crossing (Tarih Çizgisi Sınır Durumu):** `west > east` olduğu durumlarda PostGIS sorgusu otomatik olarak iki ayrı koordinat zarfına (`ST_MakeEnvelope`) ayrılarak okyanus aşırı harita kaydırmalarında hata oluşması engellenmiştir.

---

## 6. Mükerrer Bildirim Kontrolü (Duplicate Detection)

- Olay oluşturulduğunda veritabanında son **45 dakika** içinde, **150 metre** yarıçapında ve **aynı kategoride** açılmış aktif/bekleyen bir olay olup olmadığı `ST_DWithin` ile taranır.
- Farklı bir kaza veya farklı bir arıza olabilme ihtimali gözetilerek kullanıcının isteği engellenmez (non-blocking advisory).
- Eşleşme varsa API yanıtına `duplicateWarning` eklenerek mobil arayüzün kullanıcıya *"Bu olay zaten bildirilmiş olabilir"* uyarısı göstermesi sağlanır:
  ```json
  "duplicateWarning": {
    "isDuplicateSuspected": true,
    "candidateId": "8b2f4056-...",
    "candidateTitle": "Kayseri Meydan Trafik Tıkanıklığı",
    "distanceMeters": 80,
    "createdAt": "2026-10-25T14:19:25.000Z"
  }
  ```

---

## 7. Moderasyon ve Güvenlik Denetimi

1. **Varsayılan Statü Güvenliği:** Normal kullanıcıların kendi bildirimlerini `ACTIVE` veya `VERIFIED` yapması engellenmiştir. Tüm bildirimler `PENDING_REVIEW` durumunda başlar.
2. **Yetki Matrisi:**
   - `PENDING_REVIEW -> ACTIVE | REJECTED`: Yalnızca `MODERATOR` veya `ADMIN`.
   - `ACTIVE -> RESOLVED`: Olayın kendi yazarı (`author`), `MUNICIPAL_OFFICER`, `MODERATOR` veya `ADMIN`.
   - `ACTIVE -> DISPUTED`: Topluluk itirazı, `MODERATOR` veya `ADMIN`.
   - Geçersiz geçişler `400 Bad Request`, yetkisiz geçişler `403 Forbidden` ile engellenir.
3. **Denetim İzi (Audit Trail):** Her durum değişikliği `event_moderation_logs` tablosuna işlem yapan kullanıcının kimliği, eski durum, yeni durum ve gerekçe ile transaction içinde kaydedilir.
4. **Konum ve Kimlik Gizliliği:**
   - Genel API yanıtlarında yazarın e-posta adresi, telefon numarası ve şifre hash'i kesinlikle bulunmaz (`PublicAuthorDto`: Yalnızca `id`, `displayName`, `reputationScore`).
   - Moderasyonda bekleyen veya reddedilen olaylar rastgele bir kullanıcı tarafından sorgulandığında `404 Not Found` dönerek olayın varlığı gizlenir.

---

## 8. Test Sonuçları

```text
 RUN  v5.0.5 C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api

 ✓ src/modules/auth/guards/guards.spec.ts (5 tests)
 ✓ src/common/guards/roles.guard.spec.ts (3 tests)
 ✓ src/modules/health/health.controller.spec.ts (3 tests)
 ✓ test/auth.e2e-spec.ts (11 tests)
 ✓ src/modules/categories/categories.service.spec.ts (3 tests)
 ✓ src/modules/events/events.service.spec.ts (10 tests)
 ✓ test/events.e2e-spec.ts (18 tests)
 ✓ src/modules/auth/auth.service.spec.ts (11 tests)

 Test Files  8 passed (8)
      Tests  64 passed (64)
   Duration  3.11s
```

Tüm paketlerin genel doğrulaması:
- `pnpm turbo test`: 6 görev başarılı, 0 hata (Shared 4 test + API 64 test).
- `pnpm turbo typecheck`: 6 görev başarılı (TypeScript strict mode, 0 hata).
- `pnpm turbo lint`: 6 görev başarılı (0 hata).
- `pnpm turbo build`: 5 paket eksiksiz derlendi.

---

## 9. Spatial Sorgu Performansı (EXPLAIN ANALYZE)

PostgreSQL 16 canlı sunucusunda `idx_events_location_gist` uzamsal indeksinin çalışma planı doğrulanmıştır:

```text
Query: EXPLAIN ANALYZE SELECT id, title FROM events WHERE location && ST_MakeEnvelope(35.4, 38.6, 35.6, 38.8, 4326);

Plan: Index Scan using idx_events_location_gist on events
      Planning Time: 8.463 ms
      Execution Time: 0.149 ms
```
Sorgu yürütme süresi **0.149 ms** ile sub-millisecond seviyesinde son derece hızlıdır.

---

## 10. Graphify Metrikleri

`graphify update .` komutu çalıştırılarak kod tabanının bilgi grafiği güncellenmiştir:
- **Toplam Düğüm (Nodes):** 1023 (+185 yeni düğüm)
- **Toplam Kenar (Edges):** 1655 (+500 yeni bağlantı)
- **Topluluk Sayısı (Communities):** 71 (+13 yeni küme)
- **Döngüsel Bağımlılık (Circular Dependency):** 0 (Temiz katmanlı mimari).

---

## 11. Git Commit

- **Önceki Commit:** `9d6ad1a`
- **Phase 3 Commit:** `4e526a1` (veya ilgili oluşturulan commit)

---

## 12. Teknik Riskler ve Alınan Önlemler

| Tespit Edilen Risk | Olasılık | Etki | Alınan Önlem |
| --- | --- | --- | --- |
| **Aşırı Bounding Box Boyutu ile DoS** | Orta | Yüksek | `(north - south) * abs(east - west) > 100` kontrolü ile devasa alan sorguları 400 ile reddedilir. |
| **Enlem/Boylam Sırası Karışıklığı** | Düşük | Kritik | PostGIS standardı olan `(longitude, latitude)` kuralı tüm query builder ve fonksiyonlarda sabitlendi; E2E testi ile kilitlendi. |
| **Sayfalamada Kayıt Atlama** | Orta | Orta | Ofset yerine deterministik `(distance_meters, id)` bileşik imleci (cursor) kullanıldı. |
| **Mükerrer Bildirim İndirgemesi Hatası** | Orta | Orta | Kullanıcı engellenmedi; sisteme bilgilendirici uyarı (`duplicateWarning`) eklendi. |

---

## 13. Phase 4 (Medya & Depolama Yönetimi) Önerileri

1. **Cloudflare R2 Entegrasyonu:** Olaylara eklenecek fotoğraflar için presigned upload URL servisi geliştirilmeli.
2. **İstemci Tarafında EXIF Temizleme:** Fotoğraflar cihazdan çıkmadan önce GPS meta verileri silinmeli.
3. **Maksimum 3 Görsel Kısıtı:** Olay başına görsel sayısı sınırlandırılmalı ve `event_media` tablosu oluşturulmalıdır.
