import {
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventSeverity, EventStatus } from '@sehir-nabiz/shared';

export class NearbyEventsDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Enlem sayısal olmalıdır' })
  @Min(-90, { message: 'Enlem -90 ile 90 arasında olmalıdır' })
  @Max(90, { message: 'Enlem -90 ile 90 arasında olmalıdır' })
  latitude!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Boylam sayısal olmalıdır' })
  @Min(-180, { message: 'Boylam -180 ile 180 arasında olmalıdır' })
  @Max(180, { message: 'Boylam -180 ile 180 arasında olmalıdır' })
  longitude!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Yarıçap sayısal olmalıdır' })
  @Min(50, { message: 'Yarıçap en az 50 metre olmalıdır' })
  @Max(50000, { message: 'Yarıçap en fazla 50 km (50000 metre) olabilir' })
  @IsOptional()
  radiusMeters?: number = 5000;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(EventSeverity)
  @IsOptional()
  severity?: EventSeverity;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  cursor?: string;
}
