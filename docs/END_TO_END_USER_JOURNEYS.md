# ŞehirNabız — Uçtan Uca Kullanıcı Yolculukları (End-to-End User Journeys)

**Tarih:** 27 Ekim 2026  
**Faz:** Phase 12 — Mobile Experience Audit, E2E Quality & Beta Readiness  
**Doğrulama Dosyası:** `apps/mobile/test/phase_12_journeys.test.js` (16 test)  
**Toplam Monorepo Testi:** 294 Başarılı Test  

---

## 1. Giriş ve Amaç

Bu doküman, ŞehirNabız kentsel bilgi platformunun en kritik 6 kullanıcı yolculuğunun (User Journey A–F) uçtan uca akış şemalarını, güvenlik bariyerlerini, veri tutarlılık kurallarını ve otomatik test karşılıklarını ayrıntılı olarak belgeler.

---

## 2. Yolculuk Detayları ve Doğrulama Raporu

### Yolculuk A: Misafir Kullanıcı Keşfi ve Kademeli Giriş (Progressive Auth)
- **Başlangıç Durumu:** Kullanıcı uygulamayı ilk kez indirmiş ve misafir (`isAuthenticated: false`) olarak açmıştır.
- **Akış Adımları:**
  1. Kullanıcı Harita ekranında gezinir, BBox bazlı olay pinlerini inceler.
  2. Kategori filtrelerinden "Yol Çalışması" çipini seçer.
  3. Bir olaya dokunarak `events/[id]` detay sayfasına geçer.
  4. "Ben de gördüm" (`CONFIRM`) veya "İtiraz Et" (`DISPUTE`) butonuna basar.
  5. **Auth Kalkanı Devreye Girer:** İstek API'ye gönderilmez; bekleyen eylem (`pendingAction: { actionType: 'CONFIRM', eventId }`) belleğe alınır ve `AuthModal` açılır.
  6. Kullanıcı e-posta ve şifresiyle giriş yapar veya yeni hesap açar.
  7. **State Korunumu:** Oturum başarıyla açıldığında modal kapanır, bekleyen teyit işlemi otomatik olarak tamamlanır ve kullanıcıya başarılı geri bildirim gösterilir.
- **Doğrulama:** `phase_12_journeys.test.js` -> *Yolculuk A testleri*.

---

### Yolculuk B: Yeni Kullanıcı Olay Bildirim Akışı ve Medya Güvenliği
- **Başlangıç Durumu:** Oturum açmış bir vatandaş (`reputationScore: 10`) sokakta bir arıza görür.
- **Akış Adımları:**
  1. Alt navigasyondaki yüzen "+" (Bildir) butonuna basar.
  2. **Adım 1 (Kategori & Detay):** Kategori listesinden "Su Kesintisi / Arıza" seçer, başlık ve kısa açıklama yazar.
  3. **Adım 2 (Konum Seçimi):** `LocationPickerModal` açılır; harita merkezindeki iğne ile boru patlağının olduğu cadde işaretlenir. Ters coğrafi kodlama ile ilçe ve mahalle otomatik doldurulur.
  4. **Adım 3 (Medya & EXIF Temizleme):** Kullanıcı kamerayla 1 adet fotoğraf çeker. İstemci tarafında EXIF ve GPS meta verileri silinir (`isSanitized: true`).
  5. **Adım 4 (Önizleme & Gönder):** Özet kartı incelenir ve "Bildirimi Tamamla" butonuna basılır.
  6. **Çift Gönderim Kilidi:** Gönderim anında buton kilitlenir (`isSubmitting: true`); mükerrer tıklamalar engellenir.
  7. **İtibar Kuralı:** Kullanıcının itibar puanı < 50 olduğu için olay doğrudan yayına alınmaz; `PENDING_REVIEW` durumunda moderatör kuyruğuna düşer.
- **Doğrulama:** `phase_12_journeys.test.js` -> *Yolculuk B testleri*.

---

### Yolculuk C: Moderatör Onay/Red İş Akışı ve Canlı Dağıtım
- **Başlangıç Durumu:** İnceleme bekleyen yeni bir olay kuyrukta beklemektedir; haritada genel kullanıcılara görünmez.
- **Akış Adımları:**
  1. `MODERATOR` rolündeki yetkili Profil ekranından "Moderatör Paneli"ne girer (`moderation/index.tsx`).
  2. "İnceleme Bekleyenler" sekmesinde olayın detaylarını, fotoğrafını ve konumunu inceler.
  3. **Karar Verme:**
     - *Onay Durumu:* "Onayla" tıklandığında olay durumu `ACTIVE` olur.
     - *Red Durumu:* "Reddet" tıklandığında moderatörün bir gerekçe yazması zorunludur ("Mükerrer ihbar"). Olay `REJECTED` durumuna geçer.
  4. **Canlı Dağıtım (WebSocket):** Olay onaylandığında soket üzerinden `EVENT_STATUS_CHANGED` yayını yapılır; harita otomatik olarak pini gösterir.
  5. **Kullanıcı Bildirimi:** Olayı bildiren vatandaşa bildirim gönderilir; reddedilmişse "Bildirdiğim Olaylar" sayfasında kırmızı uyarı kartı içinde moderatörün yazdığı red gerekçesi gösterilir.
