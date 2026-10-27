import { EventCategory } from '@sehir-nabiz/shared';

export class SearchEventsDto {
  q!: string;
  category?: EventCategory;
  city?: string;
  district?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: string;
}
