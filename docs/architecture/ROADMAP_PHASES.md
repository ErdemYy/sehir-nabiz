# ŞehirNabız — Geliştirme Fazları ve MVP Yol Haritası (ROADMAP_PHASES.md)

Bu belge, projenin kontrollü, test edilebilir ve adım adım ilerleyen geliştirme fazlarını, her fazın başarı kriterlerini ve ilk sürüm için netleştirilmiş MVP (Minimum Viable Product) kapsamını tanımlar.

---

## 1. Geliştirme Fazları

### Phase 0: Proje Hazırlığı ve Mimari Planlama (TAMAMLANDI)
- **Kapsam:** Mevcut durum tespiti, Graphify entegrasyonu, mimari dokümanların (`AGENTS.md`, `ARCHITECTURE.md`, `DATA_MODELS.md`, `SECURITY_PRIVACY.md`, `ROADMAP_PHASES.md`) oluşturulması. Harita, backend ve veri modeli kararlarının gerekçelendirilmesi.
- **Başarı Kriteri:** Proje çalışma alanının ve dokümantasyonun eksiksiz hazır olması, Graphify grafının kurulması.

### Phase 1: Monorepo & Ortak Paket Yapılandırması (TAMAMLANDI)
- **Kapsam:** pnpm workspace ve Turborepo altyapısı. `packages/shared`, `packages/config`, `packages/design-tokens`, `apps/api` (NestJS 12) ve `apps/mobile` (Expo SDK 58) kurulumu. Zod şemaları, ortak TypeScript tipleri, health check, global exception filter ve temiz başlangıç ekranı.
- **Doğrulama:** `pnpm turbo build`, `pnpm turbo typecheck`, `pnpm turbo test` ve API `/api/v1/health` kontrolü (Commit: `7a7b0b6`).

### Phase 2: Backend Çekirdek, Docker, PostGIS ve Güvenli Kimlik Doğrulama (TAMAMLANDI)
- **Kapsam:** Docker Compose (PostgreSQL 16 + PostGIS 3.4, Redis 7). TypeORM ile PostGIS entegrasyonu, reversable ilk migration (`users`, `refresh_tokens`), güvenli AuthModule (Register, Login, Token Rotation, Token Reuse Detection, Logout, Me), RedisService (In-memory fallback ile rate limiting), Correlation ID, Readiness probe (`/api/v1/health/ready`).
- **Doğrulama:** 22 birim testi (Auth, Guards, Health, Readiness) ve E2E entegrasyon testi altyapısı.

### Phase 2.5: Gerçek Entegrasyon Doğrulaması ve Güvenlik Kontrolü (TAMAMLANDI)
- **Kapsam:** Canlı Docker PostGIS & Redis entegrasyonu, port izolasyonu (Postgres 5434, Redis 6380), gerçek TypeORM migration ve rollback testleri, PostGIS coğrafi mesafe/yarıçap (`ST_Distance`, `ST_DWithin`) doğrulaması, canlı Auth uç noktaları (Register, Login, Me, Refresh, Reuse Detection, Logout), eşzamanlı istek yarış durumu (Race Condition) CAS koruması, çift katmanlı DTO validasyon zırhı.
- **Doğrulama:** 33 testin tamamı canlı veritabanı ve Redis üzerinde geçti. Detaylı rapor: [PHASE_2_5_VERIFICATION.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_2_5_VERIFICATION.md).

### Phase 3: Coğrafi Veri & Olay Yönetimi API'si (TAMAMLANDI)
- **Kapsam:** 11 temel kategori (`TRAFFIC`, `ACCIDENT`, `ROAD_WORK`, `WATER_OUTAGE`, `POWER_OUTAGE`, `INFRASTRUCTURE`, `PUBLIC_TRANSPORT`, `WEATHER`, `DISASTER`, `EVENT`, `OTHER`), `EventEntity` (PostGIS `geometry(Point, 4326)`), GiST uzamsal indeksi (`idx_events_location_gist`), `POST /api/v1/events` (PENDING_REVIEW başlangıç durumu, sanitizasyon), `GET /api/v1/events/nearby` (`ST_DWithin` & `ST_Distance` metre bazlı), `GET /api/v1/events/bbox` (`ST_MakeEnvelope` ve antimeridian desteği), `GET /api/v1/events/:id` (gizlilik korumalı tekil detay), `PATCH /api/v1/events/:id/status` (moderatör & yazar yetki matrisi, `event_moderation_logs` audit trail), 150m/45dk mükerrerlik uyarısı (Duplicate Detection), Kayseri demo seed altyapısı.
- **Doğrulama:** 64 testin tamamı (8 test paketi) canlı PostgreSQL/PostGIS üzerinde başarıyla geçti. Rapor: [PHASE_3_REPORT.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_3_REPORT.md).

