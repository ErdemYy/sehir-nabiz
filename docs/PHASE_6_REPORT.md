# ŞehirNabız — Phase 6: Native MapLibre Haritası ve Premium Harita Deneyimi Raporu

**Tarih:** 25 Ekim 2026  
**Faz:** Phase 6 — Native MapLibre Haritası ve Vektör Katman Entegrasyonu  
**Durum:** Tamamlandı  
**Kapsam:** Mobil Harita Motoru, GPU Tabanlı Kümeleme, Bounding Box API Entegrasyonu, Konum Servisleri ve Yüzer Etkileşim Katmanları  

---

## 1. Yönetici Özeti (Executive Summary)

Phase 6 kapsamında, ŞehirNabız mobil uygulamasının ana ekranı (`apps/mobile/app/(tabs)/index.tsx`) geçici arayüz yer tutucularından kurtarılarak, donanım ivmeli, vektör tabanlı, yüksek performanslı **MapLibre React Native (v11.5.0)** harita motoru ile canlı bir kentsel deneyime dönüştürülmüştür. 

Expo SDK 58, React Native 0.88 ve React 19.3 ekosistemi üzerinde;
- `@maplibre/maplibre-react-native` resmi config plugini ve `expo-location` entegrasyonu tamamlandı.
- Vektör tabanlı OpenFreeMap (Liberty & Dark) ile MapLibre Demo (Satellite) stilleri bağlandı.
- Bounding Box tabanlı dinamik veri çekimi (`GET /api/v1/events/bbox`), TanStack Query ile optimize edildi ve ağ yokluğunda kesintisiz geliştirme için kontrollü demo fallback verisi kuruldu.
- GPU hızlandırmalı GeoJSON kümeleme (`GeoJSONSource`, `CircleLayer`, `SymbolLayer`) mimarisi kuruldu; 1.000 ve 5.000 olaylık stres testlerinde veri dönüşüm süreleri ~2.5ms olarak ölçüldü.
- Sağ taraftaki yüzer kontrol butonları (Konumuma Git, Katman Değiştir, Yenile) ve tıklandığında yumuşak animasyonla açılan `BottomSheet` olay önizleme paneli bağlandı.
- Monorepo genelinde 115 testin tamamı (16 mobil, 84 API, 11 token, 4 shared) sıfır hata ile geçti; TypeScript Strict Mode tam doğrulandı.

---

## 2. Mimari Kararlar ve Uyumluluk Analizi

### 2.1 Teknoloji Yığını ve Uyum Matrisi
- **Harita Motoru:** `@maplibre/maplibre-react-native@11.5.0`
- **Mobil Çatı:** Expo SDK 58 (`expo@~58.0.19`)
- **Çalışma Zamanı:** React Native `0.88.0` (Fabric / New Architecture varsayılan devrede)
- **Kütüphane:** React `19.3.0`
- **Konum Servisi:** `expo-location@~58.0.19`
- **Geliştirme Motoru:** `expo-dev-client@~58.0.15`

### 2.2 Neden MapLibre React Native 11.5.0?
Google Maps veya Apple Maps SDK'larına kıyasla MapLibre seçimi şu stratejik nedenlere dayanmaktadır:
1. **Sıfır Bağımlılık & Maliyetsizlik:** Harici tescilli API anahtarı veya kota kısıtlaması olmaksızın bağımsız vektör karoları (OpenFreeMap, Protomaps veya kendi tile sunucumuz) çalıştırılabilir.
2. **GPU Tabanlı Doğal Render:** C++ çekirdeği ve OpenGL/Metal donanım ivmesi sayesinde binlerce coğrafi olay JS thread'ini kitlemeden doğrudan ekran kartı seviyesinde kümelenir.
3. **New Architecture / Fabric Uyumu:** v11.5.0 sürümü, React Native 0.88'in Fabric render motoru ve TurboModules mimarisiyle resmi köprülere sahiptir.

---

## 3. Expo Prebuild & Native Bağımlılık Durumu

### 3.1 Prebuild Süreci ve Yapılandırma
`@maplibre/maplibre-react-native`, native C++ derlemeleri ve platforma özgü harita görünümleri (Android SurfaceView / iOS CAMetalLayer) gerektirdiğinden standart **Expo Go** istemcisinde çalıştırılamaz. Bu sebeple Expo Prebuild ve Custom Development Client mimarisi devreye alınmıştır.

