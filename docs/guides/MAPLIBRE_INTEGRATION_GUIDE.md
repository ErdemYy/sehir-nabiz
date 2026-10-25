# ŞehirNabız — MapLibre Native Entegrasyon Rehberi ve Uyumluluk Analizi (MAPLIBRE_INTEGRATION_GUIDE.md)

Bu belge, `@maplibre/maplibre-react-native` kütüphanesinin React Native 0.88, React 19 ve Expo SDK 58 ile uyumluluk durumunu ve Phase 6'da gerçekleştirilecek üretim kurulum adımlarını açıklar.

---

## 1. Uyumluluk Durumu Analizi

- **Expo SDK Sürümü:** Expo SDK 58 (`expo@~58.0.19`)
- **React Native Sürümü:** `0.88.0` (New Architecture / Fabric varsayılan açık)
- **React Sürümü:** `19.3.0`
- **MapLibre Sürümü:** `@maplibre/maplibre-react-native@^11.5.0`

### Peer Dependency İncelemesi
`npm view @maplibre/maplibre-react-native peerDependencies`:
- `expo: >=54.0.0` (Expo 58'i kapsar)
- `react: >=19.1.0` (React 19.3.0 ile tam uyumlu)
- `react-native: >=0.80.0` (React Native 0.88.0 ile uyumlu)

### Expo Go vs Expo Prebuild (Dev Client)
- **Expo Go Kısıtlaması:** `@maplibre/maplibre-react-native`, C++ Native çekirdek (MapLibre Native Core) ve Metal/OpenGL donanım hızlandırmalı renderer içerdiğinden Expo Go içinde çalışmaz.
- **Expo Development Client:** Expo Prebuild (`npx expo run:android` ve `npx expo run:ios`) veya EAS Build ile `@maplibre/maplibre-react-native` resmi Expo config plugin'i üzerinden kusursuz çalışır.

---

## 2. Phase 6'da Uygulanacak Kurulum Adımları

### 2.1 Bağımlılıkların Eklenmesi
```bash
pnpm --filter sehir-nabiz-mobile add @maplibre/maplibre-react-native @types/geojson
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
      ]
    ]
  }
}
```

### 2.3 Yerel Prebuild ve Çalıştırma
```bash
# Android için yerel derleme
npx expo run:android

# iOS için yerel derleme
npx expo run:ios
```

### 2.4 Temel Harita Bileşeni Mimarisi
```tsx
import { Map, Camera } from '@maplibre/maplibre-react-native';

export function PulseMapView() {
  return (
    <Map
      style={{ flex: 1 }}
      styleURL={process.env.EXPO_PUBLIC_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json'}
    >
      <Camera
        defaultSettings={{
          centerCoordinate: [28.9784, 41.0082], // İstanbul
          zoomLevel: 11,
        }}
      />
    </Map>
  );
}
```
