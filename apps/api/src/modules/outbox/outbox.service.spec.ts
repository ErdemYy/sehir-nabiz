import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OutboxService } from './outbox.service';
import { OutboxStatus } from '@sehir-nabiz/shared';

describe('OutboxService (Unit Tests)', () => {
  let service: OutboxService;
  let mockManager: any;
  let mockOutboxRepo: any;

  beforeEach(() => {
    mockOutboxRepo = {
      create: vi.fn((data: any) => ({
        id: 'outbox-uuid-1',
        ...data,
      })),
      save: vi.fn(async (entity: any) => entity),
    };

    mockManager = {
      getRepository: vi.fn().mockReturnValue(mockOutboxRepo),
    };

    service = new OutboxService();
  });

  describe('createOutboxEvent', () => {
    it('transaction manager üzerinden PENDING durumunda atomik outbox kaydı oluşturmalı', async () => {
      const payload = {
        eventId: 'event-uuid-1',
        title: 'Trafik Tıkanıklığı',
        authorId: 'user-uuid-1',
      };

      const result = await service.createOutboxEvent(
        mockManager,
        'Event',
        'event-uuid-1',
        'EVENT_CREATED',
        payload,
      );

      expect(mockManager.getRepository).toHaveBeenCalled();
      expect(mockOutboxRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateType: 'Event',
          aggregateId: 'event-uuid-1',
          eventType: 'EVENT_CREATED',
          status: OutboxStatus.PENDING,
          attempts: 0,
        }),
      );
      expect(mockOutboxRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('outbox-uuid-1');
      expect(result.payload.title).toBe('Trafik Tıkanıklığı');
    });

    it('hassas verileri (şifre, token) outbox payloadından tamamen arındırmalı (Sanitization)', async () => {
      const sensitivePayload = {
        eventId: 'event-uuid-2',
        title: 'Su Kesintisi',
        password: 'plain_password',
        passwordHash: 'hash_secret',
        accessToken: 'jwt_access',
        refreshToken: 'jwt_refresh',
        buffer: Buffer.from('large_blob'),
        safeField: 'güvenli_veri',
      };

      const result = await service.createOutboxEvent(
        mockManager,
        'Event',
        'event-uuid-2',
        'EVENT_STATUS_CHANGED',
        sensitivePayload,
      );

      expect(result.payload.safeField).toBe('güvenli_veri');
      expect(result.payload.title).toBe('Su Kesintisi');
      expect((result.payload as any).password).toBeUndefined();
      expect((result.payload as any).passwordHash).toBeUndefined();
      expect((result.payload as any).accessToken).toBeUndefined();
      expect((result.payload as any).refreshToken).toBeUndefined();
      expect((result.payload as any).buffer).toBeUndefined();
    });
  });
});
