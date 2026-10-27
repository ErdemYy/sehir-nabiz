import { getApiBaseUrl, FALLBACK_DEMO_EVENTS } from '../../map/services/eventsApi';
import type { FeedbackSummaryDto, EventResponseDto, FeedbackType } from '@sehir-nabiz/shared';

/**
 * Tekil Olay Detayını Getir (GET /events/:id)
 */
export async function fetchEventDetail(
  eventId: string,
  token?: string | null,
): Promise<EventResponseDto> {
  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${baseUrl}/events/${eventId}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      if (res.status === 404) {
        // Demo fallback denetimi
        const demo = FALLBACK_DEMO_EVENTS.find(e => e.id === eventId);
        if (demo) return demo;
        throw new Error('Olay bulunamadı veya inceleme aşamasında.');
      }
      throw new Error(`Detay alınamadı (${res.status}): ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    const demo = FALLBACK_DEMO_EVENTS.find(e => e.id === eventId);
    if (demo) return demo;
    throw err;
  }
}

/**
 * Olay Geri Bildirim Özetini Getir (GET /events/:id/feedback/summary)
 */
export async function fetchFeedbackSummary(
  eventId: string,
  token?: string | null,
): Promise<FeedbackSummaryDto> {
  const baseUrl = getApiBaseUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${baseUrl}/events/${eventId}/feedback/summary`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      if (res.status === 404) {
        // Fallback demo summary
        return {
          eventId,
          confirmCount: 0,
          disputeCount: 0,
          resolvedReportCount: 0,
          totalCount: 0,
          userFeedback: null,
          hasSufficientSample: false,
          communityAssessment: 'Topluluk değerlendirmesi henüz oluşmadı (en az 3 bağımsız bildirim gereklidir).',
          disclaimer: 'Topluluk bildirimleri kamuoyunu bilgilendirme amaçlıdır; resmî doğrulama niteliği taşımaz.',
        };
      }
      throw new Error(`Geri bildirim özeti alınamadı: ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    return {
      eventId,
      confirmCount: 0,
      disputeCount: 0,
      resolvedReportCount: 0,
      totalCount: 0,
      userFeedback: null,
      hasSufficientSample: false,
      communityAssessment: 'Topluluk değerlendirmesi henüz oluşmadı (en az 3 bağımsız bildirim gereklidir).',
      disclaimer: 'Topluluk bildirimleri kamuoyunu bilgilendirme amaçlıdır; resmî doğrulama niteliği taşımaz.',
    };
  }
}

/**
 * Topluluk Geri Bildirimi Gönder (POST /events/:id/feedback)
 */
export async function submitEventFeedback(
  eventId: string,
  type: FeedbackType,
  reason?: string | null,
  token?: string | null,
): Promise<FeedbackSummaryDto> {
  if (!token) {
    throw new Error('Geri bildirim göndermek için giriş yapmalısınız.');
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/events/${eventId}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, reason: reason || null }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.message || `İşlem başarısız oldu (${res.status})`;
    throw new Error(message);
  }

  return await res.json();
}

/**
 * Topluluk Geri Bildirimini Geri Çek (DELETE /events/:id/feedback)
 */
export async function removeEventFeedback(
  eventId: string,
  token: string,
): Promise<FeedbackSummaryDto> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/events/${eventId}/feedback`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.message || `Geri çekme başarısız (${res.status})`;
    throw new Error(message);
  }

  return await res.json();
}
