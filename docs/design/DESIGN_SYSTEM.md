# ŞehirNabız — Tasarım Sistemi Rehberi (DESIGN_SYSTEM.md)

Bu doküman, ŞehirNabız mobil uygulamasının (iOS & Android) temel görsel dilini, tasarım token'larını, tipografi kurallarını, bileşen sözleşmelerini ve erişilebilirlik ilkelerini tanımlar.

---

## 1. Ürün Tasarım Vizyonu: Urban Floating UI

**ŞehirNabız — Urban Floating UI**, kentin dinamik ve değişken nabzını kullanıcıya sakin, ferah, harita odaklı ve güven verici bir arayüz ile aktarmak üzere tasarlanmıştır.

### Temel Karakter:
- **Harita Odaklı ve Ferah:** İçerik, haritanın üzerine binen ağır opak paneller yerine havada asılı duran zarif yüzer elemanlar (floating cards, floating action buttons, floating tab bar) ile sunulur.
- **Apple Maps Benzeri Sadeliğe Dayalı:** Kalın neon ışıklardan, yapay gölgelerden ve jenerik AI kontrol panellerinden kaçınılır.
- **Tek Elle Kolay Kullanım:** Kritik aksiyonlar ve alt navigasyon başparmak erişim yayına (thumb-zone) göre hizalanmıştır.
- **Yüksek Kontrast ve Erişilebilirlik:** WCAG AA standartlarına tam uyum sağlayan metin/arka plan kontrastları.

---

## 2. Renk Sistemi ve Semantic Tokenlar

Renk tanımları `@sehir-nabiz/design-tokens` paketinde toplanmıştır. Kod içerisinde rastgele hex kodları yazılmaz, semantic tokenlar kullanılır.

### 2.1 Tema Karşılaştırması

| Token | Light Theme | Dark Theme | Açıklama |
| :--- | :--- | :--- | :--- |
| **`primary`** | `#14B8A6` (Turkuaz) | `#2DD4BF` (Parlak Turkuaz) | Ana marka rengi, birincil butonlar ve aktif pinler |
| **`primaryDark`** | `#0F766E` | `#0F766E` | Koyu vurgular ve başlık kontrastı |
| **`accentBlue`** | `#2563EB` | `#3B82F6` | Bilgilendirme ve ikincil eylemler |
| **`background`** | `#F6F8FB` | `#0B1726` | Sayfa ve harita zemin tonu |
| **`surface`** | `#FFFFFF` | `#152436` | Standart kart ve panel yüzeyi |
| **`surfaceElevated`** | `#FFFFFF` | `#1C3044` | Yüzen kartlar ve arama çubuğu |
| **`text`** | `#0F172A` | `#F8FAFC` | Birincil başlık ve gövde metinleri |
| **`textSecondary`** | `#64748B` | `#A9B8C8` | İkincil açıklamalar ve etiketler |
| **`border`** | `#E2E8F0` | `#304154` | İnce sınır çizgileri |
| **`borderFocus`** | `#14B8A6` | `#2DD4BF` | Odaklanmış giriş alanı sınırı |
| **`success`** | `#16A34A` | `#22C55E` | Çözülmüş veya onaylanmış olaylar |
| **`warning`** | `#F59E0B` | `#FBBF24` | İncelemedeki olaylar ve uyarılar |
| **`error`** | `#DC2626` | `#EF4444` | Kritik kazalar ve hata durumları |

### 2.2 Backend Uyumlu 11 Olay Kategorisi Renkleri
- `TRAFFIC`: `#EF4444`
- `ACCIDENT`: `#DC2626`
- `ROAD_WORK`: `#F59E0B`
- `WATER_OUTAGE`: `#0284C7`
- `POWER_OUTAGE`: `#EAB308`
- `INFRASTRUCTURE`: `#6366F1`
- `PUBLIC_TRANSPORT`: `#0D9488`
- `WEATHER`: `#06B6D4`
- `DISASTER`: `#B91C1C`
- `EVENT`: `#8B5CF6`
- `OTHER`: `#64748B`

---

## 3. Tipografi Sistemi

