import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EventStatus } from '@sehir-nabiz/shared';

export class UpdateEventStatusDto {
  @IsEnum(EventStatus, { message: 'Geçersiz olay durumu' })
  status!: EventStatus;

  @IsString({ message: 'Gerekçe metin formatında olmalıdır' })
  @MaxLength(500, { message: 'Gerekçe en fazla 500 karakter olabilir' })
  @IsOptional()
  reason?: string;
}
