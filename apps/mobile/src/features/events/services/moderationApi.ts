import { getApiBaseUrl } from '../../map/services/eventsApi';
import type { PaginatedModerationEventsResponse, EventResponseDto } from '@sehir-nabiz/shared';

/**
 * Moderasyon Olayları Listesini Getir (GET /moderation/events)
 */
export async function fetchModerationEvents(
  params: { status?: string; category?: string; severity?: string; city?: string; limit?: number; cursor?: string },
  token: string,
): Promise<PaginatedModerationEventsResponse> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}/moderation/events`);

  if (params.status) url.searchParams.set('status', params.status);
  if (params.category) url.searchParams.set('category', params.category);
  if (params.severity) url.searchParams.set('severity', params.severity);
  if (params.city) url.searchParams.set('city', params.city);
  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.cursor) url.searchParams.set('cursor', params.cursor);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.message || `Moderasyon listesi alınamadı (${res.status})`;
    throw new Error(message);
  }

  return await res.json();
}

/**
 * Moderatör İçin Olay Detayı (GET /moderation/events/:id)
 */
export async function fetchModerationEventDetail(
  id: string,
  token: string,
): Promise<any> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/moderation/events/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.message || `Moderasyon detayı alınamadı (${res.status})`;
    throw new Error(message);
  }

  return await res.json();
}

/**
 * Olay Durumunu Güncelle (PATCH /events/:id/status)
 */
export async function updateEventStatus(
  id: string,
  status: string,
  reason: string | undefined,
  token: string,
): Promise<EventResponseDto> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/events/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, reason }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.message || `Durum güncellenemedi (${res.status})`;
    throw new Error(message);
  }

  return await res.json();
}