- **Başlık Fontu:** `Plus Jakarta Sans` (Geometrik, çağdaş ve net harita uyumu)
- **Gövde Fontu:** `Manrope` (Açık harf aralıkları, küçük ekranlarda kusursuz okunabilirlik)
- **Türkçe Karakter Garantisi:** Google Fonts resmi Latin Extended glifleri (ç, ğ, ı, ö, ş, ü, İ).

### Tipografi Ölçeği

| Varyant | Boyut (px) | Satır Yüksekliği (px) | Ağırlık | Harf Aralığı | Kullanım Alanı |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 32 | 40 | 700 (Bold) | -0.5 | Karşılama ve ana sayaçlar |
| **Heading XL** | 24 | 32 | 700 (Bold) | -0.3 | Sayfa ana başlıkları |
| **Heading L** | 20 | 28 | 600 (SemiBold) | -0.2 | Modül ve olay başlıkları |
| **Heading M** | 18 | 24 | 600 (SemiBold) | 0 | Kart içi alt başlıklar |
| **Body L** | 16 | 24 | 400 (Regular) | 0 | Buton metinleri ve vurgulu gövde |
| **Body M** | 14 | 20 | 400 (Regular) | 0 | Standart gövde ve form metinleri |
| **Body S** | 13 | 18 | 400 (Regular) | 0 | Kart içi ikincil açıklamalar |
| **Caption** | 12 | 16 | 400 (Regular) | 0 | Zaman damgaları ve meta veriler |
| **Label** | 11 | 14 | 600 (SemiBold) | +0.5 | Tab bar etiketleri ve rozetler |

---

## 4. Spacing ve Radius Sistemi (4px Grid)

### Spacing (Aralıklar):
`4px` grid sistemi esastır:
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px (Varsayılan ekran kenar payı)
- `xl`: 20px
- `xxl`: 24px
- `3xl`: 32px
- `4xl`: 40px
- `5xl`: 48px

### Radius (Köşe Yuvarlama):
Rastgele radius kullanımı yasaktır:
- `Small (8px)`: Rozetler ve küçük butonlar
- `Medium (12px)`: Form giriş alanları (Input, TextArea) ve avatar
- `Large (16px)`: Butonlar ve arama çubuğu
- `Card (20px)`: Standart ve yüzer kartlar
- `Sheet (24px)`: Bottom Sheet üst köşeleri ve Floating Tab Bar
- `Pill (999px)`: Çipler (Chips), Floating Action Button (FAB) ve dairesel ikon butonları

---

## 5. Gölge ve Yükseklik (Shadows & Elevation)

| Seviye | iOS Shadow | Android Elevation | Kullanım Alanı |
| :--- | :--- | :--- | :--- |
| **Elevation 0** | Yok | 0 | Düz zemin bileşenleri |
| **Elevation 1** | Y: 2, Opacity: 0.06, Radius: 6 | 2 | Standart kartlar, filtre çipleri |
| **Elevation 2** | Y: 4, Opacity: 0.08, Radius: 12 | 4 | Açılır menüler, bildirim kartları |
| **Floating** | Y: 8, Opacity: 0.12, Radius: 20 | 8 | Harita aksiyon butonları, Floating Tab Bar, Bottom Sheet |

---

## 6. Temel UI Bileşen Kütüphanesi

Tüm bileşenler `apps/mobile/src/components/ui/` altında yer alır:

