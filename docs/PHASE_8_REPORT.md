# ŞehirNabız — Phase 8 Geliştirme ve Doğrulama Raporu (PHASE_8_REPORT.md)

**Rapor Tarihi:** 27 Ekim 2026  
**Aşama:** Phase 8 — Topluluk Teyit Sistemi, Güvenilirlik ve Moderasyon  
**Önceki Commit:** `6936c96` (Phase 7.5)  
**Durum:** TAMAMLANDI (%100 Başarı, 172/172 Test Yeşil, Sıfır Regresyon, Katı Güvenlik ve Gizlilik)

---

## 1. Feedback Sistemi (Topluluk Geri Bildirimi)

ŞehirNabız platformunda vatandaşların sahadaki kentsel aksaklıklara (kaza, yol çalışması, altyapı arızası vb.) dair bilgi teyidi, itirazı ve çözülme durumu paylaşabilmesi amacıyla çok yönlü bir topluluk geri bildirimi mimarisi kurulmuştur:

- **Desteklenen Geri Bildirim Türleri (`FeedbackType`):**
  1. `CONFIRM`: *"Ben de gördüm"* — Olayın sahada fiilen devam ettiğini teyit eder.
  2. `DISPUTE`: *"Bilgi yanlış veya yanıltıcı"* — Olayın asılsız olduğunu, yanlış konumlandırıldığını veya yanıltıcı bilgi içerdiğini belirtir.
  3. `RESOLVED_REPORT`: *"Sorun çözülmüş olabilir"* — Sahadaki aksaklığın giderildiğini veya trafiğin normale döndüğünü bildirir.
- **Tek Aktif Geri Bildirim ve Yarış Durumu (Race Condition) Koruması:**
  - Bir kullanıcının aynı olay üzerinde yalnızca **tek bir aktif geri bildirimi** bulunabilir.
  - Veritabanı seviyesinde `UNIQUE("eventId", "userId")` kısıtı uygulanmıştır.
  - Eşzamanlı istekler veya ağ gecikmelerinde mükerrer kayıt açılması veritabanı kısıtı ve transaction izolasyonu ile engellenmiştir.
- **İdempotent Güncelleme ve Geri Çekme:**
  - Kullanıcı fikrini değiştirdiğinde (örneğin `CONFIRM` vermişken `DISPUTE` olarak güncellemek istediğinde) mevcut kaydı güncellenir (`upsert`).
  - `DELETE /api/v1/events/:id/feedback` uç noktası ile geri bildirimini dilediği zaman geri çekebilir.
- **Kendi Olayını Teyit Etme Yasağı:**
  - Bildirimi açan yazarın kendi olayına geri bildirim vermesi engellenmiştir (`BadRequestException: 'Kendi bildirdiğiniz olaya geri bildirim veremezsiniz.'`).

---

## 2. Veritabanı Modelleri

Phase 8 kapsamında iki yeni PostgreSQL ilişkisel tablosu, bir özel enum ve `events` tablosunda sayaç sütunları oluşturulmuş; TypeORM reversable migration'ı (`1740000003000-CreateEventFeedbackAndReputationLogs.ts`) hazırlanmıştır:

### 2.1 `EventFeedbackEntity` (`event_feedbacks` Tablosu)
- `id`: UUID (Primary Key, `uuid_generate_v4()`)
- `eventId`: UUID (Indexed FK -> `events.id`, `ON DELETE CASCADE`)
- `userId`: UUID (Indexed FK -> `users.id`, `ON DELETE CASCADE`)
- `type`: Enum `feedback_type` (`CONFIRM`, `DISPUTE`, `RESOLVED_REPORT`)
- `reason`: VARCHAR(500), nullable (Opsiyonel açıklama metni)
- `createdAt`: TIMESTAMPTZ (Varsayılan `NOW()`)
- `updatedAt`: TIMESTAMPTZ (Varsayılan `NOW()`)
- **Kısıt:** `CONSTRAINT uq_event_feedback_event_user UNIQUE ("eventId", "userId")`

### 2.2 `UserReputationLogEntity` (`user_reputation_logs` Tablosu)
- `id`: UUID (Primary Key)
- `userId`: UUID (Indexed FK -> `users.id`, `ON DELETE CASCADE`)
- `delta`: INT (Puan değişimi: pozitif veya negatif)
- `reason`: VARCHAR(150) (Değişiklik sebebi)
- `referenceId`: UUID, nullable (İlgili olay veya işlem kimliği)
- `createdAt`: TIMESTAMPTZ

### 2.3 `events` Tablosu Sayaç Genişletmesi
- `confirmationCount`: INT NOT NULL DEFAULT 0 (`CONFIRM` geri bildirim toplamı)
- `denialCount`: INT NOT NULL DEFAULT 0 (Geriye uyumluluk)
- `disputeCount`: INT NOT NULL DEFAULT 0 (`DISPUTE` geri bildirim toplamı)
- `resolvedReportCount`: INT NOT NULL DEFAULT 0 (`RESOLVED_REPORT` geri bildirim toplamı)

