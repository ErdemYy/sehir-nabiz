import type { CategoryDto } from '@sehir-nabiz/shared';
import { EventCategory } from '@sehir-nabiz/shared';
import { palette } from '@sehir-nabiz/design-tokens';
import { getApiBaseUrl } from '../../../config/env';

export const FALLBACK_CATEGORIES: CategoryDto[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    code: EventCategory.TRAFFIC,
    nameTr: 'Trafik',
    descriptionTr: 'Trafik sıkışıklığı ve kilitlenmeler',
    icon: 'traffic-cone',
    colorHex: palette.categories.TRAFFIC,
    defaultDurationHours: 3,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    code: EventCategory.ACCIDENT,
    nameTr: 'Kaza',
    descriptionTr: 'Trafik ve araç kazaları',
    icon: 'car-crash',
    colorHex: palette.categories.ACCIDENT,
    defaultDurationHours: 2,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    code: EventCategory.ROAD_WORK,
    nameTr: 'Yol Çalışması',
    descriptionTr: 'Asfalt, kazı ve yol yapım çalışmaları',
    icon: 'construction',
    colorHex: palette.categories.ROAD_WORK,
    defaultDurationHours: 8,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    code: EventCategory.WATER_OUTAGE,
    nameTr: 'Su Kesintisi',
    descriptionTr: 'Şebeke arızaları ve planlı su kesintileri',
    icon: 'droplets',
    colorHex: palette.categories.WATER_OUTAGE,
    defaultDurationHours: 6,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    code: EventCategory.POWER_OUTAGE,
    nameTr: 'Elektrik',
    descriptionTr: 'Trafo arızaları ve elektrik kesintileri',
    icon: 'zap',
    colorHex: palette.categories.POWER_OUTAGE,
    defaultDurationHours: 4,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000006',
    code: EventCategory.INFRASTRUCTURE,
    nameTr: 'Altyapı',
    descriptionTr: 'Doğalgaz, kanalizasyon ve telekomünikasyon arızaları',
    icon: 'wrench',
    colorHex: palette.categories.INFRASTRUCTURE,
    defaultDurationHours: 12,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000007',
    code: EventCategory.PUBLIC_TRANSPORT,
    nameTr: 'Toplu Taşıma',
    descriptionTr: 'Otobüs, tramvay ve metro aksaklıkları',
    icon: 'bus',
    colorHex: palette.categories.PUBLIC_TRANSPORT,
    defaultDurationHours: 2,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000008',
    code: EventCategory.WEATHER,
    nameTr: 'Hava Durumu',
    descriptionTr: 'Buzlanma, fırtına, dolu ve yoğun sis',
    icon: 'cloud-snow',
    colorHex: palette.categories.WEATHER,
    defaultDurationHours: 6,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000009',
    code: EventCategory.DISASTER,
    nameTr: 'Afet',
    descriptionTr: 'Deprem, sel, heyelan ve yangın acil durumları',
    icon: 'flame',
    colorHex: palette.categories.DISASTER,
    defaultDurationHours: 24,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000010',
    code: EventCategory.EVENT,
    nameTr: 'Etkinlik',
    descriptionTr: 'Konser, miting, maraton ve açık hava etkinlikleri',
    icon: 'calendar',
    colorHex: palette.categories.EVENT,
    defaultDurationHours: 6,
    isActive: true,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000011',
    code: EventCategory.OTHER,
    nameTr: 'Diğer',
    descriptionTr: 'Diğer kentsel aksaklık ve gelişmeler',
    icon: 'help-circle',
    colorHex: palette.categories.OTHER,
    defaultDurationHours: 4,
    isActive: true,
  },
];

export async function fetchCategories(): Promise<CategoryDto[]> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/categories`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      throw new Error(`Kategoriler alınamadı (${response.status})`);
    }

    const data: CategoryDto[] = await response.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_CATEGORIES;
  } catch (err) {
    console.warn('[CategoriesApi] Canlı kategori API bağlantısı sağlanamadı, varsayılan sistem kategorileri kullanılıyor:', err);
    return FALLBACK_CATEGORIES;
  }
}
