import type { StatsPeriod } from '@sehir-nabiz/shared';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class StatsOverviewQueryDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsIn(['24h', '7d', '30d', 'all'])
  period?: StatsPeriod;
}
