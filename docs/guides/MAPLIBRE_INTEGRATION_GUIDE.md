# ŞehirNabız — MapLibre Native Entegrasyon Rehberi ve Uyumluluk Analizi (MAPLIBRE_INTEGRATION_GUIDE.md)

Bu belge, `@maplibre/maplibre-react-native` kütüphanesinin React Native 0.88, React 19 ve Expo SDK 58 ile uyumluluk durumunu, Expo Prebuild sürecini ve Phase 6'da uygulanan üretim mimarisini açıklar.

---

## 1. Uyumluluk Durumu Analizi

- **Expo SDK Sürümü:** Expo SDK 58 (`expo@~58.0.19`)
- **React Native Sürümü:** `0.88.0` (New Architecture / Fabric varsayılan açık)
- **React Sürümü:** `19.3.0`
- **MapLibre Sürümü:** `@maplibre/maplibre-react-native@11.5.0`
- **Expo Config Plugin:** `@maplibre/maplibre-react-native` resmi config plugini
- **Konum Servisleri:** `expo-location@~58.0.19`

### 1.1 Peer Dependency & New Architecture İncelemesi
MapLibre v11.5.0, Expo SDK 58 ve React Native 0.88 ile tam uyumlu resmi New Architecture köprülerine sahiptir:
- `expo: >=54.0.0` (Expo 58 ile uyumlu)
- `react: >=19.1.0` (React 19.3.0 ile uyumlu)
- `react-native: >=0.80.0` (React Native 0.88.0 ile uyumlu)

### 1.2 Expo Go vs Expo Development Client (Prebuild)
- **Expo Go Sınırı:** `@maplibre/maplibre-react-native`, C++ Native çekirdek (MapLibre Native Core) ve Metal/OpenGL donanım ivmeli renderer içerdiğinden Expo Go içinde çalıştırılamaz.
- **Expo Development Client & Prebuild:** `npx expo prebuild` komutu ile `android/` ve `ios/` native projeleri konfigüre edilir. Geliştirme sürecinde `expo-dev-client` ile custom development build kullanılır.

---

## 2. Phase 6 Mimari ve Kurulum Adımları

### 2.1 Paket Bağımlılıkları
```bash
pnpm --filter sehir-nabiz-mobile add @maplibre/maplibre-react-native@11.5.0 expo-location@~58.0.19 expo-dev-client@~58.0.15 @types/geojson@7946.0.14
```

### 2.2 Expo Config Plugin Yapılandırması (`apps/mobile/app.json`)
```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "@maplibre/maplibre-react-native",
        {
          "android": {
            "version": "11.5.0"
          }
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "ŞehirNabız, çevrenizdeki olayları harita üzerinde göstermek ve konumunuza özel bildirimler sunmak için konumunuza ihtiyaç duyar.",
          "locationWhenInUsePermission": "ŞehirNabız, yakınınızdaki olayları harita üzerinde gösterebilmek için konumunuza erişim ister."
        }
      ]
    ]
  }
}
```

### 2.3 Expo Prebuild Süreci
Expo Prebuild komutu ile native proje dosyaları oluşturulur:
```bash
npx expo prebuild --no-install
```
> [!NOTE]
> Prebuild işlemi için `assets/icon.png`, `assets/adaptive-icon.png` ve `assets/splash.png` varlıkları gereklidir. Bu varlıklar `tools/generate-assets.js` betiği ile marka renklerinde 1024x1024 olarak üretilmiştir.

### 2.4 Yerel Derleme ve Çalıştırma (Native Build)
```bash
# Android geliştirme derlemesi
pnpm --filter sehir-nabiz-mobile android
# veya: npx expo run:android

# iOS geliştirme derlemesi (macOS & Xcode gerektirir)
pnpm --filter sehir-nabiz-mobile ios
# veya: npx expo run:ios
```
> [!IMPORTANT]
> Android yerel derlemesi için makinede `JAVA_HOME` (JDK 17+) ve Android SDK/NDK kurulu olmalıdır. Bulut derlemeleri için Expo Application Services (EAS Build) önerilir (`eas build --profile development --platform android`).

---

## 3. MapLibre 11.5.0 API Sözdizimi ve İncelikleri

Phase 6 uygulamasında MapLibre v11.5.0 için tespit edilen ve uygulanan kritik API kuralları:

1. **Map Bileşeni Özellikleri:**
   - `attribution={true}` veya `attribution={false}` (boolean prop; eski `attributionEnabled` kullanılmaz).
   - `logo={false}` (boolean prop; eski `logoEnabled` kullanılmaz).
   - `attributionPosition`: `{ bottom: 84, right: 12 }` gibi pikselli konum nesnesi alır.

2. **Kamera ve Harita Olayları:**
   - Bölge değişimi için `onRegionDidChange` kullanılır:
     ```tsx
     onRegionDidChange={(e) => {
       const [west, south, east, north] = e.nativeEvent.bounds;
       // Bounding box güncellemesi
     }}
     ```
   - Harita tıklaması:
     ```tsx
     onPress={(e) => {
       const [lng, lat] = e.geometry.coordinates;
     }}
     ```

3. **Kullanıcı Konumu (`UserLocation`):**
   - Bileşen kendi içinde GPS verisini çizebilir veya `expo-location` ile senkronize edilebilir.
   - Props: `animated={true}`, `showsUserHeadingIndicator={true}`.
   - Görünürlüğü koşullu JSX (`{userCoords && <UserLocation ... />}`) ile yönetilir.

4. **GPU Tabanlı Kümeleme (`GeoJSONSource`, `CircleLayer`, `SymbolLayer`):**
   - `cluster={true}`, `clusterRadius={50}`, `clusterMaxZoom={14}`
   - Kümeler: `CircleLayer` ile renk basamakları (`step` fonksiyonu: 10, 50, 100 olay eşikleri) ve `SymbolLayer` ile küme olay sayısı (`{point_count_abbreviated}`).
   - Tekil İşaretçiler: `CircleLayer` ile kategoriye özel dinamik renk (`['get', 'categoryColor']`) ve beyaz kenarlık.
   - Seçili İşaretçi: Özel dış halka katmanı (`circle-stroke-color: #0D9488`, `circle-radius: 14`).

---

## 4. Vektör Harita Katmanları (Map Vector Styles)

`apps/mobile/src/features/map/config/mapConfig.ts` dosyasında üç farklı stil tanımlanmıştır:

| Stil Adı | Tür | Kaynak URL | Açıklama |
| --- | --- | --- | --- |
| **Standart (Liberty)** | Vektör | `https://tiles.openfreemap.org/styles/liberty` | Açık renkli, okunabilir kentsel sokak stili |
| **Gece (Dark)** | Vektör | `https://tiles.openfreemap.org/styles/dark` | Gece modu için optimize edilmiş koyu tema |
| **Uydu (Satellite)** | Raster/Hibrit | `https://demotiles.maplibre.org/style.json` | Ortofoto ve harita katmanı |

### Üretim Ortamı Yapılandırması:
Üretim ortamında özel MapTiler veya kendi kuracağımız OpenFreeMap tile proxy sunucusu için `.env` üzerinden stil URL'leri ezilebilir:
- `EXPO_PUBLIC_MAP_STYLE_LIGHT`
- `EXPO_PUBLIC_MAP_STYLE_DARK`
- `EXPO_PUBLIC_MAP_STYLE_SATELLITE`
- `EXPO_PUBLIC_API_URL` (NestJS Events BBox API entegrasyonu için)