1. **`AppText`:** 9 varyantlı tipografi bileşeni, sistem font ölçeklendirme korumalı (`allowFontScaling`).
2. **`AppButton`:** 52px yükseklik, 16px radius, turkuaz primary zemin, 0.98 kontrollü basılma animasyonu. Varyantlar: `primary`, `secondary`, `outline`, `ghost`, `destructive`.
3. **`IconButton` & `FloatingIconButton`:** Minimum 44x44 dokunma hedefi; floating sürümü 48x48 dairesel yüzer buton.
4. **`SearchBar`:** Yüzer arama çubuğu, tek dokunuşla temizleme ve klavye etkileşimi.
5. **`FilterChip` & `CategoryChip`:** Yatay kaydırılabilir, kategori rengi ve aktif sayaç rozeti içeren hap (pill) butonlar.
6. **`AppCard` & `FloatingCard`:** 20px radius ve yumuşak derinlikli içerik taşıyıcıları.
7. **`AppInput` & `AppTextArea`:** Odaklandığında turkuaz border, hata durumunda kırmızı uyarı ve karakter sayacı.
8. **`AppBadge` & `StatusBadge`:** Olay durumunu (Aktif, İncelemede, Çözüldü, Reddedildi) gösteren semantik rozetler.
9. **`AppAvatar`:** İsim baş harfi veya fotoğraf gösterimi, doğrulanmış kullanıcı onay rozeti.
10. **`AppSkeleton`:** Yumuşak parıltı (pulse) animasyonlu yükleme iskeleti.
11. **`EmptyState`, `ErrorState`, `LoadingState`:** Standart hata ve boş durum ekranları.
12. **`FloatingTabBar`:** 5 sekmeli (Harita, Akış, Bildir, Bildirimler, Profil), 24px radius'lu yüzer alt navigasyon.
13. **`BottomSheet`:** PanResponder ile doğal dokunmatik sürükleme, esneme ve kapatma özellikli mobil alt paneli.
14. **`MapScreenLayout`:** Harita canvas'ı, üst arama çubuğu, yatay filtreler, sağ aksiyon butonları ve alt navigasyonu koordine eden mimari yerleşim.

---

## 7. Animasyon Prensipleri

1. **Kısa ve Amaçlı:** Dokunma geri bildirimleri 150-250ms arasında tamamlanır.
2. **Ölçülü Yaylanma (Spring):** Buton basılma oranı 0.98'dir; abartılı bounciness kullanılmaz (`bounciness: 3-4`).
3. **Erişilebilirlik (Reduce Motion):** Kullanıcının sistem animasyon azaltma tercihlerine saygı gösterilir.

---

## 8. Canlı İnceleme: UI Showcase

Geliştiriciler ve tasarımcılar tüm bileşenleri yerel geliştirme modunda `app/showcase.tsx` ekranında inceleyebilir. Bu ekrana Harita ekranındaki ışıltı ikonundan veya Profil sayfasındaki bağlantıdan erişilir; üretim (`__DEV__ = false`) derlemelerinde güvenlik kalkanı ile otomatik engellenir.

---

## 9. Harita Görsel Dili ve Vektör Katman Entegrasyonu (Phase 6)

Phase 6 ile birlikte harita tuvali (`PulseMapView`), Urban Floating UI tasarım diliyle entegre edilmiştir:

1. **Katman Seçici (`MapLayerSheet`):**
   - Standart (Liberty - Açık Kentsel), Gece (Dark - Olay Kontrastlı Gece Teması) ve Uydu (Satellite - Hibrit Ortofoto) seçenekleri.
   - Seçili stil kartında turkuaz çerçeve, aktif rozet ve anında geçiş.

2. **Dinamik Kümeleme Görsel Hiyerarşisi:**
   - **Küçük Kümeler (<10 olay):** 18px yarıçap, `%92` opaklıkta `#0D9488` (Turkuaz-Mavi) zemin ve 2px beyaz dış halka.
   - **Orta Kümeler (10-50 olay):** 24px yarıçap, `%92` opaklıkta `#F59E0B` (Amber) zemin ve 2px beyaz dış halka.
   - **Büyük Kümeler (>50 olay):** 30px yarıçap, `%92` opaklıkta `#EF4444` (Kırmızı/Tehlike) zemin ve 3px beyaz dış halka.
   - **Küme Sayısı Etiketi:** 13-14px Plus Jakarta Sans Bold, beyaz metin.

3. **Tekil Olay İşaretçileri (Event Pins):**
   - 8px yarıçapında kategori renkli daire (`categoryColor`).
   - 2.5px beyaz dış sınır (`#FFFFFF`) ile harita arka planından ayrışma.
   - Seçili olayda 14px yarıçaplı turkuaz seçim halkası (`#0D9488`).

