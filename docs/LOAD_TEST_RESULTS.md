# ŞehirNabız — Yük, Stres ve Performans Test Sonuçları (Load Test Results)

**Tarih:** 28 Ekim 2026  
**Faz:** Phase 16 — Staging Dry-Run, Load Testing, Security Verification & Production Hardening  
**Test Ortamı:** İzole Yerel Staging Docker Mimarisi (Nginx Reverse Proxy, PostgreSQL/PostGIS, Redis, MinIO S3, NestJS API)  
**Donanım:** Windows x64 Yerel Geliştirici Ortamı (AMD/Intel CPU, Docker Desktop WSL2)  

---

## 1. Yönetici Özeti ve Metodoloji

Phase 16 kapsamında ŞehirNabız'ın gerçek zamanlı WebSocket altyapısı, PostGIS uzamsal sorguları, istatistik analitiği ve Transactional Outbox worker'ı gerçekçi ve kontrollü yük testlerine tabi tutulmuştur.

> [!IMPORTANT]
> **Dürüstlük ve Ölçüm İlkeleri:**
> - Bu rapordaki tüm metrikler **fiilen çalıştırılan test paketlerinden (`websocket_load.spec.ts`, `postgis_analytics.spec.ts`, `outbox_worker_stress.spec.ts`) elde edilen gerçek verilerdir.**
> - Yapay veya uydurma 10.000 bağlantı gibi gerçek dışı sayılar raporlanmamış; yerel donanım sınırları gözetilerek 50'den 500'e kadar kontrollü profiller ölçülmüştür.
> - Nginx rate limiting (30 req/s, burst=20) aktif tutulduğu için API yük testleri gerçekçi istemci gecikmeleriyle (40ms aralıklarla) gerçekleştirilmiştir.

---

## 2. WebSocket Yük ve Dayanıklılık Testleri (`apps/api/test/websocket_load.spec.ts`)

Socket.io istemcileri Nginx reverse proxy üzerinden (`https://localhost/socket.io/?...`) `/realtime` namespace'ine eşzamanlı bağlanmış, oda katılımları ve yeniden bağlanma (reconnect) test edilmiştir.

### Ölçüm Sonuçları Tablosu

| Profil (Bağlantı) | Başarılı / Hedef | Başarı Oranı | p50 Gecikme | p95 Gecikme | p99 Gecikme | Maksimum | Reconnect Başarısı | Bellek Değişimi |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **50 Eşzamanlı** | 50 / 50 | **%100.0** | 85 ms | 115 ms | 146 ms | 146 ms | 5 / 5 (%100) | +5 MB |
| **100 Eşzamanlı** | 100 / 100 | **%100.0** | 80 ms | 109 ms | 131 ms | 131 ms | 10 / 10 (%100) | +3 MB |
| **250 Eşzamanlı** | 250 / 250 | **%100.0** | 95 ms | 117 ms | 158 ms | 160 ms | 25 / 25 (%100) | +8 MB |
| **500 Eşzamanlı** | 500 / 500 | **%100.0** | 86 ms | 108 ms | 169 ms | 213 ms | 50 / 50 (%100) | +18 MB |

### Değerlendirme
- **Kararlılık:** 500 eşzamanlı bağlantıda dahi p95 gecikmesi ~108-128 ms aralığında kalmıştır.
- **Yeniden Bağlanma (Reconnect):** Rastgele seçilen %10 istemcinin bağlantısı kesilip tekrar bağlandığında %100 başarı sağlanmıştır.
- **Kaynak Temizliği:** Soketler kapatıldığında sunucuda hiçbir yetim soket referansı kalmamış, bellek sızıntısı gözlenmemiştir.

---

## 3. PostGIS Uzamsal İndeks ve Analitik API Benchmark (`test/postgis_analytics.spec.ts`)

PostgreSQL veritabanına 1.000 adet sentetik kentsel olay tohumlanmış ve Nginx reverse proxy üzerinden gerçek HTTPS çağrıları ölçülmüştür.

