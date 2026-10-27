# ŞehirNabız — Kontrollü Mekânsal Performans ve Yük Benchmark Raporu

Bu belge, ŞehirNabız kentsel olay yönetim sisteminin gerçekçi PostGIS mekânsal sorgulama, ızgara (grid) agregasyonu, yük boyutları ve önbellek kazanımlarına dair kontrollü performans ölçümlerini içerir.

---

## 1. Test Ortamı ve Donanım Spesifikasyonu

Tüm ölçümler gerçek yerel hizmetler ve izole PostgreSQL/Redis konteynerleri üzerinde çalıştırılmış, sentetik verilerle uçtan uca test edilmiştir.

| Bileşen | Değer / Özellik |
| :--- | :--- |
| **İşlemci (CPU)** | 16x AMD Ryzen 7 7735HS with Radeon Graphics (~3.2 - 4.75 GHz) |
| **Sistem Belleği (RAM)** | 15.25 GB LPDDR5 |
| **İşletim Sistemi** | Windows 11 Pro (`10.0.26300`), x64 |
| **Veritabanı Motoru** | PostgreSQL 16.4 / PostGIS 3.4.2 (Docker) |
| **Önbellek & Kuyruk** | Redis 7.2.4 (Docker) |
| **Çalışma Zamanı** | Node.js v24.19.0 / TypeORM 1.1.2 |
| **Mekânsal Referans (SRID)** | EPSG:4326 (WGS 84 Coğrafi Koordinat Sistemi) |

---

## 2. Veri Seti ve Dağılım Modelleri

Benchmark kapsamında Kayseri ili coğrafi sınırları temel alınarak 3 farklı veri hacmi test edilmiştir:
- **1.000 Olay (Küçük Ölçek / Mahalle Düzeyi)**
- **10.000 Olay (Orta Ölçek / İlçe Düzeyi)**
- **100.000 Olay (Büyük Ölçek / Metropol Düzeyi)**

### Coğrafi Dağılım Stratejisi:
- **%75 Kentsel Yoğunluk (Dense Urban Center):** Kayseri şehir merkezi, Cumhuriyet Meydanı, Melikgazi ve Kocasinan ana arterleri `[Boylam: 35.46 - 35.52, Enlem: 38.70 - 38.75]` dar BBox içine yoğunlaştırılmış kümeleme.
- **%25 Kırsal Seyreklik (Sparse Rural):** İncesu, Develi, Yahyalı, Pınarbaşı kırsal çevre hatları `[Boylam: 35.10 - 35.90, Enlem: 38.40 - 39.00]`.

---

## 3. Ölçüm Sonuçları ve Karşılaştırmalı Metrikler

Her test 30 iterasyon boyunca çalıştırılmış, `p50`, `p95`, `p99` yüzdelik dilimleri ve ortalama (Mean) süreler milisaniye (ms) cinsinden hesaplanmıştır.

### 3.1. Yanıt Süreleri Karşılaştırma Tablosu

| Olay Hacmi | Sorgu Tipi | Ortalama (Mean) | p50 (Medyan) | p95 | p99 | Payload Boyutu | İndeks Kullanımı |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1.000** | Raw BBox (Limit 50) | **1.89 ms** | **1.74 ms** | 3.00 ms | 4.39 ms | 8.09 KB | `idx_created_at` + GiST Filter |
| **1.000** | Grid Heatmap (Aggregated) | **4.25 ms** | **4.14 ms** | 4.71 ms | 7.97 ms | 24.95 KB | HashAggregate (Memory: 105kB) |
| **10.000** | Raw BBox (Limit 50) | **1.73 ms** | **1.70 ms** | 2.44 ms | 2.48 ms | 8.10 KB | `idx_created_at` + GiST Filter |
| **10.000** | Grid Heatmap (Aggregated) | **18.41 ms** | **18.31 ms** | 19.42 ms | 20.32 ms | 37.79 KB | Top-N Heapsort (Memory: 158kB) |
| **100.000** | Raw BBox (Limit 50) | **1.77 ms** | **1.79 ms** | 2.30 ms | 2.79 ms | 8.17 KB | `idx_created_at` + GiST Filter |
| **100.000** | Grid Heatmap (Aggregated) | **242.74 ms** | **236.47 ms** | 282.39 ms | 285.55 ms | 38.81 KB | External Merge Sort (Disk: 5.6MB) |

---

## 4. Analiz ve Çıkarılan Mimari Sonuçlar

