import { apiGet } from '../../../services/api';
import type { UserStatsDto, MyEventResponseDto, EventStatus } from '@sehir-nabiz/shared';

export const usersApi = {
  /**
   * Kullanıcının Gerçek Katkı İstatistikleri
   */
  async getMyStats(): Promise<UserStatsDto> {
    return apiGet<UserStatsDto>('/users/me/stats');
  },

  /**
   * Kullanıcının Kendi Bildirdiği Olaylar
   */
  async getMyEvents(status?: EventStatus, cursor?: string): Promise<{ items: MyEventResponseDto[]; nextCursor: string | null; hasMore: boolean }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (cursor) params.append('cursor', cursor);

    return apiGet<{ items: MyEventResponseDto[]; nextCursor: string | null; hasMore: boolean }>(
      `/users/me/events?${params.toString()}`,
    );
  },
};