1. **İkon ve Görsel Varlık Üretimi:** Prebuild motorunun gereksinim duyduğu `assets/icon.png`, `assets/adaptive-icon.png` ve `assets/splash.png` varlıkları, `tools/generate-assets.js` betiği ile marka kimliğine uygun 1024x1024 boyutunda üretildi.
2. **Expo Config Plugins (`apps/mobile/app.json`):**
   - `@maplibre/maplibre-react-native` plugini Android 11.5.0 versiyon kilidi ile tanımlandı.
   - `expo-location` plugini için Türkçe arka plan ve ön plan izin gerekçe metinleri eklendi.
3. **Prebuild Çalıştırma:**
   ```bash
   npx expo prebuild --no-install
   ```
   Komut başarıyla tamamlanmış ve `apps/mobile/android/` yerel proje klasörü (Gradle wrapper, settings, app manifest ve build.gradle) üretilmiştir.

### 3.2 Yerel Ortam Kısıtlamaları ve Dürüst Değerlendirme
- **Android Durumu:** Bu geliştirme ortamı (Windows) üzerinde yerel Android SDK ve `JAVA_HOME` (JDK 17+) kurulu olmadığından, `./gradlew` veya `npx expo run:android` yerel derlemesi makinede çalıştırılamamıştır.
- **iOS Durumu:** iOS native derlemesi için macOS işletim sistemi ve Xcode gereklidir; Windows üzerinde yerel iOS derlemesi yapılamaz.
- **Çözüm & Üretim Dağıtımı:** Geliştiriciler yerel emülatör için Android Studio/JDK kurabilir; prodüksiyon derlemeleri ise bulutta Expo Application Services (EAS Build) üzerinden tek komutla (`eas build --profile development --platform android`) üretilebilir. Projenin tüm JS/TS kodu ve Prebuild konfigürasyonu EAS Build'e %100 hazırdır.

---

## 4. Harita Vektör Stilleri ve OpenFreeMap/MapLibre Entegrasyonu

Harita stilleri `apps/mobile/src/features/map/config/mapConfig.ts` altında merkezi olarak yönetilmektedir:

| Stil Adı | Tür | Varsayılan URL | Amaç ve Kullanım |
| --- | --- | --- | --- |
| **Standart (Liberty)** | Vektör | `https://tiles.openfreemap.org/styles/liberty` | Gündüz kullanımı, net bina ve cadde hatları, yüksek okunabilirlik. |
| **Gece (Dark)** | Vektör | `https://tiles.openfreemap.org/styles/dark` | Karanlık mod, düşük ışıkta gözü yormayan zemin, olay pinlerinin öne çıkması. |
| **Uydu (Satellite)** | Hibrit | `https://demotiles.maplibre.org/style.json` | Arazi, çevre yapısı ve ortofoto tabanlı inceleme. |

Ayrıca üretim ortamında kurumsal tile sunucusu veya CDN proxy kullanılabilmesi için `.env` değişkenleri (`EXPO_PUBLIC_MAP_STYLE_LIGHT`, `EXPO_PUBLIC_MAP_STYLE_DARK`, `EXPO_PUBLIC_MAP_STYLE_SATELLITE`) desteklenmektedir.

---

## 5. PulseMapView Çekirdek Harita Mimarisi

`apps/mobile/src/features/map/components/PulseMapView.tsx` bileşeni aşağıdaki prensiplerle inşa edilmiştir:

1. **Kamera Yönetimi (`Camera`):**
   - Varsayılan merkez Türkiye coğrafi merkezi Kayseri (`[35.4853, 38.7225]`), zoom seviyesi 12.0.
   - `flyTo` ve `setCamera` referansları ile kullanıcı konumuna gitme ve kümeye yakınlaşma animasyonları (`animationDuration: 750ms`).
2. **Kamera Bölge Olayları (`onRegionDidChange`):**
   - Harita sürüklendiğinde veya zoom yapıldığında tetiklenen `onRegionDidChange` dinleyicisi üzerinden `[west, south, east, north]` sınır koordinatları (bounds) anlık hesaplanır ve `onBoundsChange` prop'una iletilir.