4. **Kullanıcı Konumu Göstergesi:**
   - Native GPS mavi nokta ve doğrultu oku (`showsUserHeadingIndicator`).
   - Doğruluk dairesi ile hassasiyet görselleştirmesi.

---

## 10. Olay Bildirme ve Medya Arayüzü (Phase 7)

Phase 7 ile birlikte kullanıcının kentsel aksaklıkları bildirmesini sağlayan profesyonel çok adımlı akış entegre edilmiştir:

1. **Çok Adımlı İlerleme Göstergesi (Stepper):**
   - 3 adımlı gösterge: `1: Olay Bilgileri`, `2: Konum ve Fotoğraflar`, `3: Önizleme ve Gönderim`.
   - Tamamlanan adımlar turkuaz dolu daire ve onay ikonu, aktif adım turkuaz çerçeveli numara, bekleyen adımlar soluk gri numara ile gösterilir. Adımlar arası bağlantı çizgileri durumu dinamik olarak yansıtır.

2. **Kategori Seçim Kartları:**
   - 11 kategori 2 sütunlu ızgara kartları halinde sunulur.
   - Her kartta sol tarafta kategori renk rozeti, kategori adı ve Türkçe açıklayıcı alt etiket yer alır. Seçili kart 2px turkuaz çerçeve ve hafif renklendirilmiş zemin kazanır.

3. **Önem Derecesi Seçici:**
   - Düşük (Mavi), Orta (Sarı), Yüksek (Turuncu), Kritik (Kırmızı) renk kodlarıyla hap (pill) şeklinde tasarlanmıştır.

4. **Harita Konum Seçici (`LocationPickerModal`):**
   - Tam ekran MapLibre tuvali üzerinde merkezde sabit konum iğnesi (pin) ve artı işareti.
   - Harita sürüklendikçe anlık koordinat göstergesi güncellenir.
   - "Konumumu Kullan" butonu ile GPS izni talep edilerek kullanıcının gerçek koordinatlarına anında uçuş (`flyTo`) sağlanır.
   - Seçimi tamamla butonu ile koordinatlar 5 basamaklı hassasiyetle forma aktarılır.

5. **Fotoğraf Seçim ve Önizleme Kartları (`PhotoPickerSection`):**
   - Galeriden seçme ve Kamerayla çekme için 48px yükseklikte yan yana eylem butonları.
   - Seçilen fotoğraflar (en fazla 3 adet, maksimum 8MB) 80x80px yuvarlatılmış (12px radius) kartlar halinde yatay listede dizilir.
   - Her fotoğraf kartı üzerinde sağ üstte silme ikonu, sol altta dosya boyutu etiketi yer alır.
   - Yükleme esnasında yükleme animasyonu (spinner), hata durumunda kırmızı uyarı ve "Tekrar Dene" butonu bulunur.

6. **Mükerrer Bildirim Uyarı Modalı (`DuplicateWarningModal`):**
   - 150m yarıçapta 45 dakika içinde benzer olay sezildiğinde beliren uyarı kartı.
   - Kullanıcıya mevcut olayı inceleme veya kendi bildirimini sürdürme şansı sunar.

7. **Kimlik Doğrulama Modalı (`AuthModal`):**
   - Misafir kullanıcının gönderim anında oturum açabilmesi için Giriş / Kayıt Ol sekmeli yüzer modal.
   - Zod doğrulamalı e-posta ve şifre giriş alanları, hata mesajları ve güvenli token saklama (`expo-secure-store`).

---

## 11. Topluluk Teyit Sistemi ve Moderasyon Arayüzü (Phase 8)

Phase 8 ile birlikte kullanıcının olayları teyit etmesini, itiraz bildirmesini ve moderatörlerin güvenle karar vermesini sağlayan Urban Floating UI bileşenleri eklenmiştir:

