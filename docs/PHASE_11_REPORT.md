# ŞehirNabız — Phase 11: Production Reliability, Transactional Outbox, Güvenlik ve Performans Sertleştirmesi Raporu

**Proje:** ŞehirNabız  
**Faz:** Phase 11 — Production Reliability, Transactional Outbox, Güvenlik ve Performans Sertleştirmesi  
**Tarih:** 27 Ekim 2026  
**Durum:** Başarıyla Tamamlandı (185 Backend + 75 Mobil = 260 Test Başarılı, %100 Yeşil)  
**Önceki Commit:** `2661beb`  
**Mimari Referanslar:** [ARCHITECTURE.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/ARCHITECTURE.md), [DATA_MODELS.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/DATA_MODELS.md), [SECURITY_PRIVACY.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/architecture/SECURITY_PRIVACY.md), [TRANSACTIONAL_OUTBOX.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/TRANSACTIONAL_OUTBOX.md), [PERFORMANCE_BENCHMARKS.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PERFORMANCE_BENCHMARKS.md), [PRIVACY_DATA_FLOW.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PRIVACY_DATA_FLOW.md)

---

## 1. Yönetici Özeti ve Faz Amacı

Phase 0'dan Phase 10'a kadar ŞehirNabız'ın temel kentsel olay haritası, çok adımlı bildirim akışları, medya yönetimi, topluluk teyit mekanizması, gerçek zamanlı Socket.IO olay yayını ve şehir istatistik modülleri inşa edilmiş ve 256 testle doğrulanmıştı.

**Phase 11'in Temel Hedefi:**  
Sisteme yeni büyük kullanıcı özellikleri eklemek yerine; mevcut özellikleri üretim ortamının (Production) zorlu şartlarına karşı sertleştirmek, veri kaybı (Dual-write) risklerini Transactional Outbox ile ortadan kaldırmak, tüketici tarafında idempotans garantisi sağlamak, konum ve veri mahremiyetini teknik kontrollerle güvenceye almak, Türkçe karakter aramalarını PostgreSQL `unaccent` ile kusursuzlaştırmak ve 1k / 10k / 100k olay altında kontrollü performans benchmark'ları yürütmektir.

---

## 2. Kod Tabanı Ön İncelemesi ve Risk Envanteri

Geliştirmeye başlanmadan önce mimari bileşenler ve veri akışları Graphify ve statik kod analiziyle incelenmiş; şu kritik teknik riskler tespit edilmiştir:

1. **Dual-Write (Çift Yazma) ve Olay Kaybı Riski:** `EventsService.updateStatus` ve `create` metotlarında, TypeORM transaction'ı commit edildikten hemen sonra harici ağ çağrıları (`realtimeService`, `notificationsService`) doğrudan çağrılmaktaydı. Sunucu çökmesi veya ağ zaman aşımında olay kaydedilmesine rağmen bildirimler kalıcı olarak kaybolabiliyordu.
2. **Tüketici Tarafı Mükerrerlik (At-least-once Deduplication Eksikliği):** Yeniden denemeler sırasında `user_notifications` tablosunda idempotency kontrolü bulunmadığından bir kullanıcıya aynı olay için mükerrer bildirim yazılabilirdi.
3. **Türkçe Karakter Eşleşme Sınırı (PostgreSQL `ILIKE`):** Standart PostgreSQL `ILIKE`, Türkçe `I/ı` ve `İ/i` harflerini doğru eşleştiremiyordu (Örn. `'IŞIK' ILIKE '%ışık%'` `false` dönüyordu).
4. **Isı Haritasında Tekil Nokta İfşası:** Seyrek alanlardaki tekil olayların koordinatları doğrudan okunabilmekteydi; $k$-anonymity eşiği bulunmuyordu.
5. **Yanıltıcı Gizlilik Beyanı:** Mobil ayarlar ekranında teknik karşılığı bulunmayan "150m Konum Bulanıklaştırma" iddiası mevcuttu.
6. **Arama Güvenliği Eksikleri:** `searchEvents` endpoint'inde query uzunluğu ve tarih aralığı katı doğrulanmıyordu; geçersiz cursor'lar `BadRequestException` yerine sessizce yutuluyordu.

---

## 3. Transactional Outbox Mimarisi ve Uygulama Detayları