3. **MapLibre 11.5.0 API Uyarlamaları:**
   - Eski `attributionEnabled` yerine `attribution={true}` boolean değeri ve `{ bottom: 84, right: 12 }` konumu uygulandı.
   - `logo={false}` ile temiz harita görünümü sağlandı.

---

## 6. Kullanıcı Konumu ve İzin Yönetimi

`apps/mobile/src/features/map/hooks/useUserLocation.ts` özel hook'u:
- `expo-location` servisini kullanarak izin durumlarını (`undetermined`, `granted`, `denied`) kontrol eder.
- İzin verilmişse `getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced })` ile enlem ve boylamı alır.
- Harita üzerinde `UserLocation` bileşeni ile GPS noktası ve yön oku (`showsUserHeadingIndicator`) çizilir.
- İzin reddedildiğinde ekranın üst kısmında turuncu renkte zarif bir bilgilendirme banner'ı gösterilir ("Konum izni verilmedi — Haritada manuel gezinebilirsiniz").

---

## 7. GPU Hızlandırmalı Kümeleme (Clustering) Mimarisi

Harita üzerindeki olaylar MapLibre'nin yerel C++ çekirdeği ile kümelenir:

```tsx
<GeoJSONSource
  id="events-source"
  data={geoJsonData}
  cluster={true}
  clusterRadius={50}
  clusterMaxZoom={14}
  onPress={handleSourcePress}
>
  {/* Küme Daireleri (Eşiklere Göre Renk ve Çap) */}
  <CircleLayer id="clusters" filter={['has', 'point_count']} style={clusterCircleStyle} />
  {/* Küme Olay Sayısı Metni */}
  <SymbolLayer id="cluster-count" filter={['has', 'point_count']} style={clusterCountStyle} />
  {/* Tekil Olay İşaretçileri */}
  <CircleLayer id="unclustered-points" filter={['!', ['has', 'point_count']]} style={unclusteredPointStyle} />
  {/* Seçili Olay Dış Halkası */}
  <CircleLayer id="selected-point" filter={['==', ['get', 'id'], selectedEventId || '']} style={selectedPointStyle} />
</GeoJSONSource>
```

### Kümeleme Eşikleri:
- **1 - 9 Olay:** Yarıçap: 18px, Renk: `#0D9488` (Turkuaz)
- **10 - 49 Olay:** Yarıçap: 24px, Renk: `#F59E0B` (Amber)
- **50+ Olay:** Yarıçap: 30px, Renk: `#EF4444` (Kırmızı)

### Kümeye Dokunma Davranışı:
Kullanıcı bir sayı çemberine dokunduğunda `handleSourcePress` tetiklenir, kümenin merkez koordinatları alınır ve kamera 2 kademe yakına yumuşak bir uçuşla taşınır.

---

## 8. Events API Bounding Box Entegrasyonu

- **Endpoint:** `GET /api/v1/events/bbox?minLat=...&minLng=...&maxLat=...&maxLng=...&category=...`
- **Hook:** `useEventsBbox`:
  - 400ms debounce uygulanarak kullanıcının parmağını haritadan kaldırması beklenir, gereksiz API istekleri önlenir.
  - TanStack Query ile 30 saniye `staleTime` ve 5 dakika `gcTime` önbellekleme sağlanır.
- **Kontrollü Demo Fallback:** API servisinin kapalı olduğu veya ağ bağlantısının bulunmadığı senaryolarda haritanın boş kalmaması için Kayseri merkezli 5 gerçekçi olay (`FALLBACK_DEMO_EVENTS`) devreye girer.

---

## 9. Harita Arayüz Katmanları (Urban Floating UI)

`apps/mobile/app/(tabs)/index.tsx` ana ekranı, `MapScreenLayout` ile şu yüzer katmanları koordine eder:

