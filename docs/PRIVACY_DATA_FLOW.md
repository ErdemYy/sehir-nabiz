# ŞehirNabız — Veri Gizliliği, Konum Akışı ve Teknik Güvenceler (PRIVACY_DATA_FLOW.md)

Bu belge, ŞehirNabız ekosisteminde kullanıcıların kişisel gizliliğini (KVKK / GDPR ilkeleriyle uyumlu olarak) korumak, coğrafi konum verilerinin işlenme ve saklanma süreçlerini şeffaf biçimde belgelemek ve sistemin sunduğu teknik veri güvencelerini netleştirmek amacıyla hazırlanmıştır.

---

## 1. Veri Sınıflandırma Matrisi

ŞehirNabız veri tabanında işlenen veriler 4 katı sınıfa ayrılmıştır:

| Veri Sınıfı | Tanım | Örnek Alanlar | Saklama Konumu | Kamuya Açık mı? |
| :--- | :--- | :--- | :--- | :--- |
| **A. Açık Kentsel Veri** | Kamunun bilgisine sunulan kentsel aksaklık ve olay bilgileri | Olay başlığı, açıklama, kategori, önem derecesi, olay koordinatı | PostgreSQL `events` tablosu | ✅ Evet (`ACTIVE`, `RESOLVED`, `DISPUTED`) |
| **B. Agrege / Özet Veri** | İstatistik ve yoğunluk amacıyla özetlenmiş, tekil olayları gizleyen veriler | Isı haritası ızgara hücreleri, ilçe olay sayıları, kategori yüzdeleri | PostGIS sorgu çıktısı, Redis cache | ✅ Evet (k-Anonymity korumalı) |
| **C. Kullanıcı Kimlik & Profil** | Kullanıcının hesap yönetimi ve itibar takibi için gereken veriler | E-posta, hash'lenmiş şifre, takma ad (displayName), itibar puanı | PostgreSQL `users` tablosu | ❌ Hayır (Yalnızca takma ad ve itibar puanı olay yazarında gösterilir) |
| **D. Yasaklı / Saklanmayan Veri** | Mahremiyet ihlali yaratabilecek, toplanması ve saklanması kesinlikle yasaklanmış veriler | Cihaz GPS anlık konumu, hareket rotası/geçmişi, fotoğrafların EXIF/kamera meta verisi | **ASLA SAKLANMAZ** | ❌ Hayır (Bellekte bile tutulmaz) |

---

## 2. Dört Farklı Koordinat Türü ve İşleyişi

Kullanıcıların kafasında karışıklık yaratmamak için ŞehirNabız ekosistemindeki koordinat türleri kesin çizgilerle ayrılmıştır:

```
+------------------------------------------------------------------------------------+
|                                KULLANICI CİHAZI                                    |
|                                                                                    |
|   [Cihaz Donanım GPS'i]                                                            |
|          |                                                                         |
|          v  (Yalnızca haritada harita merkezini konumlandırmak için istemcide kalır) |
|   (1) BİLDİREN CİHAZ KOORDİNATI (Reporter Device GPS)                             |
|       * KESİNLİKLE SUNUCUYA İLETİLMEZ, DB'YE YAZILMAZ, LOGLANMAZ.                  |
|                                                                                    |
|          | (Kullanıcı haritada pini sürükler veya adres seçer)                     |
|          v                                                                         |
|   (2) GERÇEK OLAY KOORDİNATI (Event Chosen Coordinates)                           |
|       * Kullanıcının kaza veya arızayı gördüğünü beyan ettiği nokta.                |
|       * POST /api/v1/events ile iletilir.                                         |
+------------------------------------------------------------------------------------+
                                       |
                                       v
+------------------------------------------------------------------------------------+
|                               ŞEHİRNABIZ SUNUCUSU                                  |
|                                                                                    |
|   (3) KAMUYA AÇIK HARİTA KOORDİNATI (Public Event Coordinates)                     |
|       * Onaylanan (ACTIVE) olaylar harita üzerinde bu koordinatla gösterilir.      |
|       * Olayı bildiren vatandaşın gerçekte nerede durduğu bilgisi mevcut DEĞİLDİR. |
|                                                                                    |
|   (4) AGREGASYON / HEATMAP KOORDİNATLARI (k-Anonymity Grid)                        |
|       * Koordinatlar 3 basamağa yuvarlanır (~110 metre ızgara).                    |
|       * k-Anonymity eşiği (örn. minCount < 2) altındaki tekil noktalar BASTIRILIR. |
|       * Tekil bir kullanıcının evinin/konumunun tespiti engellenir.               |
+------------------------------------------------------------------------------------+
```

