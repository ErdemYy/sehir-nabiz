# ŞehirNabız — Kişisel Veri Gizliliği, İçerik Saklama ve Anonimleştirme Politikası

**Tarih:** 28 Ekim 2026  
**Faz:** Phase 16 — Staging Dry-Run, Load Testing, Security Verification & Production Hardening  
**Yasal Dayanak:** KVKK Madde 7, GDPR Article 17 (Right to Erasure / Unutulma Hakkı), Apple App Store Review Guideline 5.1.1(v)  

---

## 1. Giriş ve Temel Prensip

ŞehirNabız, kentsel olayların (kaza, afet, yol çalışması, altyapı arızaları vb.) topluluk tarafından paylaşıldığı ve doğrulandığı bir kentsel bilgi platformudur.

Platformda kullanıcı hesabını sildiğinde iki anayasal ve hukuki hak dengelenmelidir:
1. **Bireyin Unutulma Hakkı ve Kişisel Verilerin Korunması:** Kullanıcının kimliğine, iletişim bilgilerine ve özel hayatına dair tüm izlerin silinmesi veya anonimleştirilmesi.
2. **Kamusal Çıkar ve Kentsel Bilgi Hafızası:** Deprem, su baskını, yol çökmesi gibi kamusal nitelik taşıyan olay kayıtlarının, şehrin tarihsel afet ve altyapı istatistiklerinin korunması.

> [!IMPORTANT]
> **Temel İlke:** Bir olayın korunması ile kişisel verinin korunması aynı şey değildir. Yalnızca kullanıcı adını "Anonim Vatandaş" yapmak tam bir anonimleştirme sağlamaz. Kullanıcının bildirim metnine yazdığı telefon numaraları, e-posta adresleri veya özel referanslar da temizlenmelidir.

---

## 2. Kullanıcı Verilerinin Yaşam Döngüsü ve İşlem Matrisi

Hesap silme işlemi (`DELETE /api/v1/users/me`) gerçekleştirildiğinde veritabanındaki her bir varlık için uygulanan strateji aşağıdaki tabloda özetlenmiştir:

| Veri Varlığı | Durum / Kategori | Uygulanan Strateji | Açıklama ve Güvenlik Güvencesi |
| :--- | :--- | :--- | :--- |
| **Kullanıcı Profili** | Kimlik, E-posta, Şifre | **Kalıcı Anonimleştirme (Scrub)** | `email` -> `deleted_${uuid}@anonymized.local`<br>`displayName` -> `'Anonim Vatandaş'`<br>`passwordHash` -> Rastgele hash<br>`accountStatus` -> `DELETED` |
| **Oturum ve Tokenlar** | Refresh Tokens, JWT | **Fiziksel İmha & İptal** | `isRevoked: true`, soket bağlantıları koparılır, oturumlar kapatılır. |
| **Push Tokenları** | FCM / APNs Tokenları | **Fiziksel Silme** | `push_notification_tokens` tablosundaki tüm kayıtlar fiziksel olarak `DELETE` edilir. |
| **Taslak Bildirimler** | Yerel ve Sunucu Taslakları | **Fiziksel Silme** | Yayınlanmamış tüm taslaklar fiziksel olarak silinir. |
| **İncelemedeki Olaylar** | `PENDING_REVIEW` | **Yayından Kaldırma & Silme** | Henüz onaylanmamış şahsi bildirimler arşivden tamamen çıkarılır. |
| **Kamusal Olaylar** | `ACTIVE` ve `RESOLVED` | **Metin İçi Arındırma (PII Scrub)** | Olay kaydı korunur; `author_id` bağlantısı koparılır (`NULL`); başlık ve açıklamadaki telefon ve e-posta regex ile maskelenir. |
| **Fotoğraf & Medya** | MinIO / S3 Nesneleri | **Fiziksel Silme veya İzolasyon** | Olayla doğrudan ilişkisi koparılan veya kişisel mahremiyet içeren medyalar fiziksel olarak silinir (`s3Client.send(DeleteObjectCommand)`). |
| **Topluluk Teyitleri** | Olay Geri Bildirimleri | **Yazar Bağlantısız Sayaç** | Olayın güvenilirlik puanı korunur; geri bildirimi veren kullanıcı ID'si `NULL` yapılır. |

---

## 3. Metin İçi Kişisel Veri Arındırma (Regex PII Scrubbing)

Kullanıcılar olay bildirirken açıklama alanına sehven veya kasıtlı olarak iletişim bilgilerini yazmış olabilir (Örn: *"Kaza oldu, lütfen beni 0532 123 45 67 numarasından arayın"*).

Phase 16'da `AccountDeletionService.executeDeletion` işlemine otomatik metin arındırma algoritması eklenmiştir:

```typescript
// 1. Türkiye Telefon Numarası Formatları (05xx, +905xx, boşluklu/noktalı)
const phoneRegex = /(\+?90\s?)?(0\s?)?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/g;
event.description = event.description.replace(phoneRegex, '[Telefon Gizlendi]');

// 2. E-posta Adresleri
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
event.description = event.description.replace(emailRegex, '[E-posta Gizlendi]');
```

Bu temizlik, PostgreSQL üzerinde atomik transaction içinde işletilir ve canlı E2E testleri (`apps/api/test/staging_lifecycle.e2e-spec.ts` Adım 12) ile doğrulanmıştır.

---

## 4. Medya ve Görsel Gizliliği Gerçekleri ve Şeffaflık Bildirimi

### 1. EXIF ve GPS Meta Verisi Temizliği (Mevcut)
- İstemci fotoğrafı yüklediğinde veya presigned upload tamamlandığında Sharp kütüphanesi ile tüm EXIF, lens, çekim tarihi ve gömülü GPS koordinatları temizlenir (Phase 4).

### 2. Yüz ve Araç Plakası Algılama Durumu (Dürüst Açıklama)
> [!CAUTION]
> **Şeffaflık Taahhüdü:** ŞehirNabız platformunda şu anda sunucu tarafında veya istemcide çalışan **otomatik yapay zeka yüz buzlama veya araç plakası sansürleme modülü BULUNMAMAKTADIR.**
> Bu özellik geliştirilmediği için kullanıcılara "Fotoğraflarınızdaki yüzler ve plakalar otomatik gizlenmektedir" şeklinde yanıltıcı bir taahhüt verilmez.

Kullanıcı arayüzünde ve gizlilik politikasında şu açıklama yer alır:
> *"Lütfen olay bildirimi yaparken şahısların yüzlerini, özel konut kapı numaralarını veya araç plakalarını doğrudan içeren yakın çekim fotoğraflar paylaşmayınız. Mahremiyet ihlali içeren fotoğraflar moderasyon ekibimizce yayından kaldırılır."*

---

## 5. Doğrulama ve Kabul Kriterleri

- `apps/api/test/staging_lifecycle.e2e-spec.ts`: Kullanıcı hesabını sildikten sonra PostgreSQL üzerindeki kentsel olayın açıklamasındaki telefon numarasının `[Telefon Gizlendi]`, e-posta adresinin `[E-posta Gizlendi]` olduğu test edilip doğrulanmıştır.
- `apps/api/test/phase_15_account_deletion_verification.e2e-spec.ts`: MinIO nesne deposundaki yüklenmiş test medyasının fiziksel olarak silindiği ve AWS S3 `NoSuchKey (404)` hatası döndürdüğü doğrulanmıştır.