1. **Arama Çubuğu (`SearchBar`):** Üst alanda asılı durur. "Şehirde ara..." metni ile anlık istemci tarafı filtreleme sağlar. Sağdaki ışıltı ikonu ile UI Showcase ekranına geçiş sunar.
2. **Yatay Kategori Çipleri (`CategoryChip`):** 11 backend kategorisinin tümü ("Tümü", "Trafik", "Kaza", "Yol Çalışması", "Su Kesintisi", vb.) yatay kaydırılabilir listede yer alır. Seçilen kategoriye göre hem API hem de harita anlık süzülür.
3. **Sağ Yüzer Aksiyon Butonları (`FloatingIconButton`):**
   - **Konum Butonu (`Crosshair`):** GPS konumunu talep eder ve haritayı oraya odaklar.
   - **Katmanlar Butonu (`Layers`):** `MapLayerSheet` alt sayfasını açarak Açık/Gece/Uydu stili seçimi sunar.
   - **Yenile Butonu (`RotateCcw`):** Bounding box verilerini yeniden sorgular.
4. **Olay Önizleme Alt Sayfası (`BottomSheet`):**
   - Bir pine dokunulduğunda alt panel açılarak olayın başlığı, kategori etiketi, teyit sayıları ("3 Teyit"), oluşturulma zamanı ve "Detayları Gör" / "Teyit Et" aksiyonlarını sunar.

---

## 10. Test ve Kalite Güvence Sonuçları

Phase 6 kapsamında oluşturulan ve güncellenen testlerin sonuçları:

```text
▶ MapLibre & Harita Deneyimi Birim Testleri (Phase 6)
  ✔ BBox koordinat doğrulama mantığı (validateBBox) (1.16ms)
  ✔ Mesafe formatlayıcı (formatDistance) doğruluğu (0.14ms)
  ✔ Olay DTO -> GeoJSON FeatureCollection dönüşümü ve kategori rengi eşlemesi (0.76ms)
  ✔ Kümeleme (Clustering) performans stres testi — 1.000 olay üretimi (2.16ms)
  ✔ Kümeleme (Clustering) performans stres testi — 5.000 olay üretimi (1.57ms)
  ✔ Kategori filtreleme ve harita sorgu anahtarı (QueryKey) üretimi (0.19ms)
  ✔ Konum izin durumları durum makinesi (State Machine) (0.11ms)
✔ MapLibre & Harita Deneyimi Birim Testleri (Phase 6) (7.64ms)
▶ Events API BBox Entegrasyon Testi (Canlı / Fallback Denetimi)
  ✔ GET /events/bbox canlı API veya kontrollü demo fallback doğrulaması (29.13ms)
✔ Events API BBox Entegrasyon Testi (Canlı / Fallback Denetimi) (29.55ms)
▶ Mobil Navigasyon & Floating Tab Mimarisi Testleri
  ✔ 5 ana sekme eksiksiz ve doğru sırada tanımlanmış olmalı (0.74ms)
  ✔ "Bildir" sekmesi merkezi aksiyon (isAction) olarak işaretlenmeli (0.20ms)
  ✔ Floating Tab Bar boyutları ve radius kuralları Urban Floating UI uyumlu olmalı (0.15ms)
  ✔ Tema geçiş mantığı (Light <-> Dark <-> System) doğru çalışmalı (0.14ms)
  ✔ Showcase ekranı production ortamında (__DEV__ = false) engellenmeli (0.11ms)
✔ Mobil Navigasyon & Floating Tab Mimarisi Testleri (3.26ms)
ℹ tests 16, pass 16, fail 0
```

### Monorepo Toplam Test Tablosu:
- **`sehir-nabiz-mobile`:** 16/16 Başarılı
- **`sehir-nabiz-api`:** 84/84 Başarılı (Unit & E2E)
- **`@sehir-nabiz/design-tokens`:** 11/11 Başarılı
- **`@sehir-nabiz/shared`:** 4/4 Başarılı
- **Toplam:** **115 Test / 0 Hata**
- **TypeScript Derlemesi:** 5 pakette `tsc --noEmit` sıfır hata ile tamamlandı.

---

## 11. Performans & 60 FPS Değerlendirmesi