1. **Topluluk Geri Bildirim Butonları (Feedback Action Buttons):**
   - **`CONFIRM` ("Ben de Gördüm"):** Başarı yeşili (`#10B981` / `theme.success`), Lucide `CheckCircle2` ikonu. Kullanıcının aktif oyu olduğunda dolu zemin veya belirgin çerçeve ile vurgulanır.
   - **`DISPUTE` ("Yanlış Bilgi Bildir"):** Uyarı kırmızısı (`#EF4444` / `theme.error`), Lucide `AlertTriangle` ikonu. Yanıltıcı veya sahte ihbarları işaretlemek için kullanılır.
   - **`RESOLVED_REPORT` ("Çözüldü Bildir"):** Şehir turkuazı (`#0D9488` / `theme.primary`), Lucide `HelpCircle` ikonu. Sahadaki sorunun giderildiğini belirten topluluk sinyali.
   - **Geri Çekme Mekanizması:** Kullanıcı önceden verdiği oyu dilediğinde "Geri Çek" butonu ile iptal edebilir veya farklı bir oyla değiştirebilir.

2. **Açıklanabilir Topluluk Güvenilirlik Kartı (`CommunityAssessmentCard`):**
   - **Sahte Kesinlik Yasağı:** "Bu olay %95 doğrudur" gibi yanıltıcı yüzdeler yerine nesnel sayısal döküm: "12 kişi gördü", "3 kişi itiraz etti", "2 kişi çözüldü bildirdi".
   - **Örneklem Eşiği ($N \ge 3$):** Toplam geri bildirim 3'ün altında olduğunda "Henüz yeterli topluluk geri bildirimi bulunmuyor" bilgilendirmesi gösterilir.
   - **Resmî Doğrulama Feragatnamesi (Disclaimer):** Kartın altında "Topluluk bildirimleri resmî belediye doğrulaması niteliği taşımaz" uyarısı yer alır.

3. **Olay Detay Ekranı (`/events/[id]`):**
   - `AppHeader` (Geri dönüş butonu ve paylaşma ikonu).
   - Kategori rozeti, durum ve önem seviyesi hapları (pills).
   - Başlık, açıklama metni ve olay bildirim zamanı (Türkçe tarih formatı).
   - Mini `PulseMapView` harita önizlemesi ve koordinat bilgisi.
   - Fotoğraf galerisi yatay kaydırma listesi (varsa).
   - Açıklanabilir topluluk değerlendirme kartı ve etkileşimli geri bildirim aksiyonları.
   - Olay sahibinin kendi olayına oy vermesini engelleyen koruma bildirimi.

4. **Moderatör Paneli ve Karar Arayüzü (`/moderation`):**
   - **Yetki Kalkanı (Unauthorized Shield):** `MODERATOR` veya `ADMIN` rolü olmayan kullanıcılara kırmızı kilit simgesi, açıklama ve "Ana Sayfaya Dön" butonu sunulur.
   - **Filtre Sekmeleri:** `Bekleyenler` (`PENDING_REVIEW`), `İhtilaflılar` (`DISPUTED`), `Yayındakiler` (`ACTIVE`).
   - **Olay Kartı Dökümü:** Kategori, başlık, bildiren kullanıcı bilgisi, teyit/itiraz sayıları ve harita koordinatları.
   - **Karar Aksiyonları ve Onay Diyaloğu:** "Yayınla / Onayla" (Yeşil buton), "Reddet" (Kırmızı buton), "İhtilaflı Yap" (Turuncu buton). Kritik kararlarda gerekçe notu girişi desteklenir.

---

## 12. Gerçek Zamanlı Durum ve Bildirim Merkezi Arayüzü (Phase 9)

Phase 9 ile kentsel olayların dinamik takibini sağlayan gerçek zamanlı göstergeler ve Urban Floating UI bildirim merkezi tasarlanmıştır:

1. **Minimalist Bağlantı Durum Hapı (`ConnectionStatusBadge`):**
   - **Yerleşim:** Haritanın sol üst köşesinde, arama çubuğunun altında bağımsız yüzen kapsül (floating pill).
   - **Durum Kodlaması:**
     - `Canlı`: Başarı yeşili (`theme.success`), yeşil parlama halkası ve nokta animasyonu.
     - `Güncelleniyor`: Canlı yeşil, minik aktivite indikatörü (spinner).
     - `Bağlanıyor`: Şehir mavisi (`theme.accentBlue`), sarı/mavi indikatör.
     - `Çevrimdışı`: Kırmızı/gri uyarı tonu (`theme.error`), uyarı ikonu ve dokunulduğunda yeniden bağlantıyı tetikleme eylemi (`socketService.reconnect()`).
   - **Pürüzsüzlük:** Haritanın kamera açısını veya etkileşimini engellemeyecek kompakt boyut (32px yükseklik, 16px yuvarlatılmış köşe).