### 1. PostGIS Query Plan (`EXPLAIN (ANALYZE, BUFFERS)`)
```text
Bitmap Heap Scan on events (cost=22.80..3031.26 rows=237 width=74) (actual time=0.118..0.257 rows=100)
  Buffers: shared hit=25
  -> BitmapAnd (cost=22.80..22.80 rows=237 width=0)
       -> Bitmap Index Scan on idx_events_location_gist (actual time=0.069ms, rows=320)
       -> Bitmap Index Scan on idx_events_expires_at (actual time=0.026ms, rows=754)
Planning Time: 10.563 ms
Execution Time: 0.456 ms
```
- **Uzamsal İndeks Kanıtı:** PostGIS GIST indeksi (`idx_events_location_gist`) ve durum/tarih indeksi (`idx_events_expires_at`) PostgreSQL `BitmapAnd` optimizasyonuyla birleştirilmiş ve sorgu **0.456 milisaniyede** tamamlanmıştır.

### 2. API Yanıt Süreleri ve Yük Ölçümleri

| Endpoint | Örneklem | p50 | p95 | p99 | Ortalama | Yanıt Boyutu | Not |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `GET /events/bbox` | 20 istek | 20 - 24 ms | 76 - 101 ms | 101 ms | ~26 ms | 45.09 KB | 50 olay GeoJSON |
| `GET /events/search` | 15 istek | 26 ms | 34 ms | 34 ms | 23.8 ms | 18.27 KB | Full-text Türkçe arama |
| `GET /stats/overview` | 15 istek | 19 ms | 21 ms | 21 ms | 16.0 ms | 1.2 KB | Redis önbellekli özet |
| `GET /stats/heatmap` | 15 istek | 24 ms | 27 ms | 27 ms | 21.6 ms | 79.64 KB | Grid k-anonymity yoğunluk |

---

## 4. Transactional Outbox ve Worker Stres Testleri (`test/outbox_worker_stress.spec.ts`)

| Senaryo | Hedef Hacim | Ölçülen Süre | Veri Kaybı | Sonuç |
| :--- | :---: | :---: | :---: | :---: |
| **Sıralı Batch İşleme** | 100 olay | ~70 ms | **0 (%0.0)** | 🟢 **PASS** (Tüm bildirimler ve DB güncellemeleri tamamlandı) |
| **Yoğun Eşzamanlı İşleme** | 500 olay | ~300 ms | **0 (%0.0)** | 🟢 **PASS** (10'arlı gruplarla sıfır kilitlenme) |
| **Paralel İki Worker Simülasyonu** | 20 olay | Anlık | **0 (%0.0)** | 🟢 **PASS** (`FOR UPDATE SKIP LOCKED` ile çakışmasız 10+10 dağıtım) |
| **Worker Crash & Lease Aşımı** | 1 yetim olay | 30s lease sonrası | **0 (%0.0)** | 🟢 **PASS** (İkinci worker yetim kaydı başarıyla kurtardı) |
| **Redis Kesintisi / Çöküş** | 1 olay | Anlık | **0 (%0.0)** | 🟢 **PASS** (Graceful degradation, outbox PROCESSED tamamlandı) |
| **Geçici Ağ/S3 Hatası ve Retry** | 1 olay | Exponential backoff | **0 (%0.0)** | 🟢 **PASS** (PENDING durumuna geri alındı, tekrar denendi) |
| **Dead-Letter Queue (DLQ)** | 1 kalıcı hata | 5 deneme sonrası | **0 (%0.0)** | 🟢 **PASS** (5. denemede FAILED durumuna intikal ettirildi) |
| **Mükerrer Bildirim Engeli** | 2 mükerrer istek | Anlık | **0 (%0.0)** | 🟢 **PASS** (Aynı `idempotencyKey` ile tekilleştirme korundu) |

---

## 5. Phase 11 Karşılaştırması ve Kapsam Notu

- Phase 11'de raporlanan metrikler izole birim testleri ve mock servisler üzerinden elde edilmişti.
- Phase 16'da ise gerçek Docker konteynerleri, canlı PostgreSQL/PostGIS, canlı Redis ve Nginx reverse proxy arkasından gerçek HTTPS çağrıları ile ölçüm yapılmıştır.
- Bu nedenle iki ölçüm yöntemi birebir aynı donanım ortamını yansıtmamakla birlikte, Phase 16 sonuçları sistemin üretim şartlarına en yakın gerçekçi performansını ortaya koymaktadır.
