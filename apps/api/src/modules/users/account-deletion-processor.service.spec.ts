import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountDeletionProcessorService } from './account-deletion-processor.service';
import { DeletionRequestStatus } from '@sehir-nabiz/shared';

describe('AccountDeletionProcessorService (Unit Tests)', () => {
  let service: AccountDeletionProcessorService;
  let mockDeletionRepo: any;
  let mockDeletionService: any;

  beforeEach(() => {
    mockDeletionRepo = {
      find: vi.fn(),
      save: vi.fn(),
    };
    mockDeletionService = {
      executeDeletion: vi.fn(),
    };

    service = new AccountDeletionProcessorService(
      mockDeletionRepo as any,
      mockDeletionService as any,
    );
  });

  it('süresi dolan PENDING talepleri bulup PROCESSING yapmalı ve executeDeletion çalıştırmalı', async () => {
    const fakePendingRequest = {
      id: 'req-1',
      userId: 'user-1',
      status: DeletionRequestStatus.PENDING,
      scheduledFor: new Date(Date.now() - 1000),
      attemptCount: 0,
    };

    mockDeletionRepo.find.mockResolvedValue([fakePendingRequest]);
    mockDeletionService.executeDeletion.mockResolvedValue({ success: true, details: {} });

    const result = await service.processBatch();

    expect(result.processed).toBe(1);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(0);
    expect(fakePendingRequest.status).toBe(DeletionRequestStatus.PROCESSING);
    expect(fakePendingRequest.attemptCount).toBe(1);
    expect(mockDeletionService.executeDeletion).toHaveBeenCalledWith('user-1', 'req-1');
  });

  it('FAILED durumundaki talepleri tekrar denemeli', async () => {
    const fakeFailedRequest = {
      id: 'req-2',
      userId: 'user-2',
      status: DeletionRequestStatus.FAILED,
      attemptCount: 2,
    };

    mockDeletionRepo.find.mockResolvedValue([fakeFailedRequest]);
    mockDeletionService.executeDeletion.mockResolvedValue({ success: true, details: {} });

    const result = await service.processBatch();

    expect(result.processed).toBe(1);
    expect(result.succeeded).toBe(1);
    expect(fakeFailedRequest.attemptCount).toBe(3);
    expect(mockDeletionService.executeDeletion).toHaveBeenCalledWith('user-2', 'req-2');
  });

  it('attemptCount >= 5 olduğunda DEAD_LETTER olarak sayılmalı ve executeDeletion çağrılmamalı', async () => {
    const deadLetterRequest = {
      id: 'req-dead',
      userId: 'user-dead',
      status: DeletionRequestStatus.FAILED,
      attemptCount: 5,
      lastError: 'MinIO kalıcı erişim hatası',
    };

    mockDeletionRepo.find.mockResolvedValue([deadLetterRequest]);

    const result = await service.processBatch();

    expect(result.processed).toBe(0);
    expect(result.deadLetterCount).toBe(1);
    expect(mockDeletionService.executeDeletion).not.toHaveBeenCalled();
  });

  it('worker döngüsü başlatılabilmeli ve durdurulabilmeli', () => {
    service.startWorker();
    service.stopWorker();
    expect(true).toBe(true);
  });
});
