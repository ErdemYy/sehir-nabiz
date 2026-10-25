import { Platform } from 'react-native';
import type { EventResponseDto, PaginatedEventsResponse, CategoryDto } from '@sehir-nabiz/shared';
import type { BBoxCoordinates } from '../types/map.types';

function getApiBaseUrl(): string {
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
 * Geliştirme ortamında API'ye erişilemediğinde devreye giren güvenli Kayseri demo olayları
 */
const FALLBACK_DEMO_EVENTS: EventResponseDto[] = [
  {
    id: 'demo-event-1',
    title: '[DEVELOPMENT DEMO] Sivas Caddesi Trafik Sıkışıklığı',
    description: 'Köprülü kavşak yönünde yoğunluk oluştu, akış yavaş ilerliyor.',
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
    reliabilityScore: 0.94,
    confirmationCount: 18,
    denialCount: 1,
    author: {
      id: 'demo-author-1',
      displayName: 'Kadir Has Mah. Sakini',
      reputationScore: 45,
    },
    isDemo: true,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-event-2',
    title: '[DEVELOPMENT DEMO] Mustafa Kemal Paşa Bulvarı Kaza',
    description: 'İki aracın karıştığı maddi hasarlı kaza nedeniyle orta şerit kapalıdır.',
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
    reliabilityScore: 0.98,
    confirmationCount: 34,
    denialCount: 0,
    author: {
      id: 'demo-author-2',
      displayName: 'Mehmet K.',
      reputationScore: 78,
    },
    isDemo: true,
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-event-3',
    title: '[DEVELOPMENT DEMO] Cumhuriyet Meydanı Asfalt Yenileme',
    description: 'Belediye fen işleri ekipleri gece saatlerine kadar asfalt çalışması yapmaktadır.',
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
    reliabilityScore: 0.91,
    confirmationCount: 22,
    denialCount: 2,
    author: {
      id: 'demo-author-3',
      displayName: 'Büyükşehir Görevlisi',
      reputationScore: 100,
    },
    isDemo: true,
    expiresAt: new Date(Date.now() + 14400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-event-4',
    title: '[DEVELOPMENT DEMO] Talas Bulvarı Ana Şebeke Arızası',
    description: 'KASKİ ekipleri arıza bölgesine müdahale ediyor, 2 saat içinde su verilecek.',
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
    reliabilityScore: 0.88,
    confirmationCount: 15,
    denialCount: 1,
    author: {
      id: 'demo-author-4',
      displayName: 'Talas Sakini',
      reputationScore: 32,
    },
    isDemo: true,
    expiresAt: new Date(Date.now() + 7200000).toISOString(),
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function fetchEventsBbox(
  bbox: BBoxCoordinates,
  category?: string | null,
  signal?: AbortSignal
): Promise<EventResponseDto[]> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}/events/bbox`);

  url.searchParams.set('west', bbox.west.toString());
  url.searchParams.set('south', bbox.south.toString());
  url.searchParams.set('east', bbox.east.toString());
  url.searchParams.set('north', bbox.north.toString());
  url.searchParams.set('limit', '100');

  if (category) {
    url.searchParams.set('category', category);
  }

  try {
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
    return json.items || [];
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }

    console.warn(
      `[EventsApi] Backend API (${baseUrl}) bağlantısı sağlanamadı. Geliştirme demo olayları devreye alınıyor. Hata: ${err.message}`
    );

    // Kategoriye göre filtreleyerek fallback demo verisini dön
    if (category) {
      return FALLBACK_DEMO_EVENTS.filter((e) => e.category.code === category);
    }
    return FALLBACK_DEMO_EVENTS;
  }
}
