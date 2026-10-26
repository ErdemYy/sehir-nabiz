import type { CreateEventInput, EventResponseDto } from '@sehir-nabiz/shared';
import { getApiBaseUrl } from '../../../config/env';

export class CreateEventApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'CreateEventApiError';
  }
}

export async function createEventApi(
  payload: CreateEventInput,
  accessToken: string
): Promise<EventResponseDto> {
  const baseUrl = getApiBaseUrl();

  const response = await fetch(`${baseUrl}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = 'Olay bildirimi gönderilemedi.';
    if (response.status === 401) {
      errorMessage = 'Oturum süreniz dolmuş olabilir. Lütfen yeniden giriş yapınız.';
    } else if (response.status === 400 && data.message) {
      errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    } else if (data.message) {
      errorMessage = data.message;
    }
    throw new CreateEventApiError(response.status, errorMessage, data);
  }

  return data as EventResponseDto;
}
