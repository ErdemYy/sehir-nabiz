import type { EventSeverity } from '@sehir-nabiz/shared';

export type CreateEventStep = 1 | 2 | 3;

export interface SelectedPhoto {
  id: string; // İstemci tarafı benzersiz UUID
  uri: string; // Dosya URI'si (yönetilen yerel kopyası)
  fileName: string;
  fileSize: number;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  uploadStatus: 'idle' | 'uploading' | 'completed' | 'failed';
  uploadProgress?: number;
  uploadError?: string;
  mediaId?: string;
}

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  addressText?: string;
  district?: string;
  city?: string;
}

export interface EventDraft {
  step: CreateEventStep;
  categoryId: string | null;
  categoryCode: string | null;
  categoryNameTr: string | null;
  title: string;
  description: string;
  severity: EventSeverity;
  location: SelectedLocation | null;
  photos: SelectedPhoto[];
  updatedAt: number;
}