PostgreSQL tabanlı Transactional Outbox sistemi kurularak olay değişiklikleri ile dış dünyaya yapılacak bildirimler atomik hale getirildi:
- **Tablo:** `outbox_events` (Alanlar: `id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload`, `status`, `attempts`, `next_attempt_at`, `processed_at`, `lock_lease_expires_at`, `last_error`, `created_at`).
- **Atomik Yazma:** `EventsService.create`, `updateStatus`, `submitFeedback`, `removeFeedback` metotlarında TypeORM transaction bloğu içine `outboxService.createOutboxEvent(manager, ...)` entegre edildi.
- **Rollback Garantisi:** Transaction hata aldığında olay durumuyla birlikte outbox kaydı da geri alınır (E2E test 2 ile kanıtlandı).
- **Sanitizasyon:** Outbox payload'ından şifre, hash, refresh/access token ve binary veriler otomatik olarak temizlenir.

---

## 4. Outbox Processor / Worker Davranışı ve Concurrency Kontrolü

`OutboxProcessorService` bağımsız bir arka plan worker'ı olarak devreye alındı:
- **`SELECT ... FOR UPDATE SKIP LOCKED`:** Birden fazla API düğümü veya worker çalıştığında aynı outbox kaydını kimse çakışarak çekemez; kilitli kayıtlar atlanır.
- **Kira Süresi (Lease Time):** 30 saniye (`lock_lease_expires_at`). Beklenmedik şekilde çöken worker'ların kilitlediği olaylar 30 saniye sonra diğer işleyicilerce otomatik kurtarılır.
- **Exponential Backoff ve Jitter:** Başarısız teslimatlarda $\min(60000, 2^{\text{attempts}} \times 1000 + \text{jitter})$ gecikmeyle yeniden denenir.
- **Dead-Letter (FAILED):** 5 denemede başarılamayan olaylar `FAILED` durumuna çekilir ve `last_error` alanına detay yazılır.
- **Graceful Shutdown:** `onModuleDestroy` kancası ile uygulama kapanırken worker kuyruktaki işini bitirip güvenle durdurulur.

---

## 5. Tüketici Tarafı İdempotans ve Bildirim Tutarlılığı

- `user_notifications` tablosuna `idempotency_key VARCHAR(128)` kolonu ve kısmi unique index (`uq_user_notifications_idempotency_key`) eklendi.
- Outbox Worker bildirim üretirken anahtar olarak `outbox:{outboxId}:{userId}` kullanır.
- Ağ kopması veya yeniden denemede aynı bildirim ikinci kez gelirse PostgreSQL `23505` kısıtı yakalanır; mükerrer satır açılmaz ve var olan bildirim döndürülür (E2E test 4 ile kanıtlandı).

---

## 6. Expo Push Güvenilirlik Sertleştirmesi ve Hata Yönetimi

`PushNotificationService` sınıfı yeniden yapılandırıldı:
- **100'lük Gruplar (Batching):** Expo API'sinin önerdiği 100'lük gruplar halinde parçalanarak (`CHUNK_SIZE = 100`) gönderim yapılır.
- **Geçici Hata Toleransı:** HTTP 429 (Rate Limit) ve 5xx (Expo Server Error) durumlarında 2 kez üstel gecikmeyle otomatik yeniden deneme yapılır.
- **Token Temizliği:** Ticket yanıtında `DeviceNotRegistered` veya `InvalidCredentials` hatası alındığında ilgili push token `DevicePushTokenEntity` tablosunda anında `isActive = false` yapılarak sistemden düşürülür.
- **Simülasyon Şeffaflığı:** Üretim dışı ortamda veya EAS kimlik bilgileri olmadığında, loglarda ve yanıtlarda `isSimulated: true` açıkça belirtilerek yanıltıcı teslimat iddiaları engellenmiştir.

---

## 7. Konum Gizliliği, Koordinat Ayrımı ve Doğrulama