### Phase 4: Medya & Güvenli Depolama Altyapısı (TAMAMLANDI)
- **Kapsam:** S3 uyumlu Object Storage entegrasyonu (Yerel/Test: MinIO, Üretim: Cloudflare R2), Docker Compose MinIO konfigürasyonu (Port: 9000 API, 9001 Konsol), `EventMediaEntity` ve `1740000002000-CreateEventMedia.ts` TypeORM migration, `POST /events/:id/media/upload-url` (Presigned upload URL, 15dk TTL, MIME allowlist, 8MB limit, pessimistic locking ile maks. 3 görsel kotası), `POST /events/:id/media/:mediaId/complete` (Magic bytes doğrulaması, `sharp` dekompresyon bombası koruması `limitInputPixels`, EXIF/GPS meta veri temizleme, Full HD WebP optimizasyonu, SHA-256 bütünlük özeti, bozuk dosyalar için karantina ve otomatik silme), `GET /events/:id/media` (gizlilik korumalı medya listeleme), `DELETE /events/:id/media/:mediaId` (idempotent DB ve S3 silme).
- **Doğrulama:** 84 backend testinin (12 unit, 8 gerçek MinIO E2E) ve 4 shared testinin tamamı başarıyla geçti. Rapor: [PHASE_4_REPORT.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_4_REPORT.md).

### Phase 5: Premium Mobil UI Foundation ve Tasarım Sistemi (TAMAMLANDI)
- **Kapsam:** "Urban Floating UI" tasarım dili, `@sehir-nabiz/design-tokens` (Turkuaz `#14B8A6` primary, 4px grid spacing, 8-24px ve 999px radius, 4 seviyeli platform gölgeleri, Plus Jakarta Sans & Manrope tipografi ölçeği), 24 temel UI bileşeni (`AppText`, `AppButton`, `IconButton`, `FloatingIconButton`, `SearchBar`, `FilterChip`, `CategoryChip`, `AppCard`, `FloatingCard`, `AppInput`, `AppTextArea`, `AppBadge`, `StatusBadge`, `AppDivider`, `AppAvatar`, `AppSkeleton`, `EmptyState`, `ErrorState`, `LoadingState`, `AppScreen`, `AppHeader`, `FloatingTabBar`, `FloatingActionButton`, `BottomSheet`), `MapScreenLayout` harita arayüz altyapısı, 5 sekmeli Expo Router navigasyonu (`(tabs)`: Harita, Akış, Bildir, Bildirimler, Profil), PanResponder tabanlı BottomSheet altyapısı, Light/Dark ThemeProvider, ve yalnızca `__DEV__` ortamında erişilebilir UI Showcase ekranı (`app/showcase.tsx`).
- **Doğrulama:** 105 testin tamamı (84 backend, 11 design-tokens, 6 mobile, 4 shared) başarılı. Rapor: [PHASE_5_REPORT.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_5_REPORT.md). Design System: [DESIGN_SYSTEM.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/design/DESIGN_SYSTEM.md). Ekran Planları: [SCREEN_BLUEPRINTS.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/design/SCREEN_BLUEPRINTS.md).

### Phase 6: Harita Katmanı & Vektör Render (MapLibre) (TAMAMLANDI)
- **Kapsam:** `@maplibre/maplibre-react-native@11.5.0` entegrasyonu, Expo SDK 58, React Native 0.88 New Architecture uyumluluğu, Expo Prebuild (`android/` üretimi), OpenFreeMap/MapLibre vektör stilleri (Liberty, Dark, Satellite), `PulseMapView` harita bileşeni, `MapScreenLayout` entegrasyonu, `expo-location` ile kullanıcı konumu takibi (`useUserLocation`), 11 kategori yatay filtresi, arama çubuğu ("Şehirde ara..."), `GET /api/v1/events/bbox` Events API entegrasyonu (`useEventsBbox` + debounce kamera tetikleyicisi + offline fallback demo verisi), GPU hızlandırmalı GeoJSON kümeleme (`GeoJSONSource`, `CircleLayer`, `SymbolLayer`), küme tıklaması ile kademeli zoom, tekil pin seçimi ve `BottomSheet` olay önizleme paneli (`MapLayerSheet` ile stil değiştirme).
- **Doğrulama:** 115 testin tamamı (16 mobil test, 84 backend testi, 11 token testi, 4 shared testi) başarılı; 1.000 ve 5.000 olay kümeleme stres testleri 2.5ms altında tamamlandı. Rapor: [PHASE_6_REPORT.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_6_REPORT.md). Rehber: [MAPLIBRE_INTEGRATION_GUIDE.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/guides/MAPLIBRE_INTEGRATION_GUIDE.md).

