import { z } from 'zod';

export const MediaMimeTypeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const UploadUrlInputSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, 'Dosya adı boş bırakılamaz')
    .max(255, 'Dosya adı en fazla 255 karakter olabilir'),
  mimeType: MediaMimeTypeSchema,
  fileSize: z
    .number()
    .int()
    .min(1, 'Dosya boyutu 0 dan büyük olmalıdır')
    .max(8 * 1024 * 1024, 'Dosya boyutu en fazla 8 MB olabilir'),
});

export type UploadUrlInput = z.infer<typeof UploadUrlInputSchema>;
