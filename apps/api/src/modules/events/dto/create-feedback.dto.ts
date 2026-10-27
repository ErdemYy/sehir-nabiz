import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { FeedbackType } from '@sehir-nabiz/shared';

export class CreateFeedbackDto {
  @IsEnum(FeedbackType, {
    message: 'Geçersiz geri bildirim türü. CONFIRM, DISPUTE veya RESOLVED_REPORT seçilmelidir.',
  })
  type!: FeedbackType;

  @IsOptional()
  @IsString({ message: 'Gerekçe metin formatında olmalıdır.' })
  @MaxLength(500, { message: 'Gerekçe en fazla 500 karakter olabilir.' })
  reason?: string;
}
