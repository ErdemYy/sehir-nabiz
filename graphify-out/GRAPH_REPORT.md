# Graph Report - ŞehirNabız  (2026-10-25)

## Corpus Check
- 5 files · ~4,063 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 53 nodes · 48 edges · 6 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- 1. Geliştirme Fazları
- ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)
- ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)
- ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)
- ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)
- 2. İlk Sürüm İçin MVP Kapsamı

## God Nodes (most connected - your core abstractions)
1. `1. Geliştirme Fazları` - 12 edges
2. `ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)` - 7 edges
3. `ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)` - 7 edges
4. `ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)` - 5 edges
5. `ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)` - 5 edges
6. `3. Backend Mimarisi (NestJS + PostgreSQL/PostGIS)` - 3 edges
7. `ŞehirNabız — Geliştirme Fazları ve MVP Yol Haritası (ROADMAP_PHASES.md)` - 3 edges
8. `2. İlk Sürüm İçin MVP Kapsamı` - 3 edges
9. `1. Konum Gizliliği ve KVKK / GDPR Uyumu` - 3 edges
10. `2. Sahte Bildirim ve Spam Önleme Mekanizmaları` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (6 total, 0 thin omitted)

### Community 0 - "1. Geliştirme Fazları"
Cohesion: 0.17
Nodes (12): 1. Geliştirme Fazları, Phase 0: Proje Hazırlığı ve Mimari Planlama (ŞU ANKİ FAZ), Phase 10: Şehir İstatistikleri, Test Raporu & MVP Lansmanı, Phase 1: Monorepo & Ortak Paket Yapılandırması, Phase 2: Backend Çekirdek, Docker & Veritabanı, Phase 3: Coğrafi Veri & Olay Yönetimi API'si, Phase 4: Medya & Güvenli Depolama Altyapısı, Phase 5: Mobil Temel, Navigasyon & Durum Yönetimi (+4 more)

### Community 1 - "ŞehirNabız — Teknik Mimari Belgesi (ARCHITECTURE.md)"
Cohesion: 0.18
Nodes (10): 1. Mimari Genel Bakış, 2. Mobil Harita Kütüphanesi Seçimi ve Analizi, 3.1 Neden NestJS?, 3.2 PostgreSQL + PostGIS Uzamsal (Spatial) Stratejisi, 3. Backend Mimarisi (NestJS + PostgreSQL/PostGIS), 4. Durum Yönetimi ve Veri Akışı, 5. Gerçek Zamanlı İletişim Stratejisi, 6. Güvenilirlik ve Süreklilik Garantisi (+2 more)

### Community 2 - "ŞehirNabız — Güvenlik, Gizlilik, Moderasyon ve Maliyet Analizi (SECURITY_PRIVACY.md)"
Cohesion: 0.20
Nodes (9): 1.1 Konum Bulanıklaştırma (Fuzzy Location & Noise Injection), 1.2 Medya Sanitizasyonu (EXIF / Metadata Stripping), 1. Konum Gizliliği ve KVKK / GDPR Uyumu, 2.1 İtibar (Reputation / Karma) Algoritması, 2.2 Coğrafi Mükerrer Bildirim Engelleme (Spatial Deduplication), 2. Sahte Bildirim ve Spam Önleme Mekanizmaları, 3. Topluluk Moderasyonu ve Güvenilirlik Skoru, 4. Kullanım Maliyetleri ve Optimizasyon Projeksiyonu (+1 more)

### Community 3 - "ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)"
Cohesion: 0.25
Nodes (7): 1. Proje Özeti ve Vizyon, 2. Temel Çalışma Kuralları, 3. Monorepo Yapı Şeması, 4. Graphify Kuralları ve Kullanımı, 5. Güvenlik ve Gizlilik Standartları, 6. Geliştirme Fazları Özeti, ŞehirNabız — Yapay Zeka Ajanları ve Geliştirici Rehberi (AGENTS.md)

### Community 4 - "ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)"
Cohesion: 0.29
Nodes (6): 1. Veritabanı Varlık-İlişki Diyagramı (ERD), 2. PostgreSQL + PostGIS Tablo Şemaları (SQL), 3. İndeksleme Stratejileri, 4.1 Zod Validasyon Şeması (Olay Oluşturma Örneği), 4. Ortak Tipler ve DTO'lar (`packages/shared`), ŞehirNabız — Veri Modelleri ve Şema Belgesi (DATA_MODELS.md)

### Community 5 - "2. İlk Sürüm İçin MVP Kapsamı"
Cohesion: 0.40
Nodes (4): 2. İlk Sürüm İçin MVP Kapsamı, MVP Sonrasına Bırakılan Özellikler (Post-MVP / Out of Scope), MVP'ye Dahil Olan Özellikler (In Scope), ŞehirNabız — Geliştirme Fazları ve MVP Yol Haritası (ROADMAP_PHASES.md)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `1. Geliştirme Fazları` connect `1. Geliştirme Fazları` to `2. İlk Sürüm İçin MVP Kapsamı`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `ŞehirNabız — Geliştirme Fazları ve MVP Yol Haritası (ROADMAP_PHASES.md)` connect `2. İlk Sürüm İçin MVP Kapsamı` to `1. Geliştirme Fazları`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._