2. **Bildirim Merkezi (`NotificationsScreen` - `/notifications`):**
   - **Başlık ve Hızlı Aksiyon:** Sayfa başlığında okunmamış bildirim sayısı rozeti ve sağ üstte "Tümünü Oku" bağlantısı.
   - **Filtre Sekmeleri (Tab Bar):** `Tümü` ve `Okunmamış` sekmeleri. Aktif sekme `theme.primary` çizgi ve yazı rengi ile belirginleştirilir.
   - **Kronolojik Zaman Gruplaması:** Bildirimler "Bugün", "Dün" ve "Daha Önce" başlıkları altında organize edilir.
   - **Bildirim Kartı Anatomisi:**
     - Sol İkon Kapsülü: Bildirim türüne göre semantic renk arka planı ve Lucide ikonu (`AlertTriangle`, `CheckCircle2`, `HelpCircle`, `Info`, `ShieldCheck`).
     - İçerik Gövdesi: Bildirim başlığı (`fontWeight: 600`), açıklama metni ve göreceli zaman bilgisi ("5 dk önce", "2 sa önce").
     - Okunmamışlık Göstergesi: Okunmamış kartların sağında 8px çapında birincil turkuaz mavi nokta (`theme.primary`).
     - Tıklama & Navigasyon: Karta dokunulduğunda bildirim arka planda okundu işaretlenir ve ilişkili olayın detayına (`/events/:id`) yumuşak geçiş yapılır.
   - **Durum Deneyimleri (State Handling):**
     - Misafir Kullanıcı: `EmptyState` içerisinde "Giriş Yap / Kayıt Ol" butonu ile doğrudan `AuthModal` tetiklenir.
     - Boş Liste: Zili temsil eden sakin illüstratif ikon ve "Henüz bir bildiriminiz bulunmuyor" bilgilendirmesi.
     - Hata Durumu: `ErrorState` kartı ve "Tekrar Dene" butonu.
     - Yenileme: `RefreshControl` ile aşağı çekerek yenileme (pull-to-refresh).

3. **Moderatör Canlı Kuyruk Entegrasyonu:**
   - Moderatör ekranı açıkken `MODERATION_EVENT_ADDED` veya `EVENT_STATUS_CHANGED` soket olayı geldiğinde liste titreme olmadan, otomatik arka plan sorgusuyla güncellenir.

---

## 13. Şehir Analitiği, Isı Haritası ve Kullanıcı Portali Arayüzü (Phase 10)

### 13.1 Şehir İstatistikleri Ekranı (`/stats`)
- **Şehir ve Dönem Seçimi:** Yatay kaydırılabilir şehir çipleri (`Tümü`, `Kayseri`, `İstanbul`, `Ankara`) ve zaman aralığı kapsülleri (`24s`, `7 Gün`, `30 Gün`, `Tümü`).
- **Özet Metrik Kartları:** 4'lü 2x2 grid yapısı:
  - Toplam Bildirim (Birincil renk ikonu ve sayısı)
  - Çözülen Olaylar (Başarı yeşili `theme.success` ikonu)
  - Aktif Olaylar (Uyarı sarısı `theme.warning` ikonu)
  - Çözüm Oranı (`%XX` göstergesi ve bilgi ikonu)
- **Haftalık/Günlük Zaman Grafiği (Responsive Bar Chart):**
  - Saf React Native bileşenleriyle harici hantal kütüphane eklemeden oluşturulan temiz dikey çubuk grafiği.
  - Maksimum değere göre normalize edilmiş çubuk yükseklikleri (azami 120px).
  - Tarih etiketleri ve dokunulabilir yükseklik geri bildirimi.
