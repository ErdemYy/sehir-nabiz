# ŞehirNabız — Kişisel Veri Gizliliği, İçerik Saklama ve Anonimleştirme Politikası

**Tarih:** 29 Ekim 2026  
**Faz:** Phase 17 — Distributed Reliability, Outbox Delivery Assurance & Deployment Hardening  
**Yasal Dayanak:** KVKK Madde 7, GDPR Article 17 (Right to Erasure / Unutulma Hakkı), Apple App Store Review Guideline 5.1.1(v)  
**Referans Modül:** [`apps/api/src/common/utils/pii-scrubber.util.ts`](file:///C:/Users/Okul/OneDrive/Belgeler/ŞehirNabız/apps/api/src/common/utils/pii-scrubber.util.ts)

---

## 1. Giriş ve Temel Prensip

ŞehirNabız, kentsel olayların (kaza, afet, yol çalışması, altyapı arızaları vb.) topluluk tarafından paylaşıldığı ve doğrulandığı bir kentsel bilgi platformudur.

Platformda kullanıcı hesabını sildiğinde iki anayasal ve hukuki hak dengelenmelidir:
1. **Bireyin Unutulma Hakkı ve Kişisel Verilerin Korunması:** Kullanıcının kimliğine, iletişim bilgilerine ve özel hayatına dair tüm izlerin silinmesi veya anonimleştirilmesi.
2. **Kamusal Çıkar ve Kentsel Bilgi Hafızası:** Deprem, su baskını, yol çökmesi gibi kamusal nitelik taşıyan olay kayıtlarının, şehrin tarihsel afet ve altyapı istatistiklerinin korunması.

> [!IMPORTANT]
> **Temel İlke:** Bir olayın korunması ile kişisel verinin korunması aynı şey değildir. Yalnızca kullanıcı adını "Anonim Vatandaş" yapmak tam bir anonimleştirme sağlamaz. Kullanıcının bildirim metnine (başlık veya açıklama) yazdığı telefon numaraları, kimlik numaraları, e-posta adresleri veya özel referanslar da temizlenmelidir.

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
| **Kamusal Olaylar** | `ACTIVE` ve `RESOLVED` | **Metin İçi Arındırma (PII Scrub)** | Olay kaydı korunur; `author_id` bağlantısı koparılır (`NULL`); başlık ve açıklamadaki cep telefonu, sabit hat, TCKN ve e-posta `PiiScrubber` ile maskelenir. |
| **Fotoğraf & Medya** | MinIO / S3 Nesneleri | **Fiziksel Silme veya İzolasyon** | Olayla doğrudan ilişkisi koparılan veya kişisel mahremiyet içeren medyalar fiziksel olarak silinir (`s3Client.send(DeleteObjectCommand)`). |
| **Topluluk Teyitleri** | Olay Geri Bildirimleri | **Yazar Bağlantısız Sayaç** | Olayın güvenilirlik puanı korunur; geri bildirimi veren kullanıcı ID'si `NULL` yapılır. |

---

## 3. Metin İçi Kişisel Veri Arındırma (PiiScrubber Engine)

Phase 17'de metin arındırma mantığı merkezi ve kapsamlı bir yardımcı sınıfa (`PiiScrubber`) dönüştürülmüş; hem olay açıklaması (`description`) hem de olay başlığı (`title`) bu kontrolden geçirilmektedir:

### Desteklenen PII Kalıpları
1. **Türkiye Cep Telefonları:** `05xx`, `+905xx`, `905xx`, boşluklu, tireli veya noktalı gösterimler (`[Telefon Gizlendi]`).
2. **Türkiye Sabit Hatları:** `02xx`, `03xx`, `04xx`, alan kodlu kurumsal ve ev hatları (`[Sabit Hat Gizlendi]`).
3. **TC Kimlik Numarası (TCKN):** 11 haneli ulusal kimlik numaraları; 10 haneli telefon numaralarıyla çakışmayı önlemek için öncelikli olarak ayrıştırılır (`[TCKN Gizlendi]`).
4. **E-posta Adresleri:** Tüm RFC uyumlu e-posta formatları (`[E-posta Gizlendi]`).

### Yanlış Pozitif (False-Positive) Koruması
- Coğrafi koordinatlar (`41.0082, 28.9784`)
- Tarih formatları (`2026-10-29`, `29.10.2026`)
- 5 haneli posta kodları (`34710`)
- Sayısal mesafe ve sayaçlar

telefon veya kimlik numarası sanılarak **hatalı olarak maskelenmez**.

---

## 4. Regex Tabanlı Maskelemenin Sınırları ve Risk Yönetimi

> [!WARNING]
> **Regex Sınırları Bildirimi:** Düzenli ifadeler (Regex); telefon, kimlik ve e-posta gibi belirli şablonlara uyan verileri %100'e yakın başarıyla temizler. Ancak **serbest dille yazılmış açık adresleri, mahalle/sokak/apartman tariflerini veya şahıs adlarını tespit edemez.**
>
> *(Örnek: "Moda Caddesi Pembe Köşk Apartmanı No:14 Daire 3'teki komşumun kapısı önü" ifadesi regex tarafından yakalanamaz.)*

Bu sınırlılık nedeniyle ŞehirNabız platformunda şu **4 kademeli tamamlayıcı koruma mekanizması** zorunlu kılınmıştır:

1. **Manuel Moderasyon ve İhbar:** Açık adres veya şahıs ismi içeren olaylar topluluk tarafından "Kişisel Veri / Mahremiyet İhlali" gerekçesiyle ihbar edilebilir.
2. **Kamusal Görünürlüğü Sınırlandırma:** Moderasyon incelemesine alınan olaylar haritada anında gizlenir (`status = 'UNDER_REVIEW'`).
3. **Kullanıcı Silme ve İtiraz Talebi:** Kullanıcı veya üçüncü şahıslar `privacy@sehirnabiz.com` veya KVKK başvuru formu üzerinden belirli bir olayın içeriğinin manuel olarak temizlenmesini talep edebilir.
4. **İçerik Yeniden İnceleme Kuyruğu:** Hesap silme işlemi sırasında yüksek riskli kategorilerdeki (örn: şüpheli kişi, hırsızlık vb.) olaylar otomatik olarak moderatör denetim kuyruğuna aktarılır.

---

## 5. Medya ve Görsel Gizliliği Gerçekleri ve Şeffaflık Bildirimi

### 1. EXIF ve GPS Meta Verisi Temizliği (Mevcut)
- İstemci fotoğrafı yüklediğinde veya presigned upload tamamlandığında Sharp kütüphanesi ile tüm EXIF, lens, çekim tarihi ve gömülü GPS koordinatları temizlenir (Phase 4).

### 2. Yüz ve Araç Plakası Algılama Durumu (Dürüst Açıklama)
> [!CAUTION]
> **Şeffaflık Taahhüdü:** ŞehirNabız platformunda şu anda sunucu tarafında veya istemcide çalışan **otomatik yapay zeka yüz buzlama veya araç plakası sansürleme modülü BULUNMAMAKTADIR.**
> Bu özellik geliştirilmediği için kullanıcılara "Fotoğraflarınızdaki yüzler ve plakalar otomatik gizlenmektedir" şeklinde yanıltıcı bir taahhüt verilmez.

Kullanıcı arayüzünde ve gizlilik politikasında şu açıklama yer alır:
> *"Lütfen olay bildirimi yaparken şahısların yüzlerini, özel konut kapı numaralarını veya araç plakalarını doğrudan içeren yakın çekim fotoğraflar paylaşmayınız. Mahremiyet ihlali içeren fotoğraflar moderasyon ekibimizce yayından kaldırılır."*

---

## 6. Doğrulama ve Kabul Kriterleri

- `apps/api/test/phase_17_distributed_reliability.spec.ts`: `PiiScrubber` birim testleri; cep telefonu, sabit hat, TCKN ve e-posta maskelemesini, koordinat/tarih false-positive bağışıklığını kanıtlamıştır.
- `apps/api/test/staging_lifecycle.e2e-spec.ts`: Canlı PostgreSQL ortamında hesap silme sonrası olay başlık ve açıklamalarının PII'dan arındırıldığı doğrulanmıştır.
- `apps/api/test/phase_15_account_deletion_verification.e2e-spec.ts`: MinIO nesne deposundaki yüklenmiş test medyasının fiziksel olarak silindiği ve AWS S3 `NoSuchKey (404)` hatası döndürdüğü doğrulanmıştır.