### 2.1. Bildiren Cihaz Koordinatları (Reporter Device Location)
- **Kural:** Mobil uygulamanın GPS'ten aldığı anlık cihaz koordinatları **yalnızca yerel cihaz belleğinde** harita kamerasını kullanıcının bulunduğu bölgeye odaklamak için kullanılır.
- **Güvence:** Bu koordinatlar API istek gövdesine eklenmez, arka plana kaydedilmez, analitik sağlayıcılara gönderilmez ve kullanıcı hareket rotası (tracking) **asla tutulmaz**.

### 2.2. Gerçek Olay Koordinatları (Event Coordinates)
- **Kural:** Vatandaşın harita üzerinde pini bırakarak "Olay burada gerçekleşti" dediği konumdur.
- **Kullanım:** Olayın doğru mahalle, cadde ve ilçede konumlanması için PostgreSQL PostGIS `GEOMETRY(Point, 4326)` formatında saklanır.

### 2.3. Kamuya Açık Olay Koordinatları (Public Coordinates)
- Yalnızca moderasyon tarafından incelenip onaylanan (`ACTIVE`), çözülen (`RESOLVED`) veya itiraz edilen (`DISPUTED`) olayların koordinatları harita API'si (`/events/bbox`, `/events/nearby`) üzerinden vatandaşlara sunulur.
- İnceleme bekleyen (`PENDING_REVIEW`) veya reddedilen (`REJECTED`) olaylar harita ve arama sorgularından filtrelenir; bu sayede mükerrer veya asılsız konumlar sızdırılmaz.

### 2.4. Isı Haritası (Heatmap) Koordinatları ve $k$-Anonymity
- Bütünleşik yoğunluk haritasında tek tek olayların koordinatları verilmez.
- Koordinatlar `ST_SnapToGrid` / `ROUND(..., 3)` ile yaklaşık 110x110 metrelik ızgaralara toplanır.
- **Sparse Cell Suppression (k-Anonymity):** Bir hücrede belirtilen eşiğin altında olay varsa ($k < 2$), o hücre gizlenir (`suppressedPoints`). Böylece tenha bir sokaktaki tekil bir bildirim haritada deşifre edilemez.

---

## 3. Yanıltıcı İddiaların Düzeltilmesi (150m Bulanıklaştırma İncelemesi)

Önceki mobil arayüz sürümlerinde ayarlar ekranında yer alan *"150 Metre Konum Bulanıklaştırma — Ev/iş konumu doğrudan ifşa edilmez"* ifadesi teknik bir denetime tabi tutulmuştur:
- **Bulgu:** Sistemde kullanıcının ev/iş profili koordinatı tutulmamaktadır; dolayısıyla bir ev koordinatına rastgele yapay gürültü (noise/offset) ekleme mekanizması bulunmamaktadır. Bu ifadenin kullanıcıda "olay konumunun 150m yanlış gösterildiği" gibi hatalı bir algı yarattığı tespit edilmiştir.
- **Düzeltme:** Ayarlar ekranındaki yanıltıcı metin tamamen temizlenmiş; yerine sistemin sağladığı gerçek teknik kontroller (Cihaz GPS'i Saklanmaz, EXIF GPS Temizleme Garantisi, Isı Haritası $k$-Anonymity) yerleştirilmiştir.

---

## 4. Medya ve Fotoğraf Meta Verisi (EXIF) Sanitizasyonu

1. Kullanıcı cihazından olay fotoğrafı seçildiğinde, yükleme öncesi veya presigned URL aşamasında görsel işlenir.
2. EXIF etiketleri arasında bulunan:
   - GPS Latitude / Longitude
   - Cihaz Seri Numarası / Model Bilgisi
   - Çekim Saati ve Kamera Ayarları
   tamamen sıfırlanır (`sharp` / MinIO upload gateway).
3. Nesne depolamaya (`MinIO` / `S3`) yalnızca saf piksel verisi ve rastgele oluşturulmuş UUID anahtarı yazılır.

---

## 5. Yetkilendirme ve Veri İzolasyonu (Gizlilik Kalkanı)

- **Misafir Kullanıcılar (Guest):** Kamuya açık olayları ve haritayı görüntüler. Kendi başına olay açamaz, oy kullanamaz.
- **Vatandaş (Citizen):** Kendi bildirdiği olayları ve gerekçeli durumlarını (`GET /users/me/events`) izleyebilir. Ancak başka kullanıcıların bekleyen veya reddedilen bildirimlerini asla sorgulayamaz (404 döner).
- **Moderatör ve Yetkililer:** Moderasyon kuyruğundaki olayları inceleme yetkisine sahiptir; ancak kullanıcıların kişisel şifre, token veya cihaz kimliklerine erişemezler.
- **Kendi Olayına Oy Verme Yasağı:** Kullanıcıların kendi olaylarını teyit ederek sahte güvenilirlik skoru üretmesi veritabanı kısıtlarıyla engellenmiştir.
