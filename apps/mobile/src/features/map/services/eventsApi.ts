import { Platform } from 'react-native';
import type { EventResponseDto, PaginatedEventsResponse, CategoryDto } from '@sehir-nabiz/shared';
import type { BBoxCoordinates } from '../types/map.types';

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android emülatör 10.0.2.2 üzerinden geliştirici hostuna bağlanır
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api/v1';
  }
  return 'http://localhost:3001/api/v1';
}

function makeDemoCategory(code: string, nameTr: string, colorHex: string): CategoryDto {
  return {
    id: `cat-${code.toLowerCase()}`,
    code,
    nameTr,
    descriptionTr: `${nameTr} olayları`,
    icon: code.toLowerCase(),
    colorHex,
    defaultDurationHours: 4,
    isActive: true,
  };
}

/**
 * Demo Modu Kontrolü:
 * - Production ortamında (`process.env.NODE_ENV === 'production'` veya `__DEV__ === false`) daima FALSE döner.
 * - Yalnızca geliştirme ortamında ve `EXPO_PUBLIC_ENABLE_DEMO_MODE=true` olduğunda izin verilir.
 */
export function isDevelopmentDemoEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return false;
  }
  return process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE === 'true';
}

/**
 * Geliştirme ortamında açıkça talep edildiğinde kullanılan kontrollü Kayseri sentetik demo olayları.
 * Resmî veya doğrulanmış veri izlenimi vermemesi için güvenilirlik ve teyit sayıları 0 olarak tanımlanmıştır.
 */
