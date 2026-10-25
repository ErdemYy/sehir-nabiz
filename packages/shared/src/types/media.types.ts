import { MediaStatus } from '../enums';

export interface EventMediaDto {
  id: string;
  eventId: string;
  storageKey: string;
  url: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  status: MediaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadUrlRequestDto {
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | string;
  fileSize: number;
}

export interface UploadUrlResponseDto {
  mediaId: string;
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
}