### Phase 6.5: Android Native Doğrulama, Demo Veri Güvenliği ve Harita Kalite Kontrolü (TAMAMLANDI)
- **Kapsam:** Üretim ortamında sentetik olay sızıntısının önlenmesi, demo verilerin `[DEMO]` ve sıfır güvenilirlik ile izole edilmesi, TanStack Query offline cache göstergesi ve son güncelleme zaman damgası, boş önbellek durumunda temiz hata bildirimi, çok sayfalı BBox sayfalama (azami 300 olay ile harita yoğunluk doğruluğu), 350ms kamera hareketi debounce'u, EAS Build development APK yapılandırması (`eas.json`), Android izin/profil doğrulaması ve güvenli Floating UI dikey yerleşimi.
- **Doğrulama:** 124 testin tamamı (25 mobil test, 84 backend testi, 11 token testi, 4 shared testi) sıfır hata ile geçti. Rapor: [PHASE_6_5_VERIFICATION.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_6_5_VERIFICATION.md).

### Phase 7: Olay Bildirim Akışı, Konum ve Medya Pipeline'ı (TAMAMLANDI)
- **Kapsam:** Urban Floating UI 3 adımlı profesyonel olay bildirme akışı (`CreateEventFlow`), `GET /api/v1/categories` ile dinamik 11 kategori desteği, Zod tabanlı çift katmanlı form doğrulama (`CreateEventInputSchema`), MapLibre tabanlı `LocationPickerModal` (sabit merkez pini, GPS entegrasyonu, hassas koordinat gösterimi), `expo-image-picker` ile kamera/galeri fotoğraf seçimi (maks 3 adet, maks 8MB, JPEG/PNG/WebP), 3 adımlı medya yükleme pipeline'ı (`POST /upload-url` -> MinIO/S3 presigned PUT -> `POST /complete`), kısmi medya hatalarında olay ID'si korunarak "Tekrar Dene" desteği, `draftService` yerel taslak kaydı ve kalıcı dosya saklama (`expo-file-system/legacy`), `useAuthStore` güvenli token saklama (`expo-secure-store`) ve refresh yarış durumu korumalı mutex, `DuplicateWarningModal` mükerrerlik uyarısı ve çift tıklama önleyici `submittingLock`.
- **Doğrulama:** 137 testin tamamı (38 mobil test, 84 backend testi, 11 token testi, 4 shared testi) başarıyla geçti. Rapor: [PHASE_7_REPORT.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_7_REPORT.md).

### Phase 7.5: Mobil Kalite, Güvenlik ve Android Doğrulama (TAMAMLANDI)
- **Kapsam:** Test regresyon analizi ve düzeltmesi (Phase 7 raporundaki yazım hatasının aydınlatılması; backend'de test silinmediği, 84 testin korunduğu ve +1 yeni gizlilik testi ile 85'e ulaştığı ispatlandı), DuplicateWarning gizlilik kalkanı (başka bir kullanıcının onaylanmamış PENDING_REVIEW olay detaylarının sızdırılmasının engellenmesi; genel güvenli uyarı dönülmesi), konum gizliliği doğrulaması ve yanıltıcı profil açıklamasının düzeltilmesi (Güvenli Yayın Konumu Politikası ve Çift Çözünürlüklü Konum Modeli), form ve medya bütünlüğü (tekrar denemede mükerrer olay açılmasını engelleyen idempotency kilidi, taslakta createdEventId saklanması, 401 oturum yenileme koruması), EAS Build ve Expo config denetimi, gerçek Docker PostgreSQL, Redis, MinIO entegrasyonu.
- **Doğrulama:** 141 testin tamamı (85 backend, 41 mobile, 11 design-tokens, 4 shared) %100 yeşil; sıfır hata. Rapor: [PHASE_7_5_VERIFICATION.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_7_5_VERIFICATION.md).