### 4.1. Raw BBox Sorgusunun Kararlılığı (Sub-2ms)
- `Raw BBox` sorgusu, `idx_benchmark_created_at` ve GiST mekânsal indeksleri sayesinde 1.000 kayıtta da 100.000 kayıtta da **1.70 - 1.79 ms (p50)** seviyesinde tamamen sabit kalmaktadır.
- Olay sayısı 100 kat artsa bile, ilk 50 kaydı getiren sayfalama sorgusu $O(1)$ amortize süreyle çalışmaktadır.

### 4.2. Grid Heatmap Agregasyonunun Ölçeklenme Davranışı
- **10.000 olayda:** Grid kümeleme süresi yalnızca **18.31 ms** olup mobil kullanıcı deneyimi için son derece akıcıdır (60 FPS sınırının oldukça altındadır).
- **100.000 olayda:** 100.000 noktanın 3 basamaklı koordinat yuvarlamasıyla (yaklaşık 110 metre ızgara) gruplanması veritabanında geçici disk alanı (`External Merge Disk: 5656kB`) gerektirmiş ve sorgu süresi **236.47 ms** seviyesine çıkmıştır.
- **Payload Tasarrufu:** 100.000 ham olayın istemciye JSON olarak iletilmesi yaklaşık **16.2 MB** ağ trafiği yaratacakken, Grid Agregasyonu bu yükü **38.81 KB**'a (%99.76 tasarruf) indirmiştir. Bu sayede mobil cihazların belleği ve bataryası korunmaktadır.

---

## 5. Redis Önbellek Performansı (Cache Hit vs. Miss)

Şehir genel istatistikleri ve mekânsal özet verileri üzerinde Redis TTL önbelleklemesi (60 saniye) test edilmiştir:

| Metrik | Cache Miss (DB Sorgusu + Redis Yazma) | Cache Hit (Yalnızca Redis RAM Okuma) | Kazanım / Hızlanma |
| :--- | :--- | :--- | :--- |
| **Ortalama Süre** | **13.83 ms** | **1.02 ms** | **13.6 Kat Daha Hızlı** |
| **p50 (Medyan)** | **13.51 ms** | **0.97 ms** | **13.9 Kat Daha Hızlı** |
| **p95** | **17.64 ms** | **2.16 ms** | **8.1 Kat Daha Hızlı** |
| **p99** | **17.64 ms** | **2.16 ms** | **8.1 Kat Daha Hızlı** |

### Önbellek Geçersiz Kılma (Invalidation) Stratejisi:
- Transactional Outbox Worker, yeni bir olay onaylandığında (`ACTIVE`) veya çözüldüğünde (`RESOLVED`) Redis üzerinde `stats:overview:*` anahtarlarını anında temizler.
- Bu yaklaşım, kullanıcılara daima güncel istatistik sunarken ortalama sorgu yükünü 1 ms civarında tutar.

---

## 6. PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` Plan Dökümü

### 100.000 Olayda Raw BBox Sorgu Planı:
```text
Limit  (cost=0.29..6.83 rows=50 width=61) (actual time=0.018..0.084 rows=50 loops=1)
  Buffers: shared hit=34
  ->  Index Scan using idx_benchmark_created_at on benchmark_events  (cost=0.29..11270.38 rows=86141 width=61) (actual time=0.017..0.080 rows=50 loops=1)
        Filter: ((location && '0103...40'::geometry) AND ((status)::text = 'ACTIVE'::text))
        Rows Removed by Filter: 14
        Buffers: shared hit=34
Planning Time: 0.135 ms
Execution Time: 0.100 ms
```
*Gözlem:* Sıfır disk okuması (`shared hit=34`), saf bellek üzerinden milisaniyenin onda biri sürede yürütülmüştür.

### 100.000 Olayda Grid Heatmap Sorgu Planı:
```text
Limit  (cost=26702.90..26705.40 rows=1000 width=84) (actual time=226.013..226.142 rows=1000 loops=1)
  Buffers: shared hit=2000, temp read=707 written=709
  ->  Sort  (cost=26702.90..26918.25 rows=86141 width=84) (actual time=226.011..226.063 rows=1000 loops=1)
        Sort Key: ((count(id))::integer) DESC
        Sort Method: top-N heapsort  Memory: 169kB
        Buffers: shared hit=2000, temp read=707 written=709
        ->  GroupAggregate  (cost=17026.77..21979.88 rows=86141 width=84) (actual time=192.201..225.060 rows=3249 loops=1)
              Group Key: (round((st_y(location))::numeric, 3)), (round((st_x(location))::numeric, 3))
Planning Time: 0.185 ms
Execution Time: 227.285 ms
```
*Gözlem:* `top-N heapsort` bellek optimizasyonuyla en yoğun 1.000 hücre çekilmiş, 100.000 kayıt taranmasına rağmen 227 ms içinde tamamlanmıştır.
