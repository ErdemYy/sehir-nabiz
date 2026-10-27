import type { EventCategory, StatsPeriod } from '@sehir-nabiz/shared';
import { IsNumber, IsOptional, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class HeatmapQueryDto {
  @Type(() => Number)
  @IsNumber()
  minLng!: number;

  @Type(() => Number)
  @IsNumber()
  minLat!: number;

  @Type(() => Number)
  @IsNumber()
  maxLng!: number;

  @Type(() => Number)
  @IsNumber()
  maxLat!: number;

  @IsOptional()
  @IsString()
  category?: EventCategory;

  @IsOptional()
  @IsIn(['24h', '7d', '30d', 'all'])
  period?: StatsPeriod;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  precision?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  minCount?: number;
}
