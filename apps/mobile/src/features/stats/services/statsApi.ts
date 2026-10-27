import { apiGet } from '../../../services/api';
import type {
  StatsOverviewDto,
  StatsPeriod,
  HeatmapResponseDto,
  HeatmapQuery,
} from '@sehir-nabiz/shared';

export const statsApi = {
  /**
   * Şehir İstatistikleri Genel Özeti
   */
  async getOverview(city: string = 'Kayseri', period: StatsPeriod = '7d'): Promise<StatsOverviewDto> {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (period) params.append('period', period);

    return apiGet<StatsOverviewDto>(`/stats/overview?${params.toString()}`);
  },

  /**
   * Coğrafi Yoğunluk / Isı Haritası
   */
  async getHeatmap(query: HeatmapQuery): Promise<HeatmapResponseDto> {
    const params = new URLSearchParams({
      minLng: query.minLng.toString(),
      minLat: query.minLat.toString(),
      maxLng: query.maxLng.toString(),
      maxLat: query.maxLat.toString(),
    });

    if (query.category) params.append('category', query.category);
    if (query.period) params.append('period', query.period);
    if (query.precision) params.append('precision', query.precision.toString());

    return apiGet<HeatmapResponseDto>(`/stats/heatmap?${params.toString()}`);
  },
};
