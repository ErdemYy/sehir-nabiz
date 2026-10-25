/**
 * ŞehirNabız Harita Yapılandırması ve Lisans Bilgileri
 *
 * Sağlayıcı Değerlendirmesi:
 * - Development & Demo: OpenFreeMap (Tamamen ücretsiz, açık kaynak, API anahtarı gerektirmeyen vektör karolar)
 *   ve MapLibre Demo Tiles (demotiles.maplibre.org).
 * - Production: MapTiler Cloud (streets-v2 / outdoor) veya özel self-hosted OpenMapTiles karo sunucusu.
 * - Lisans & Attribution: OpenStreetMap katkıcıları (ODbL) ve MapLibre Native lisansı korunmalıdır.
 */

export const MAP_CONFIG = {
  // Varsayılan kamera merkezi (Kayseri Cumhuriyet Meydanı koordinatları)
  defaultCamera: {
    longitude: 35.4853,
    latitude: 38.7225,
    zoomLevel: 12.5,
  },

  // Harita Vektör Stilleri (MapLibre Uyumlu Vektör JSON)
  styles: {
    // Açık Harita Stili (Urban Floating UI Light)
    light:
      process.env.EXPO_PUBLIC_MAP_STYLE_LIGHT ||
      'https://tiles.openfreemap.org/styles/liberty',

    // Koyu Harita Stili (Urban Floating UI Dark)
    dark:
      process.env.EXPO_PUBLIC_MAP_STYLE_DARK ||
      'https://tiles.openfreemap.org/styles/dark',

    // Alternatif / Uydu Haritası (MapLibre Demo)
    satellite:
      process.env.EXPO_PUBLIC_MAP_STYLE_SATELLITE ||
      'https://demotiles.maplibre.org/style.json',
  },

  // Kümeleme (Clustering) Parametreleri
  clustering: {
    enabled: true,
    radius: 45, // Piksel yarıçapı
    maxZoom: 15, // Bu zoom seviyesinden sonra kümeler çözülür
  },

  // Kamera sınırları (Türkiye genel sınırları)
  bounds: {
    turkeyWest: 25.5,
    turkeySouth: 35.8,
    turkeyEast: 44.8,
    turkeyNorth: 42.2,
  },

  // Harita Telif & Attribution Metinleri
  attributions: {
    osm: '© OpenStreetMap katkıcıları',
    maplibre: 'MapLibre Native',
    openfreemap: 'OpenFreeMap',
  },
} as const;
