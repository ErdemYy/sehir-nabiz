import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { UploadUrlResponseDto, EventMediaDto } from '@sehir-nabiz/shared';
import { getApiBaseUrl } from '../../../config/env';
import type { SelectedPhoto } from '../types/events.types';
import { useAuthStore } from '../../auth/store/useAuthStore';

export class MediaUploadError extends Error {
  constructor(
    public readonly stage: 'upload-url' | 'storage-put' | 'complete',
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'MediaUploadError';
  }
}

/**
 * 1. Adım: Backend'den Presigned Upload URL Al
 */
export async function getPresignedUploadUrl(
  eventId: string,
  fileName: string,
  mimeType: string,
  fileSize: number,
  accessToken: string
): Promise<UploadUrlResponseDto> {
  const baseUrl = getApiBaseUrl();
  let currentToken = accessToken;

  let response = await fetch(`${baseUrl}/events/${eventId}/media/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    },
    body: JSON.stringify({
      fileName,
      mimeType,
      fileSize,
    }),
  });

  // Oturum yenileme: 401 durumunda token yenileyip bir kez tekrar dene
  if (response.status === 401) {
    const refreshed = await useAuthStore.getState().getValidAccessToken();
    if (refreshed && refreshed !== currentToken) {
      currentToken = refreshed;
      response = await fetch(`${baseUrl}/events/${eventId}/media/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          fileName,
          mimeType,
          fileSize,
        }),
      });
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new MediaUploadError(
      'upload-url',
      data.message || 'Yükleme adresi alınamadı.',
      data
    );
  }

  return data as UploadUrlResponseDto;
}

/**
 * 2. Adım: Görsel İkili (Binary) Dosyasını S3 / MinIO Presigned URL'sine PUT Et
 */
export async function uploadBinaryToStorage(
  uploadUrl: string,
  fileUri: string,
  mimeType: string
): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      const fileRes = await fetch(fileUri);
      const blob = await fileRes.blob();
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
        },
        body: blob,
      });
      if (!putRes.ok) {
        throw new Error(`S3/MinIO yanıt hatası: ${putRes.status}`);
      }
      return;
    }

    // Mobil Native (Expo FileSystem ile yüksek performanslı binary akışı)
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        'Content-Type': mimeType,
      },
    });

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`Depolama sunucusu yükleme hatası (${uploadResult.status})`);
    }
  } catch (err: any) {
    throw new MediaUploadError(
      'storage-put',
      `Fotoğraf depolama alanına yüklenemedi: ${err.message}`,
      err
    );
  }
}

/**
 * 3. Adım: Yüklemeyi Doğrula ve Tamamla (EXIF temizliği ve WebP optimizasyonu tetiklenir)
 */
export async function completeMediaUpload(
  eventId: string,
  mediaId: string,
  accessToken: string
): Promise<EventMediaDto> {
  const baseUrl = getApiBaseUrl();
  let currentToken = accessToken;

  let response = await fetch(`${baseUrl}/events/${eventId}/media/${mediaId}/complete`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    },
  });

  // Oturum yenileme: 401 durumunda token yenileyip bir kez tekrar dene
  if (response.status === 401) {
    const refreshed = await useAuthStore.getState().getValidAccessToken();
    if (refreshed && refreshed !== currentToken) {
      currentToken = refreshed;
      response = await fetch(`${baseUrl}/events/${eventId}/media/${mediaId}/complete`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new MediaUploadError(
      'complete',
      data.message || 'Fotoğraf doğrulaması tamamlanamadı.',
      data
    );
  }

  return data as EventMediaDto;
}

/**
 * Tek Bir Fotoğrafın Uçtan Uca Yükleme Boru Hattı (Pipeline)
 */
export async function uploadSinglePhoto(
  eventId: string,
  photo: SelectedPhoto,
  accessToken: string
): Promise<EventMediaDto> {
  // 1. Presigned URL al
  const presigned = await getPresignedUploadUrl(
    eventId,
    photo.fileName,
    photo.mimeType,
    photo.fileSize,
    accessToken
  );

  // 2. Binary veriyi yükle
  await uploadBinaryToStorage(presigned.uploadUrl, photo.uri, photo.mimeType);

  // 3. Sunucu tarafı EXIF sanitizasyonu ve doğrulamayı tamamla
  const mediaResult = await completeMediaUpload(eventId, presigned.mediaId, accessToken);

  return mediaResult;
}
