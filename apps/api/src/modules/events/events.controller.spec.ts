import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { FeedbackType } from '@sehir-nabiz/shared';

describe('EventsController (Unit Tests)', () => {
  let controller: EventsController;
  let eventsService: Partial<Record<keyof EventsService, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    eventsService = {
      create: vi.fn(),
      findNearby: vi.fn(),
      findBBox: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      submitFeedback: vi.fn(),
      removeFeedback: vi.fn(),
      getFeedbackSummary: vi.fn(),
    };

    controller = new EventsController(eventsService as any);
  });

  it('submitFeedback doğru parametrelerle eventsService.submitFeedback çağırmalı', async () => {
    const mockSummary = {
      eventId: 'event-uuid-1',
      confirmCount: 1,
      disputeCount: 0,
      resolvedReportCount: 0,
      totalCount: 1,
      userFeedback: null,
      hasSufficientSample: false,
      communityAssessment: 'Yetersiz',
      disclaimer: 'Uyarı',
    };
    eventsService.submitFeedback!.mockResolvedValue(mockSummary);

    const req: any = { user: { sub: 'user-uuid-1' } };
    const dto = { type: FeedbackType.CONFIRM, reason: 'Gördüm' };

    const result = await controller.submitFeedback(req, 'event-uuid-1', dto as any);
    expect(eventsService.submitFeedback).toHaveBeenCalledWith('event-uuid-1', 'user-uuid-1', dto);
    expect(result).toEqual(mockSummary);
  });

  it('removeFeedback doğru parametrelerle eventsService.removeFeedback çağırmalı', async () => {
    const mockSummary = {
      eventId: 'event-uuid-1',
      confirmCount: 0,
      disputeCount: 0,
      resolvedReportCount: 0,
      totalCount: 0,
      userFeedback: null,
      hasSufficientSample: false,
      communityAssessment: 'Yetersiz',
      disclaimer: 'Uyarı',
    };
    eventsService.removeFeedback!.mockResolvedValue(mockSummary);

    const req: any = { user: { sub: 'user-uuid-1' } };

    const result = await controller.removeFeedback(req, 'event-uuid-1');
    expect(eventsService.removeFeedback).toHaveBeenCalledWith('event-uuid-1', 'user-uuid-1');
    expect(result).toEqual(mockSummary);
  });

  it('getFeedbackSummary doğru parametrelerle eventsService.getFeedbackSummary çağırmalı', async () => {
    const mockSummary = {
      eventId: 'event-uuid-1',
      confirmCount: 5,
      disputeCount: 1,
      resolvedReportCount: 0,
      totalCount: 6,
      userFeedback: null,
      hasSufficientSample: true,
      communityAssessment: '5 kişi gördü',
      disclaimer: 'Uyarı',
    };
    eventsService.getFeedbackSummary!.mockResolvedValue(mockSummary);

    const req: any = { user: { sub: 'user-uuid-1' } };

    const result = await controller.getFeedbackSummary(req, 'event-uuid-1');
    expect(eventsService.getFeedbackSummary).toHaveBeenCalledWith('event-uuid-1', 'user-uuid-1', req.user);
    expect(result).toEqual(mockSummary);
  });
});
