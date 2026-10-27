import { EventCategory, StatsPeriod } from '@sehir-nabiz/shared';

export class HeatmapQueryDto {
  minLng!: number;
  minLat!: number;
  maxLng!: number;
  maxLat!: number;
  category?: EventCategory;
  period?: StatsPeriod;
  precision?: number;
}
