import {
  IsString,
  MinLength,
  MaxLength,
  IsIn,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export class UploadUrlDto {
  @IsString({ message: 'Dosya adı metin formatında olmalıdır' })
  @MinLength(1, { message: 'Dosya adı boş bırakılamaz' })
  @MaxLength(255, { message: 'Dosya adı en fazla 255 karakter olabilir' })
  fileName!: string;

  @IsString({ message: 'MIME tipi belirtilmelidir' })
  @IsIn(ALLOWED_MIME_TYPES, {
    message: 'Yalnızca JPEG, PNG ve WebP formatında raster görseller desteklenir.',
  })
  mimeType!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Dosya boyutu sayısal olmalıdır' })
  @Min(1, { message: 'Dosya boyutu 0 dan büyük olmalıdır' })
  @Max(8 * 1024 * 1024, { message: 'Dosya boyutu en fazla 8 MB olabilir' })
  fileSize!: number;
}
