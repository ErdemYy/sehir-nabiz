import {
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventSeverity } from '@sehir-nabiz/shared';

export class BBoxEventsDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Batı (West) boylamı sayısal olmalıdır' })
  @Min(-180)
  @Max(180)
  west!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Güney (South) enlemi sayısal olmalıdır' })
  @Min(-90)
  @Max(90)
  south!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Doğu (East) boylamı sayısal olmalıdır' })
  @Min(-180)
  @Max(180)
  east!: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Kuzey (North) enlemi sayısal olmalıdır' })
  @Min(-90)
  @Max(90)
  north!: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(EventSeverity)
  @IsOptional()
  severity?: EventSeverity;

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
