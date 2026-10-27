import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../services/statsApi';
import type { StatsPeriod, HeatmapQuery } from '@sehir-nabiz/shared';

export function useCityOverview(city: string = 'Kayseri', period: StatsPeriod = '7d') {
  return useQuery({
    queryKey: ['stats', 'overview', city, period],
    queryFn: () => statsApi.getOverview(city, period),
    staleTime: 60 * 1000, // 1 dakika cache
  });
}

export function useHeatmap(query: HeatmapQuery | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['stats', 'heatmap', query],
    queryFn: () => (query ? statsApi.getHeatmap(query) : Promise.reject('No query')),
    enabled: enabled && query !== null,
    staleTime: 60 * 1000,
  });
}