---

## 3. API Endpointleri

Tüm uç noktalar REST standartlarına, Zod validasyonuna ve katmanlı güvenlik guard'larına sahiptir:

| Metot | Uç Nokta | Yetkilendirme | Açıklama |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/events/:id/feedback` | `JwtAuthGuard` | Olay için geri bildirim ekleme veya güncelleme |
| `DELETE` | `/api/v1/events/:id/feedback` | `JwtAuthGuard` | Kullanıcının aktif geri bildirimini geri çekmesi |
| `GET` | `/api/v1/events/:id/feedback/summary` | `OptionalJwtAuthGuard` | Topluluk geri bildirim özeti ve açıklanabilir gösterge |
| `GET` | `/api/v1/moderation/events` | `RolesGuard(MODERATOR, ADMIN)` | Moderatör olay listesi (statü, kategori, cursor filtreli) |
| `GET` | `/api/v1/moderation/events/:id` | `RolesGuard(MODERATOR, ADMIN)` | Moderatör için tam olay detayı, loglar ve geri bildirimler |
| `PATCH` | `/api/v1/events/:id/status` | `JwtAuthGuard` | Durum geçişi (Moderatör, Belediye veya Yazar yetki matrisi) |

---

## 4. Moderasyon Sistemi

### 4.1 Yetki Matrisi (Role-Based Access Control)
- **`CITIZEN`:** Moderasyon yetkisi yoktur. Yalnızca kendi oluşturduğu aktif olayı `RESOLVED` yapabilir.
- **`MODERATOR` / `ADMIN`:**
  - Bekleyen olayları inceleme ve onaylama (`PENDING_REVIEW` -> `ACTIVE`).
  - Asılsız/spam olayları reddetme (`PENDING_REVIEW` | `ACTIVE` | `DISPUTED` -> `REJECTED`).
  - İtiraz alan olayları incelemeye alma (`ACTIVE` -> `DISPUTED`).
  - İtirazlı olayları yeniden yayına alma (`DISPUTED` -> `ACTIVE`) veya kapatma (`DISPUTED` -> `RESOLVED`).
- **`MUNICIPAL_OFFICER`:** Otomatik tam moderasyon yetkisine sahip değildir; yalnızca saha müdahalesi kapsamında olayları `RESOLVED` yapabilir.

### 4.2 Denetim İzi (Audit Trail)
- Tüm moderasyon kararları veritabanı transaction'ı içerisinde `event_moderation_logs` tablosuna önceki statü, yeni statü, moderatör kimliği, zaman damgası ve gerekçe metni ile birlikte kalıcı olarak kaydedilir.

---

## 5. Mobil Olay Detayı Deneyimi

Urban Floating UI tasarım ilkelerine sadık kalınarak `apps/mobile/app/events/[id].tsx` tam olay detay sayfası geliştirilmiştir:

- **Görsel Hiyerarşi:** Kategori rozeti, durum rozeti, önem derecesi, başlık, detaylı açıklama, konum kartı ve bildirim zamanı.
- **Topluluk Değerlendirme Kartı:** Yeşil "Gördüm", Kırmızı "İtiraz" ve Mavi "Çözüldü" metrikleri; açıklanabilir metin ve bilgilendirici yasal uyarı notu.
- **3 Aksiyon Butonu:**
  - "Ben de Gördüm" (Lucide `CheckCircle2`)
  - "Yanlış Bilgi Bildir" (Lucide `AlertTriangle`)
  - "Sorun Çözüldü Bildir" (Lucide `CheckCheck`)
- **Seçim & Geri Çekme:** Kullanıcının aktif tercihi turkuaz vurgu alır; altında "Geri Bildirimimi Kaldır (Geri Çek)" eylemi belirir.
- **Yetkisiz Kullanıcı Davranışı:** Oturum açmamış kullanıcı teyit butonuna bastığında `AuthModal` açılır; başarılı girişin ardından işlem kullanıcının isteği kaybolmadan otomatik tamamlanır.

---

## 6. Topluluk Güvenilirlik Göstergesi ve Sahte Kesinlik Engeli

- **Açıklanabilirlik Prensibi:**
  - Kullanıcı oyları hiçbir zaman resmî kesinlik ifade etmez.
  - Sahte kesinlik yaratacak *"Bu olay %95 doğrudur"* benzeri yanıltıcı yüzdeler ve algoritmik skorlar kullanıcı arayüzünden tamamen kaldırılmıştır.
- **Yeterli Örneklem Eşiği ($N \ge 3$):**
  - Toplam bildirim sayısı 3'ün altında ise: *"Topluluk değerlendirmesi henüz oluşmadı (en az 3 bağımsız bildirim gereklidir)."*
  - Toplam bildirim 3 veya daha fazla olduğunda: *"12 kişi gördüğünü bildirdi, 3 kişi bilgiye itiraz etti, 2 kişi çözüldüğünü düşünüyor"* formatında şeffaf döküm sunulur.
- **Otomatik Durum Değişikliği Yasağı:**
  - Topluluk oyları tek başına bir olayı asla otomatik olarak `ACTIVE` veya `VERIFIED` yapmaz. Olayın yaşam döngüsü durumu yalnızca yetkili moderasyon veya belediye süreçleriyle kontrol edilir.

---

## 7. Güvenlik ve Gizlilik Önlemleri

1. **Gizli Olay Gizlilik Kalkanı (Information Disclosure Shield):**
   - `PENDING_REVIEW` veya `REJECTED` statüsündeki olaylara ilişkin geri bildirim veya detay taleplerinde yetkisiz kullanıcılara `404 Not Found` dönülerek olayın varlığı dahi sızdırılmaz.
2. **Kişisel Veri İzolasyonu:**
   - Geri bildirim veren vatandaşların ad-soyad, telefon veya açık kimlik bilgileri genel kullanıcılara ifşa edilmez.
3. **Konum Gizliliği ve GPS İzolasyonu:**
   - Teyit vermek için kullanıcıdan zorunlu GPS konumu istenmez.
   - Geri bildirim veren kullanıcıların anlık enlem/boylam koordinatları sunucu veritabanına asla kaydedilmez.
4. **Organize Oy ve İtibar Manipülasyonu Koruması:**
   - İlk sürümde yalnızca geri bildirim vererek sınırsız itibar puanı kazanılmasına izin verilmemiştir; bot/spam ordularının itibar puanı kasması engellenmiştir.
   - Kendi olayına teyit verme engellenmiştir.
   - Rate limit ve aktif hesap zorunluluğu uygulanmıştır.

---

## 8. Test Sonuçları

Önceki fazların **141 testi eksiksiz korunmuş**, Phase 8 kapsamında **+31 yeni test** eklenerek toplam test sayısı **172'ye** çıkarılmıştır (%100 Başarı):

```text
Test Paketleri Özeti:
-------------------------------------------------------------
1. @sehir-nabiz/design-tokens:   11 passed (11)
2. @sehir-nabiz/shared:           5 passed (5)    [+1 yeni test]
3. sehir-nabiz-mobile:           49 passed (49)   [+8 yeni test]
4. sehir-nabiz-api:             107 passed (107)  [+22 yeni test]
   - Unit Testleri:              62 passed (62)
   - PostgreSQL/PostGIS Canlı:   26 passed (26)
   - MinIO Storage Canlı:         8 passed (8)
   - Auth & Token Rotation Canlı:11 passed (11)
