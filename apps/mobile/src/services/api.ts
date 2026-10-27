import { getApiBaseUrl } from '../config/env';
import { useAuthStore } from '../features/auth';

export async function apiGet<T>(path: string): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().accessToken;
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const msg = errorBody?.message || `API Hatası: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return res.json();
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().accessToken;
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const msg = errorBody?.message || `API Hatası: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return res.json();
}