- **Kategori Dağılımı Çubukları:** Kategoriye özel renkler, yüzdelik oran ve yatay ilerleme çubukları (`ProgressBar`).
- **İlçe Karşılaştırma Listesi:** Yoğunluğa göre sıralı ilçe bildirim sayıları ve yüzde barları.
- **Yasal ve Bilgilendirici Feragatname:** Ekranın en altında göze çarpmayan ama okunabilir bilgilendirme kutusu:
  > *"İstatistikler ŞehirNabız üzerinde yayınlanan kullanıcı bildirimlerine dayanmaktadır; tüm gerçek olayların eksiksiz kaydını temsil etmez."*

### 13.2 Isı Haritası (Heatmap) Katmanı ve Arayüz Kontrolü
- **Harita Düğmesi:** Haritanın sağ üst araç çubuğunda yüzen `Flame` ikonu (`FloatingIconButton`).
- **Aktif/Pasif Gösterimi:** Açıkken birincil renkte parlayan arka plan, kapalıyken nötr yüzen kart stili.
- **Renk Skalası (Color Ramp):** MapLibre katmanı üzerinde tema dostu pürüzsüz geçiş:
  - Düşük yoğunluk: `#2DD4BF` (Turkuaz)
  - Orta yoğunluk: `#FBBF24` (Sarı)
  - Yüksek yoğunluk: `#F97316` (Turuncu)
  - Yoğun merkez: `#EF4444` (Kırmızı)
- **Opaklık Kuralı:** Harita sokak adlarının ve bina etiketlerinin kapanmaması için `heatmap-opacity` azami 0.65 seviyesinde tutulur.
- **Alt Bilgi Kapsülü:** Isı haritası aktifken haritanın alt kısmında beliren "Yoğunluk Haritası Aktif • Yalnızca kullanıcı bildirimlerini yansıtır" hapı.

### 13.3 Kullanıcı Profili ve İtibar Göstergesi (`/profile`)
- **Katkı Sayaçları:** Gerçek backend verileriyle beslenen 3 sütunlu metrik kartı (Bildirdiğim, Teyit Ettiğim, Çözülen).
- **İtibar Seviyesi Barı:** Kullanıcının mevcut puanına göre dinamik seviye belirleme (`Yeni Katılımcı` -> `Şehir Muhafızı`) ve ilerleme yüzdesi.
- **Açıklanabilir İtibar Paneli:** İtibar puanına dokunulduğunda açılan ve puanlama mantığını ("Onaylanan bildirim +10 puan, yanlış bildirim -5 puan" vb.) açıklayan bilgilendirme kutusu.
- **Aksiyon Menüleri:** "Bildirimlerim", "Uygulama Ayarları", "Moderatör Paneli" (yalnızca yetkili kullanıcılarda) ve "Çıkış Yap".

### 13.4 "Bildirimlerim" Ekranı (`/profile/my-events`)
- **Durum Filtre Çipleri:** `Tümü`, `Yayında`, `İnceleniyor`, `Çözüldü`, `Reddedildi`.
- **Kişisel Olay Kartları:** Başlık, kategori rozeti, tarih, onay/itiraz sayıları.
- **Reddedilen Olay Gerekçesi Kalkanı:** Moderatörce reddedilmiş olaylarda kırmızı çerçeveli güvenlik kartı içinde "Moderatör Gerekçesi" gösterilir; kullanıcıya hatasını düzeltip yeni bildirim açması için yol gösterir.

### 13.5 Ayarlar Ekranı (`/profile/settings`)
- **Görünüm Grubu:** `Açık`, `Koyu`, `Sistem` tema seçici butonları (`themePreference`).
- **Bildirim Tercihleri:** Gerçek sunucu API'sine bağlı Switch kontrolleri (Takip Ettiğim Olaylar, Teyit Verdiğim Olaylar, Bildirdiğim Olaylar, Yakınımdaki Gelişmeler, Push Bildirimleri).
- **Gizlilik ve Güvenlik:** Konum bulanıklaştırma politikası (150m kalkanı) ve fotoğraf meta veri temizliği (EXIF strip) bilgilendirme kartı.
- **Hakkında:** ŞehirNabız sürümü (`v1.0.0-mvp`), lisans ve açık kaynak teşekkürleri.




