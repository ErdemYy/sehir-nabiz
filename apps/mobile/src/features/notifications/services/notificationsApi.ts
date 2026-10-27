import { getApiBaseUrl } from '../../map/services/eventsApi';
import type {
  PaginatedNotificationsResponse,
  UserNotificationDto,
  NotificationPreferencesDto,
  RegisterPushTokenDto,
} from '@sehir-nabiz/shared';

/**
 * Kullanıcı Bildirimlerini Getir (GET /notifications)
 */
export async function fetchNotifications(
  options: { cursor?: string | null; unreadOnly?: boolean; limit?: number } = {},
  token?: string | null,
): Promise<PaginatedNotificationsResponse> {
  const baseUrl = getApiBaseUrl();
  const params = new URLSearchParams();

  if (options.cursor) params.append('cursor', options.cursor);
  if (options.unreadOnly) params.append('unreadOnly', 'true');
  if (options.limit) params.append('limit', options.limit.toString());

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/notifications?${params.toString()}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Bildirimler alınamadı (${res.status}): ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Okunmamış Bildirim Sayısını Getir (GET /notifications/unread-count)
 */
export async function fetchUnreadCount(token?: string | null): Promise<number> {
  if (!token) return 0;
  const baseUrl = getApiBaseUrl();

  const res = await fetch(`${baseUrl}/notifications/unread-count`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return 0;
  const data = await res.json();
  return data.unreadCount ?? 0;
}

/**
 * Tekil Bildirimi Okundu Olarak İşaretle (PATCH /notifications/:id/read)
 */
export async function markNotificationAsRead(
  id: string,
  token?: string | null,
): Promise<UserNotificationDto> {
  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/notifications/${id}/read`, {
    method: 'PATCH',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Okundu işaretlenemedi (${res.status})`);
  }

  return await res.json();
}

/**
 * Tüm Bildirimleri Okundu Olarak İşaretle (PATCH /notifications/read-all)
 */
export async function markAllNotificationsAsRead(
  token?: string | null,
): Promise<{ affected: number }> {
  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/notifications/read-all`, {
    method: 'PATCH',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Toplu okundu işaretlenemedi (${res.status})`);
  }

  return await res.json();
}

/**
 * Cihaz Push Token Kaydet (POST /devices/push-token)
 */
export async function registerPushTokenApi(
  dto: RegisterPushTokenDto,
  token?: string | null,
): Promise<{ success: boolean; id: string }> {
  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/devices/push-token`, {
    method: 'POST',
    headers,
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error(`Push token kaydedilemedi (${res.status})`);
  }

  return await res.json();
}

/**
 * Cihaz Push Token Pasifleştir (DELETE /devices/push-token)
 */
export async function deactivatePushTokenApi(
  pushToken: string,
  token?: string | null,
): Promise<{ success: boolean }> {
  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/devices/push-token`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ token: pushToken }),
  });

  if (!res.ok) {
    throw new Error(`Push token silinemedi (${res.status})`);
  }

  return await res.json();
}

/**
 * Bildirim Tercihlerini Getir (GET /notifications/preferences)
 */
export async function fetchNotificationPreferences(
  token?: string | null,
): Promise<NotificationPreferencesDto> {
  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/notifications/preferences`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Tercihler alınamadı (${res.status})`);
  }

  return await res.json();
}

/**
 * Bildirim Tercihlerini Güncelle (PATCH /notifications/preferences)
 */
export async function updateNotificationPreferencesApi(
  prefs: Partial<NotificationPreferencesDto>,
  token?: string | null,
): Promise<NotificationPreferencesDto> {
  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/notifications/preferences`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(prefs),
  });

  if (!res.ok) {
    throw new Error(`Tercihler güncellenemedi (${res.status})`);
  }

  return await res.json();
}
