import type { EventResponseDto, EventSeverity } from '@sehir-nabiz/shared';
import { palette } from '@sehir-nabiz/design-tokens';
import type {
  BBoxCoordinates,
  EventGeoJsonCollection,
  EventGeoJsonFeature,
  MapEventProperties,
} from '../types/map.types';

/**
 * Backend olay yanıtlarını MapLibre GPU kümeleme motoruna uygun GeoJSON FeatureCollection formatına dönüştürür.
 */
export function convertEventsToGeoJson(
  events: EventResponseDto[]
): EventGeoJsonCollection {
  const features: EventGeoJsonFeature[] = events
    .filter((event) => {
      return (
        event.location &&
        typeof event.location.latitude === 'number' &&
        typeof event.location.longitude === 'number'
      );
    })
    .map((event) => {
      const lon = event.location.longitude;
      const lat = event.location.latitude;
      const categoryCode =
        typeof event.category === 'string' ? event.category : event.category.code;
      const categoryColor =
        palette.categories[categoryCode as keyof typeof palette.categories] ||
        palette.categories.OTHER;

      const properties: MapEventProperties = {
        id: event.id,
        title: event.title,
        category: categoryCode,
        severity: event.severity,
        status: event.status,
        reliabilityScore: event.reliabilityScore ?? 1.0,
        upvotesCount: event.confirmationCount ?? 0,
        downvotesCount: event.denialCount ?? 0,
        isDemo: Boolean(event.isDemo),
        addressText: event.addressText,
        city: event.city,
        district: event.district,
        description: event.description,
        createdAt: event.createdAt,
        categoryColor,
      };

      return {
        type: 'Feature',
        id: event.id,
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        properties,
      };
    });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Bounding Box koordinatlarını doğrular ve sınırlar dahilinde tutar.
 */
export function validateBBox(bbox: BBoxCoordinates): boolean {
  if (
    typeof bbox.west !== 'number' ||
    typeof bbox.south !== 'number' ||
    typeof bbox.east !== 'number' ||
    typeof bbox.north !== 'number'
  ) {
    return false;
  }

  if (bbox.west < -180 || bbox.west > 180) return false;
  if (bbox.east < -180 || bbox.east > 180) return false;
  if (bbox.south < -90 || bbox.south > 90) return false;
  if (bbox.north < -90 || bbox.north > 90) return false;

  return bbox.south <= bbox.north;
}

/**
 * Mesafeyi insan tarafından okunabilir Türkçe formatına dönüştürür.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * 1.000 ve 5.000 olay içeren performans ve kümeleme stres testi veri kümesi üreticisi
 */
export function generateSyntheticBenchmarkEvents(
  count: number,
  centerLon = 35.4853,
  centerLat = 38.7225,
  radiusDelta = 0.15
): EventGeoJsonCollection {
  const categories = Object.keys(palette.categories);
  const severities: EventSeverity[] = [
    'LOW' as EventSeverity,
    'MEDIUM' as EventSeverity,
    'HIGH' as EventSeverity,
    'CRITICAL' as EventSeverity,
  ];
  const features: EventGeoJsonFeature[] = [];

  for (let i = 0; i < count; i++) {
    // Rastgele kutupsal dağılım
    const r = radiusDelta * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const lon = centerLon + r * Math.cos(theta);
    const lat = centerLat + r * Math.sin(theta);

    const category = categories[i % categories.length]!;
    const categoryColor =
      palette.categories[category as keyof typeof palette.categories] ||
      palette.categories.OTHER;

    features.push({
      type: 'Feature',
      id: `benchmark-${i}`,
      geometry: {
        type: 'Point',
        coordinates: [lon, lat],
      },
      properties: {
        id: `benchmark-${i}`,
        title: `Test Olayı #${i + 1}`,
        category,
        severity: severities[i % severities.length]!,
        status: 'ACTIVE' as any,
        reliabilityScore: 0.95,
        upvotesCount: 10 + (i % 50),
        downvotesCount: 1,
        isDemo: true,
        district: 'Test Bölgesi',
        createdAt: new Date().toISOString(),
        categoryColor,
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}