Kullanıcı mahremiyeti için 4 koordinat türü birbirinden kesin olarak izole edildi:
1. **Bildiren Cihaz Konumu (Reporter GPS):** Asla veritabanında saklanmaz, API istek gövdesine yazılmaz, hareket geçmişi tutulmaz.
2. **Olay Konumu (Event Coordinates):** Vatandaşın haritada işaretlediği sorun noktasıdır.
3. **Kamuya Açık Koordinatlar:** Yalnızca onaylanmış olaylar için harita API'sinde yayınlanır.
4. **Agregasyon Koordinatları:** Isı haritasında 110m ızgara merkezine yuvarlanır.
- Detaylı veri akışları [PRIVACY_DATA_FLOW.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PRIVACY_DATA_FLOW.md) dosyasında belgelendi.

---

## 8. Heatmap k-Anonymity ve Mekânsal Agregasyon

`StatsService.getHeatmap` güçlendirildi:
- PostGIS koordinat yuvarlaması (3 ondalık basamak ~ 110 metre) ile kümeleme yapılır.
- **$k$-Anonymity / Sparse Cell Suppression:** Bir hücredeki olay sayısı $k$ eşiğinden (örn. `minCount = 2`) düşükse hücre yanıttan bastırılır ve `suppressedPoints` alanında raporlanır.
- **Resmî Feragatname:** `"Yoğunluk haritası gizlilik korumalı mekânsal agregasyonla üretilmektedir; tekil olay konumlarını doğrudan temsil etmez ve resmî tehlike veya risk haritası değildir."` metni eklendi.

---

## 9. Güvenli Arama API'si ve SQL Enjeksiyon Koruması

`EventsService.searchEvents` endpoint'i sertleştirildi:
- **Parametrized SQL:** Tüm dinamik filtreler `$1, $2, ...` parametreleriyle bağlanmış, string birleştirmesi tamamen yasaklanmıştır.
- **Sorgu Uzunluğu Kısıtı:** Minimum 2, maksimum 100 karakter kuralı (`SearchEventsDto` + Service seviyesinde 400 BadRequest).
- **Tarih Aralığı Denetimi:** `startDate <= endDate` ve maksimum 366 gün (1 yıl) aralık sınırı getirildi.
- **Katı Cursor Doğrulaması:** Base64 decode sonrası ISO tarih ve geçerli UUID regex doğrulaması yapılır; bozuk cursor'larda 400 BadRequest fırlatılır.

---

## 10. Türkçe Karakter Duyarsız Arama (PostgreSQL unaccent)

- Veritabanı migration'ı (`1740000005000`) ile `CREATE EXTENSION IF NOT EXISTS unaccent;` uygulandı.
- Arama sorgusu `unaccent(LOWER(col)) ILIKE unaccent(LOWER($1))` kalıbına yükseltildi:
  - `I / ı / İ / i`
  - `Ş / ş / S / s`
  - `Ç / ç / C / c`
  - `Ö / ö / O / o`
  - `Ü / ü / U / u`
  - `Ğ / ğ / G / g`
  harflerinin tamamı başarıyla eşleşmektedir (E2E test 5 ve unit testlerle doğrulandı).

---

## 11. Kontrollü Performans Benchmark Sonuçları ve Analizi

İzole `benchmark_events` tablosunda Kayseri coğrafi sınırları temelinde 1.000, 10.000 ve 100.000 sentetik olayla yürütülen kontrollü test sonuçları (30 iterasyon):

| Veri Hacmi | Sorgu Tipi | p50 Gecikme | p95 Gecikme | Payload Boyutu | Ağ Tasarrufu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.000** | Raw BBox (Limit 50) | **1.74 ms** | 3.00 ms | 8.09 KB | - |
| **1.000** | Grid Heatmap | **4.14 ms** | 4.71 ms | 24.95 KB | - |
| **10.000** | Raw BBox (Limit 50) | **1.70 ms** | 2.44 ms | 8.10 KB | - |
| **10.000** | Grid Heatmap | **18.31 ms** | 19.42 ms | 37.79 KB | %96.2 |
| **100.000** | Raw BBox (Limit 50) | **1.79 ms** | 2.30 ms | 8.17 KB | - |
| **100.000** | Grid Heatmap | **236.47 ms** | 282.39 ms | 38.81 KB | **%99.76** |

- **Redis Önbellek Hızlanması:** Cache Hit ortalama **1.02 ms**, Cache Miss ortalama **13.83 ms** (**13.6 Kat Hızlanma**).
- Detaylı `EXPLAIN (ANALYZE, BUFFERS)` dökümü [PERFORMANCE_BENCHMARKS.md](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/docs/PERFORMANCE_BENCHMARKS.md) dosyasındadır.

