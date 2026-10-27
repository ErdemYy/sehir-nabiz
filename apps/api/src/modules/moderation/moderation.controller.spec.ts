import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModerationController } from './moderation.controller';
import { EventsService } from '../events/events.service';
import { EventStatus } from '@sehir-nabiz/shared';

describe('ModerationController (Unit Tests)', () => {
  let controller: ModerationController;
  let eventsService: Partial<Record<keyof EventsService, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    eventsService = {
      getModerationEvents: vi.fn(),
      getModerationEventById: vi.fn(),
    };

    controller = new ModerationController(eventsService as any);
  });

  it('getModerationEvents query parametrelerini servise doğru iletmeli', async () => {
    const mockResponse = {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
    eventsService.getModerationEvents!.mockResolvedValue(mockResponse);

    const query = {
      status: EventStatus.PENDING_REVIEW,
      limit: 10,
    };

    const result = await controller.getModerationEvents(query as any);
    expect(eventsService.getModerationEvents).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockResponse);
  });

  it('getModerationEventById id parametresini servise doğru iletmeli', async () => {
    const mockDetail = {
      id: 'event-uuid-1',
      title: 'İnceleme Bekleyen Olay',
      feedbackSummary: { confirmCount: 5, disputeCount: 1, resolvedReportCount: 0, totalCount: 6 },
    };
    eventsService.getModerationEventById!.mockResolvedValue(mockDetail);

    const result = await controller.getModerationEventById('event-uuid-1');
    expect(eventsService.getModerationEventById).toHaveBeenCalledWith('event-uuid-1');
    expect(result).toEqual(mockDetail);
  });
});
