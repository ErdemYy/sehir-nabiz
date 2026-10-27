import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../services/searchApi';
import type { SearchEventsQuery } from '@sehir-nabiz/shared';

export function useSearchEvents(query: SearchEventsQuery | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['events', 'search', query],
    queryFn: () => (query ? searchApi.searchEvents(query) : Promise.reject('No query')),
    enabled: enabled && query !== null && (query.q?.trim().length ?? 0) >= 2,
    staleTime: 30 * 1000,
  });
}
