# ŞehirNabız — Geliştirme Fazları ve MVP Yol Haritası (ROADMAP_PHASES.md)

Bu belge, projenin kontrollü, test edilebilir ve adım adım ilerleyen geliştirme fazlarını, her fazın başarı kriterlerini ve ilk sürüm için netleştirilmiş MVP (Minimum Viable Product) kapsamını tanımlar.

---

## 1. Geliştirme Fazları

### Phase 0: Proje Hazırlığı ve Mimari Planlama (ŞU ANKİ FAZ)
- **Kapsam:** Mevcut durum tespiti, Graphify entegrasyonu, mimari dokümanların (`AGENTS.md`, `ARCHITECTURE.md`, `DATA_MODELS.md`, `SECURITY_PRIVACY.md`, `ROADMAP_PHASES.md`) oluşturulması. Harita, backend ve veri modeli kararlarının gerekçelendirilmesi.
- **Başarı Kriteri:** Proje çalışma alanının ve dokümantasyonun eksiksiz hazır olması, Graphify grafının kurulması.

### Phase 1: Monorepo & Ortak Paket Yapılandırması
- **Kapsam:** pnpm workspace ve Turborepo altyapısı. `packages/shared`, `packages/tsconfig`, `packages/eslint-config` kurulumu. Zod şemaları ve ortak TypeScript tiplerinin tanımlanması.
- **Doğrulama:** `pnpm turbo build` ve `pnpm turbo lint` komutlarının hatasız çalışması.

### Phase 2: Backend Çekirdek, Docker & Veritabanı
- **Kapsam:** Docker Compose (PostgreSQL 16 + PostGIS, Redis). NestJS projesinin `apps/backend` altına kurulması. Prisma / Kysely or TypeORM konfigürasyonu, PostGIS spatial migration'ları, Auth modülü (JWT, bcrypt, Refresh Token).
- **Doğrulama:** PostGIS uzamsal tablolarının oluşturulması, kullanıcı kayıt ve giriş uç noktalarının E2E testleri.

### Phase 3: Coğrafi Veri & Olay Yönetimi API'si
- **Kapsam:** Kategori yönetimi, Olay oluşturma (`POST /events`), Bounding Box ve Yarıçap sorguları (`GET /events/nearby`, `GET /events/bbox`), PostGIS `ST_DWithin` ve `ST_MakeEnvelope` filtreleri.
- **Doğrulama:** Postman/Supertest ile coğrafi koordinat sorgularının doğrulanması, milisaniyelik yanıt süreleri.

### Phase 4: Medya & Güvenli Depolama Altyapısı
- **Kapsam:** Cloudflare R2 / AWS S3 uyumlu presigned URL servisi. İstemci taraflı görsel sıkıştırma ve EXIF temizleme stratejisinin backend entegrasyonu.
- **Doğrulama:** Örnek görsel yükleme akışı ve yüklenen görsellerin GPS meta verilerinin silindiğinin doğrulanması.

### Phase 5: Mobil Temel, Navigasyon & Durum Yönetimi
- **Kapsam:** `apps/mobile` altında Expo Router ile dosya tabanlı navigasyon. TanStack Query ve Zustand konfigürasyonu. Türkçe UI tema token'ları (NativeWind / Design Tokens). Kimlik doğrulama ekranları (Giriş/Kayıt).
- **Doğrulama:** iOS/Android simülatörlerinde akıcı navigasyon ve oturum durumunun MMKV ile korunması.

### Phase 6: Harita Katmanı & Vektör Render (MapLibre)
- **Kapsam:** `@maplibre/maplibre-react-native` entegrasyonu, Expo Prebuild ve Dev Client konfigürasyonu. Konum izinleri (`expo-location`), haritada kullanıcı konumu gösterimi, 1000+ marker için GPU kümeleme (clustering) ve pin tıklama alt sayfası (BottomSheet).
- **Doğrulama:** 60 FPS harita kaydırma ve kümeleme testleri.

### Phase 7: Olay Bildirim Akışı & Form Deneyimi
- **Kapsam:** Harita üzerinden konum seçici, kategori seçimi, fotoğraf çekme/seçme (`expo-image-picker`), Zod form validasyonu, çevrimdışı taslak kaydı.
- **Doğrulama:** Yeni olay bildiriminin uçtan uca mobil uygulamadan gönderilip veritabanına ve haritaya düşmesi.

### Phase 8: Doğrulama, Topluluk Oylaması & Moderasyon
- **Kapsam:** "Doğru", "Yanlış", "Çözüldü" teyit butonları. Olay yerine yakınlık kontrolü (`is_within_radius`). Kullanıcı itibar skoru hesaplama motoru. Mükerrer bildirim deduplication mantığı.
- **Doğrulama:** Oylama yapıldığında olayın güvenilirlik puanının anlık güncellenmesi.

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
