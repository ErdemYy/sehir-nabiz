import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, EventSeverity } from '@sehir-nabiz/shared';

export class ModerationEventsQueryDto {
  @IsOptional()
  @IsEnum(EventStatus, { message: 'Geçersiz durum filtresi.' })
  status?: EventStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(EventSeverity, { message: 'Geçersiz önem seviyesi.' })
  severity?: EventSeverity;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit tam sayı olmalıdır.' })
  @Min(1, { message: 'Limit en az 1 olmalıdır.' })
  @Max(100, { message: 'Limit en fazla 100 olabilir.' })
  limit: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;
}