### Phase 8: Doğrulama, Topluluk Oylaması & Moderasyon (TAMAMLANDI)
- **Kapsam:** "Ben de Gördüm" (CONFIRM), "Yanlış Bilgi Bildir" (DISPUTE), "Sorun Çözüldü Bildir" (RESOLVED_REPORT) geri bildirim motoru. `EventFeedbackEntity` ve `1740000003000-CreateEventFeedbackAndReputationLogs.ts` TypeORM migration'ı. Kullanıcı başına tek aktif oy kuralı (`uq_event_feedback_event_user`), yarış durumu CAS/transaction koruması, kendi olayını teyit etme yasağı. Açıklanabilir topluluk göstergesi (sahte %95 kesinlik engeli, N>=3 örneklem eşiği), gizli/reddedilmiş olaylar için gizlilik kalkanı (404 koruması). Moderasyon yetki matrisi (`MODERATOR`, `ADMIN`, `MUNICIPAL_OFFICER`, `CITIZEN`), genişletilmiş durum geçişleri (`DISPUTED` -> `ACTIVE` | `REJECTED`), transaction audit trail (`event_moderation_logs`). Mobil Olay Detayı ekranı (`app/events/[id].tsx`), Harita BottomSheet navigasyon entegrasyonu ve Moderatör Paneli (`app/moderation/index.tsx`).
- **Doğrulama:** 172 testin tamamı (107 backend, 49 mobile, 11 token, 5 shared) %100 yeşil; sıfır hata. Rapor: [PHASE_8_REPORT.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PHASE_8_REPORT.md).

### Phase 9: Canlı Olay Akışı & Bildirimler
- **Kapsam:** WebSocket / Socket.io gateway ile harita açıkken anlık yeni pin düşmesi. Expo Push Notifications entegrasyonu ile kullanıcının mahalle yarıçapındaki kritik olaylarda bildirim tetikleme.
- **Doğrulama:** Farklı cihazlar arasında anlık olay senkronizasyonu.

### Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı
- **Kapsam:** İl/ilçe bazlı olay yoğunluğu ısı haritası ve istatistik sayfası (`GET /stats/city`). Uçtan uca regresyon testleri, performans denetimi ve MVP teslim raporu.
- **Doğrulama:** Test otomasyon raporu ve stabil çalışan release APK/IPA hazır bulunuşluğu.

---

## 2. İlk Sürüm İçin MVP Kapsamı

Hedefimiz kapsamı gereksiz dağıtmadan, en yüksek kullanıcı değerini sunan çekirdek deneyimi kusursuzlaştırmaktır:

### MVP'ye Dahil Olan Özellikler (In Scope)
1. **Kimlik & Profil:** E-posta/şifre ile kayıt, güvenli giriş (JWT), kullanıcı itibar puanı gösterimi.
2. **İnteraktif Vektör Harita:** MapLibre ile yüksek performanslı harita, kullanıcı konumu takibi, olay pinleri ve kümeleme (cluster).
3. **Kategori & Şehir Filtreleri:** Trafik, Kaza, Yol Çalışması, Altyapı/Arıza, Etkinlik, Asayiş/Afet filtreleri.
4. **Olay Bildirimi:** Haritadan nokta seçimi veya GPS konumu, başlık, açıklama, kategori, aciliyet seviyesi ve 1-3 adet fotoğraf ekleme.
5. **Topluluk Teyidi (Oylama):** Olay kartı üzerinde "Onayla / Yalanla / Çözüldü" butonları ve olay yerine yakın olanların ağırlıklı puanı.
6. **Basit Liste / Harita Görünümü:** Olayları harita üzerinde veya yakınlığa göre sıralanmış liste formatında görüntüleme.
7. **Güvenlik & Gizlilik:** Fotoğraflardan GPS silinmesi, kullanıcı profili konum bulanıklaştırması, rate limiting.

### MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope)
1. **Canlı Trafik Navigasyonu:** Turn-by-turn araç rotalama (Waze/Google Maps benzeri rota çizimi yerine yalnızca olay noktası odaklı kalınacaktır).
2. **Belediye & Kurum Yönetim Portalı:** Harici web panelleri ve kamu entegrasyonları sonraki faza aktarılmıştır.
3. **Canlı Sohbet:** Olay altında gerçek zamanlı mesajlaşma yerine yalnızca kısa teyit yorumları yer alacaktır.
4. **Sosyal Medya Otomatik Paylaşım Botları:** Twitter/X veya Telegram kanallarına otomatik duyuru botları sonraki fazlarda eklenecektir.