-------------------------------------------------------------
TOPLAM:                         172 passed, 0 failed (%100 YEŞİL)
```

---

## 9. Graphify Bilgi Grafı Metrikleri

Kod değişikliklerinden sonra `graphify update .` AST güncelleyicisi çalıştırılmıştır:

- **Düğüm (Node) Sayısı:** 1.818 node (Phase 7.5'teki 1.679'dan +139 node artış)
- **Kenar (Edge) Sayısı:** 3.971 edge
- **Topluluk (Community) Sayısı:** 113 topluluk
- **Güncellenen Çıktılar:** `graphify-out/graph.json`, `graphify-out/graph.html`, `graphify-out/GRAPH_REPORT.md`

---

## 10. Commit Bilgisi

- **Hazırlanan Commit Türü:** `feat(phase-8)`
- **Mesaj:** `feat(phase-8): implement community feedback system, explainable reliability summary, and moderation panel`

---

## 11. Açık Teknik Sorunlar

- Şu an için bilinen herhangi bir açık teknik blokaj veya hata bulunmamaktadır.
- Canlı Docker PostgreSQL 16 (Port 5434), Redis 7 (Port 6380) ve MinIO (Port 9000) entegrasyon testlerinin tamamı sıfır hata ile geçmiştir.

---

## 12. Android Native Doğrulama Durumu

- Expo SDK 58 / React Native 0.88 New Architecture yapılandırması korunmuştur.
- TypeScript strict derlemesi (`tsc --noEmit`) sıfır hata vermiştir.
- **Önemli Not:** Phase 8 talimatı uyarınca, bu fazda gerçek cihaz üzerinde fiziksel Android APK kurulumu ve donanım saha testleri zorunlu tutulmamış olup, bu fiziksel testlerin henüz gerçekleştirilmediği açıkça not edilmiştir.

---

## 13. Phase 9 Önerileri

1. **WebSocket / Socket.io Entegrasyonu:** Harita veya Olay Detay ekranı açıkken diğer kullanıcılardan gelen geri bildirim sayaçlarının ve yeni onaylanmış olayların anlık (real-time) soket üzerinden güncellenmesi.
2. **Push Bildirimleri (Expo Notifications):** Kullanıcının yakın çevresindeki (ör. 2 km) kritik önem derecesine sahip olaylar onaylandığında mobil cihazına anlık uyarı iletilmesi.
3. **Belediye / Görevli Saha Doğrulaması:** Saha ekiplerinin olayı inceleyip tek dokunuşla "Ekipler Müdahale Ediyor" veya "Çözüldü" statüsüne geçirebilmesi.
