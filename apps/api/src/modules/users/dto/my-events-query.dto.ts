import { EventStatus } from '@sehir-nabiz/shared';

export class MyEventsQueryDto {
  status?: EventStatus;
  limit?: number;
  cursor?: string;
}
