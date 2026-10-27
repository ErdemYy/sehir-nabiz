import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../services/usersApi';
import type { EventStatus } from '@sehir-nabiz/shared';

export function useMyStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['users', 'me', 'stats'],
    queryFn: () => usersApi.getMyStats(),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useMyEvents(status?: EventStatus, enabled: boolean = true) {
  return useQuery({
    queryKey: ['users', 'me', 'events', status],
    queryFn: () => usersApi.getMyEvents(status),
    enabled,
    staleTime: 15 * 1000,
  });
}