export const FALLBACK_DEMO_EVENTS: EventResponseDto[] = [
  {
    id: 'demo-event-1',
    title: '[DEMO] Sivas Caddesi Trafik Yoğunluğu',
    description: '[Sentetik Test Verisi] Bu kayıt geliştirme/test amaçlıdır. Köprülü kavşak yönünde yoğunluk simülasyonu.',
    severity: 'MEDIUM' as any,
    status: 'ACTIVE' as any,
    category: makeDemoCategory('TRAFFIC', 'Trafik', '#EF4444'),
    location: {
      latitude: 38.7230,
      longitude: 35.4950,
    },
    addressText: 'Sivas Caddesi No: 42',
    city: 'Kayseri',
    district: 'Melikgazi',
    reliabilityScore: 0.0,
    confirmationCount: 0,
    denialCount: 0,
    author: {
      id: 'demo-system',
      displayName: 'Sentetik Test Kaydı (Doğrulanmamış)',
      reputationScore: 0,
    },
    isDemo: true,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-event-2',
    title: '[DEMO] Mustafa Kemal Paşa Bulvarı Kaza Simülasyonu',
    description: '[Sentetik Test Verisi] Bu kayıt geliştirme/test amaçlıdır. Maddi hasarlı kaza testi.',
    severity: 'HIGH' as any,
    status: 'ACTIVE' as any,
    category: makeDemoCategory('ACCIDENT', 'Kaza', '#DC2626'),
    location: {
      latitude: 38.7180,
      longitude: 35.4810,
    },
    addressText: 'Mustafa Kemal Paşa Bulvarı',
    city: 'Kayseri',
    district: 'Kocasinan',
    reliabilityScore: 0.0,
    confirmationCount: 0,
    denialCount: 0,
    author: {
      id: 'demo-system',
      displayName: 'Sentetik Test Kaydı (Doğrulanmamış)',
      reputationScore: 0,
    },
    isDemo: true,
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-event-3',
    title: '[DEMO] Cumhuriyet Meydanı Asfalt Yenileme Testi',
    description: '[Sentetik Test Verisi] Bu kayıt geliştirme/test amaçlıdır. Yol çalışması simülasyonu.',
    severity: 'MEDIUM' as any,
    status: 'ACTIVE' as any,
    category: makeDemoCategory('ROAD_WORK', 'Yol Çalışması', '#F59E0B'),
    location: {
      latitude: 38.7225,
      longitude: 35.4853,
    },
    addressText: 'Cumhuriyet Meydanı',
    city: 'Kayseri',
    district: 'Melikgazi',
    reliabilityScore: 0.0,
    confirmationCount: 0,
    denialCount: 0,
    author: {
      id: 'demo-system',
      displayName: 'Sentetik Test Kaydı (Doğrulanmamış)',
      reputationScore: 0,
    },
    isDemo: true,
    expiresAt: new Date(Date.now() + 14400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-event-4',
    title: '[DEMO] Talas Bulvarı Altyapı Arıza Testi',
    description: '[Sentetik Test Verisi] Bu kayıt geliştirme/test amaçlıdır. Su kesintisi simülasyonu.',
    severity: 'LOW' as any,
    status: 'ACTIVE' as any,
    category: makeDemoCategory('WATER_OUTAGE', 'Su Kesintisi', '#0284C7'),
    location: {
      latitude: 38.7050,
      longitude: 35.5120,
    },
    addressText: 'Talas Bulvarı No: 120',
    city: 'Kayseri',
    district: 'Talas',
    reliabilityScore: 0.0,
    confirmationCount: 0,
    denialCount: 0,
    author: {
      id: 'demo-system',
      displayName: 'Sentetik Test Kaydı (Doğrulanmamış)',
      reputationScore: 0,
    },
    isDemo: true,
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface FetchEventsBboxOptions {
  maxPages?: number;
  forceDemoMode?: boolean;
}

/**
 * Bounding Box Olaylarını Getir:
 * 1. Gerçek backend API yanıtları önceliklidir.
 * 2. Backend'in 100 olaylık sayfalama sınırını (hasMore) dikkate alır ve maxPages (varsayılan: 3) kadar sayfalama yaparak
 *    harita yoğunluğunun eksik veya yanlış gösterilmesini engeller.
 * 3. API'ye ulaşılamadığında üretim modunda hata fırlatır (asla sentetik olay uydurmaz).
 * 4. Yalnızca açık geliştirme demo modunda (isDevelopmentDemoEnabled veya forceDemoMode) etiketlenmiş sentetik veriyi sunar.
 */
export async function fetchEventsBbox(
  bbox: BBoxCoordinates,
  category?: string | null,
  signal?: AbortSignal,
  options: FetchEventsBboxOptions = {}
): Promise<EventResponseDto[]> {
  const { maxPages = 3, forceDemoMode = false } = options;
  const baseUrl = getApiBaseUrl();
  const allItems: EventResponseDto[] = [];
  let nextCursor: string | null = null;
  let page = 0;

  try {
    do {
      page++;
      const url = new URL(`${baseUrl}/events/bbox`);
      url.searchParams.set('west', bbox.west.toString());
      url.searchParams.set('south', bbox.south.toString());
      url.searchParams.set('east', bbox.east.toString());
      url.searchParams.set('north', bbox.north.toString());
      url.searchParams.set('limit', '100');

      if (category) {
        url.searchParams.set('category', category);
      }
      if (nextCursor) {
        url.searchParams.set('cursor', nextCursor);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
      }

      const json: PaginatedEventsResponse = await response.json();
      const items = json.items || [];
      allItems.push(...items);

      if (json.hasMore && json.nextCursor && page < maxPages) {
        nextCursor = json.nextCursor;
      } else {
        nextCursor = null;
      }
    } while (nextCursor && page < maxPages);

    return allItems;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }

    const demoAllowed = forceDemoMode || isDevelopmentDemoEnabled();

    // Üretim ortamında veya demo modu kapalıyken hatayı fırlat (sentetik olay dönme)
    if (!demoAllowed) {
      throw err;
    }

    console.warn(
      `[EventsApi] Backend API (${baseUrl}) bağlantısı sağlanamadı. Geliştirici Demo Modu devrede. Hata: ${err.message}`
    );

    // Kategoriye göre filtreleyerek fallback demo verisini dön
    if (category) {
      return FALLBACK_DEMO_EVENTS.filter((e) => e.category.code === category);
    }
    return FALLBACK_DEMO_EVENTS;
  }
}
