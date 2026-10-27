import { apiGet } from '../../../services/api';
import type { PaginatedEventsResponse, SearchEventsQuery } from '@sehir-nabiz/shared';

export const searchApi = {
  async searchEvents(query: SearchEventsQuery): Promise<PaginatedEventsResponse> {
    const params = new URLSearchParams({ q: query.q });
    if (query.category) params.append('category', query.category);
    if (query.city) params.append('city', query.city);
    if (query.district) params.append('district', query.district);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.cursor) params.append('cursor', query.cursor);

    return apiGet<PaginatedEventsResponse>(`/events/search?${params.toString()}`);
  },
};