---

## 12. Mobil İstemci İncelemesi ve Gizlilik Metni Düzeltmeleri

- `apps/mobile/app/profile/settings.tsx` dosyasında yer alan yanıltıcı "150 Metre Konum Bulanıklaştırma" başlığı kaldırıldı.
- Yerine sisteme ait gerçek teknik güvenceler eklendi:
  - "Cihaz Konumu Asla Saklanmaz"
  - "EXIF & GPS Temizleme Garantisi"
  - "Yoğunluk Haritası k-Anonymity"
- `apps/mobile/test/phase_11.test.js` yazılarak mobil gizlilik metinleri test kalkanı altına alındı.

---

## 13. Test Stratejisi, Kapsamı ve Sonuçları (260/260)

| Modül / Paket | Test Türü | Test Sayısı | Durum |
| :--- | :--- | :--- | :--- |
| `apps/api` | Unit & E2E Testleri (23 Dosya) | **185 Test** | ✅ %100 Başarılı |
| `apps/mobile` | Navigasyon, Harita, Form, Gizlilik Testleri | **75 Test** | ✅ %100 Başarılı |
| **Toplam Test Paketi** | **Bütünleşik Monorepo Testleri** | **260 Test** | ✅ **%100 Başarılı (0 Hata)** |

*Not: Phase 10'daki 256 testin tamamı korunmuş, Phase 11 kapsamında eklenen yeni 4 birim ve E2E testiyle sayı 260'a yükseltilmiştir.*

---

## 14. Dokümantasyon Güncellemeleri

Phase 11 ile birlikte 4 kapsamlı yeni teknik doküman sisteme kazandırılmıştır:
1. `docs/PHASE_11_REPORT.md` (Bu kapsamlı 16 bölümlük kapanış raporu)
2. `docs/TRANSACTIONAL_OUTBOX.md` (Outbox mimarisi, worker lease ve idempotans belgesi)
3. `docs/PERFORMANCE_BENCHMARKS.md` (1k/10k/100k kontrollü mekânsal performans ve Redis analizi)
4. `docs/PRIVACY_DATA_FLOW.md` (Veri sınıflandırma, koordinat izolasyonu ve KVKK ilkeleri)
- Ayrıca `ARCHITECTURE.md`, `DATA_MODELS.md`, `SECURITY_PRIVACY.md`, `ROADMAP_PHASES.md` ve `AGENTS.md` güncellenmiştir.

---

## 15. Sınırlar, Ertelenen Başlıklar ve Henüz Doğrulanmamış Konular

Şeffaflık ve dürüst mühendislik ilkeleri gereği şu başlıklar açıkça belirtilmektedir:
- ⚠️ **Android APK ve Fiziksel Cihaz Testleri:** Fiziksel donanım üzerinde APK build ve cihaz testleri henüz yapılmamıştır (Web / Node / Simülasyon ortamında doğrulanmıştır).
- ⚠️ **Gerçek Cihaz Push Teslimatı:** Geliştirme ortamında Expo Push Dev Adapter simülasyonu kullanılmıştır; Apple APNs / Google FCM üretim kimlikleriyle fiziksel cihaza canlı push teslimatı yapılmamıştır. Bu durum yanıltıcı biçimde "çalışıyor" olarak iddia edilmemiştir.
- 🛑 **Phase 12 Sınırı:** Phase 12 kapsamına geçilmemiş, sınırlar kesin olarak korunmuştur.

---

## 16. Sonuç, Kalite Beyanı ve Faz Kapanışı

ŞehirNabız Phase 11 ile birlikte:
- Dağıtık çift yazma problemi Transactional Outbox ile kesin olarak çözüldü.
- PostgreSQL `unaccent` ile Türkçe kentsel arama standardı sağlandı.
- Konum gizliliği k-Anonymity ve şeffaf metinlerle denetim altına alındı.
- 100.000 olaylık gerçekçi yük altında GiST mekânsal indekslemenin sub-2ms yanıt verdiği ve Redis'in 13.6 kat hızlanma sağladığı kanıtlandı.
- Tüm 260 test başarıyla yeşile ulaştı.

**Phase 11 başarıyla tamamlanmış ve dondurulmuştur.**