- **Doğrulama:** `phase_12_journeys.test.js` -> *Yolculuk C testleri*.

---

### Yolculuk D: Topluluk Teyit Sistemi ve Oy Tutarlılığı
- **Başlangıç Durumu:** Haritada yayında (`ACTIVE`) bir trafik kazası olayı bulunmaktadır (Mevcut durum: 5 Teyit, 1 İtiraz).
- **Akış Adımları:**
  1. Başka bir kullanıcı olay detayını açar. (Olayı açan kişi oy veremez — 400 Bad Request kuralı).
  2. "Ben de gördüm" butonuna tıklar: `confirmationCount` 6'ya yükselir, `userVote` `CONFIRM` olur.
  3. Kullanıcı olay yerinden ayrılırken bilginin yanıltıcı olduğunu fark edip "İtiraz Et" butonuna tıklar:
     - `confirmationCount` otomatik olarak 5'e düşer.
     - `disputeCount` 2'ye yükselir.
     - Sayaçlar hiçbir yarış durumuna yol açmadan atomik olarak güncellenir.
  4. Kullanıcı oyunu tamamen geri çekmek istediğinde "Teyitimi Geri Çek" seçeneğini kullanır:
     - `disputeCount` 1'e iner; `userVote` `null` olur.
- **Doğrulama:** `phase_12_journeys.test.js` -> *Yolculuk D testleri*.

---

### Yolculuk E: Çevrimdışı Taslak Kurtarma ve Mükerrer Olay Koruması
- **Başlangıç Durumu:** Kullanıcı form doldururken tünele girer veya telefonun şarjı biter.
- **Akış Adımları:**
  1. Kullanıcı Adım 2'de konumu ve başlığı seçmişken uygulama kapanır.
  2. Form durumu `AsyncStorage` üzerindeki `@sehir_nabiz:create_event_draft` anahtarına periyodik olarak kaydedilmiştir.
  3. Kullanıcı uygulamayı tekrar açıp "+" butonuna bastığında "Kaydedilmiş taslağınız bulundu, devam etmek ister misiniz?" uyarısı ile karşılaşır ve formu kaldığı yerden sürdürür.
  4. **150 Metre Mükerrer Olay Kalkanı:**
     - Kullanıcının seçtiği koordinatın 150 metre yarıçapında aynı kategoride aktif bir kaza varsa backend `DuplicateWarning` döner.
     - Mobil ekranda "Bu noktada yakın zamanda bildirilmiş benzer bir olay var. Yeni bildirim yerine mevcut olayı teyit etmek ister misiniz?" uyarısı çıkar.
     - Kullanıcı dilerse mevcut olaya gidip teyit verir, dilerse farklı bir durum olduğunu belirterek devam eder.
- **Doğrulama:** `phase_12_journeys.test.js` -> *Yolculuk E testleri*.

---

### Yolculuk F: Transactional Outbox ve Bildirim Senkronizasyonu
- **Başlangıç Durumu:** Bir olay çözüldü (`RESOLVED`) olarak işaretlenir veya moderatör tarafından onaylanır.
- **Akış Adımları:**
  1. Olay durum güncellemesi ve outbox kaydı aynı PostgreSQL transaction'ında commit edilir (`EventsService.updateStatus`).
  2. Arka plan Outbox Worker servisi (`OutboxProcessorService`), `FOR UPDATE SKIP LOCKED` ile bekleyen olayları kuyruktan alır.
  3. `EVENT_RESOLVED` olayı için ilgili kullanıcılara `UserNotification` kayıtları oluşturulur.
  4. **Idempotency Koruması:** `outbox:${id}:user:${userId}` anahtarı kontrol edilerek aynı olayın sunucu yeniden başlasa dahi birden fazla bildirim üretmesi engellenir.
  5. WebSocket üzerinden istemcilere anlık bildirim iletilir; mobil uygulama bildirim sayacı güncellenir.
- **Doğrulama:** `phase_12_journeys.test.js` -> *Yolculuk F testleri* ve `apps/api/test/outbox.e2e-spec.ts`.

---

## 3. Test Sonuçları Özeti

Tüm 6 yolculuk hem mobil katmanında (`apps/mobile/test/phase_12_journeys.test.js`) hem de backend entegrasyon seviyesinde (`apps/api/test/`) uçtan uca doğrulanmıştır. 

```text
▶ Phase 12 — Uçtan Uca Kullanıcı Yolculukları, Tasarım & Erişilebilirlik Testleri
  ✔ Yolculuk A: Misafir Kullanıcı Akışı ve Auth Kalkanı (2 test)
  ✔ Yolculuk B: Olay Bildirim Akışı ve Medya Güvenliği (3 test)
  ✔ Yolculuk C: Moderatör Onay/Red İş Akışı (2 test)
  ✔ Yolculuk D: Topluluk Geri Bildirimi ve Oy Tutarlılığı (2 test)
  ✔ Yolculuk E: Çevrimdışı Taslak ve Mükerrer Gönderim Koruması (3 test)
  ✔ Yolculuk F: Outbox ve Bildirim Idempotency Güvenliği (1 test)
  ✔ Bölüm 7: Harita Ekranı Dikey Çakışma Önleme ve Geometri Standartları (3 test)
✔ 16 test başarıyla tamamlandı.
```
