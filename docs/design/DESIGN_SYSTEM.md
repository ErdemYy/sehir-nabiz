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