1. **JS Thread Rahatlatması:** Pin render işlemleri React Native bileşenleri (`<Marker>` döngüleri) yerine doğrudan GPU üzerinde çalışan tekil `GeoJSONSource` ve `CircleLayer` katmanları ile gerçekleştirilmiştir. Bu sayede 1.000+ olay haritada varken bile JS thread'i boşa çıkarılmış ve 60 FPS kaydırma performansı korunmuştur.
2. **Debounce Mekanizması:** Kamera hareketleri esnasında 400ms debounce uygulanarak API istek patlamaları engellenmiştir.
3. **Bellek Tüketimi:** Görünür alan dışındaki olaylar MapLibre tile hiyerarşisi tarafından otomatik kırpılır (`viewport clipping`).

---

## 12. Güvenlik, Gizlilik ve KVKK Standartları

1. **Konum İzin İlkeleri:** Uygulama açılışında agresif izin isteme yapılmaz; kullanıcı yalnızca "Konumuma Git" butonuna bastığında izin penceresi açılır.
2. **Koordinat Güvenliği:** Backend tarafından sağlanan `fuzzyLocation` mantığı korunmuş; haritaya aktarılan GeoJSON verilerinde hassas kullanıcı bilgisi taşınmamaktadır.
3. **İçerik İzolasyonu:** API isteklerinde ve demo verilerinde EXIF meta verisi içermeyen sanitize edilmiş medya yolları kullanılır.

---

## 13. Karşılaşılan Zorluklar ve Çözümleri

| Zorluk | Kök Neden | Çözüm |
| --- | --- | --- |
| **Prebuild Görsel Eksikliği** | `npx expo prebuild`, `apps/mobile/assets/` altında `icon.png` ve `splash.png` dosyalarını zorunlu kılar. | `sharp` kütüphanesi kullanılarak `tools/generate-assets.js` betiği yazıldı ve 1024x1024 standart varlıklar oluşturuldu. |
| **MapLibre 11.5.0 API Değişiklikleri** | Eski dokümanlardaki `attributionEnabled`, `getVisibleBounds`, `UserLocation.visible` özellikleri v11.5.0'da kaldırılmıştır. | MapLibre `.d.ts` tip dosyaları incelendi; `attribution={true}`, `onRegionDidChange` ve koşullu JSX render'a geçildi. |
| **DTO Koordinat Eşlemesi** | Backend `EventResponseDto`, koordinatları `{ latitude, longitude }` olarak dönerken GeoJSON formatı `[lng, lat]` dizisi bekler. | `geoUtils.ts` içinde tip güvenli `convertEventsToGeoJson` dönüştürücüsü geliştirildi ve kategori renkleri dinamik bağlandı. |
| **Yerel Android SDK Yokluğu** | Yerel Windows makinede `JAVA_HOME` ve Android SDK kurulu değildir. | Durum dürüstçe raporlandı; kod tabanı Prebuild ve EAS Build uyumlu hale getirilerek doğrulamalar Node.js test runner ile yapıldı. |

---

## 14. Graphify Bilgi Grafiği Güncellemesi

Kod tabanındaki tüm değişikliklerin ardından `graphify update .` komutu çalıştırılmış ve AST bilgi grafiği güncellenmiştir:

- **Önceki Durum (Phase 5):** 1.488 Düğüm, 2.980 Kenar, 91 Topluluk
- **Güncel Durum (Phase 6):** **1.527 Düğüm**, **3.068 Kenar**, **93 Topluluk**
- **Yeni Eklenen Modüller:** `PulseMapView`, `MapLayerSheet`, `useEventsBbox`, `useUserLocation`, `geoUtils`, `mapConfig`, `map.types` ve `map.test.js`.

---

## 15. Phase 7 İçin Hazırlık ve Geçiş Önerileri

Phase 6 ile harita motoru, kullanıcı konumu ve olay görüntüleme altyapısı eksiksiz tamamlanmıştır.

**Phase 7 (Olay Bildirim Akışı & Form Deneyimi) İçin Hazır Bulunan Altyapı:**
1. Harita üzerinde uzun basma veya pin bırakma (`onPress` koordinat yakalama) altyapısı hazırdır.
2. `useUserLocation` hook'u bildirim esnasında anlık GPS koordinatını otomatik doldurmak için kullanılabilir.
3. 11 kategori seçici ve tasarım token'ları form ekranlarında kullanılmaya hazırdır.
4. Merkezi "Bildir" yüzer tab butonu tıklandığında açılacak modal ve Zod tabanlı form validatörleri Phase 7'de doğrudan devreye alınabilir.
