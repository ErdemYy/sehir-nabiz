import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  AccountDeletionRequestEntity,
} from '../../database/entities/account-deletion-request.entity';
import {
  DeletionRequestStatus,
} from '@sehir-nabiz/shared';
import { AccountDeletionService } from './account-deletion.service';

@Injectable()
export class AccountDeletionProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AccountDeletionProcessorService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private isShuttingDown = false;

  // Konfigürasyon
  private readonly maxAttempts = 5;
  private readonly pollIntervalMs = 5000;

  constructor(
    @InjectRepository(AccountDeletionRequestEntity)
    private readonly deletionRepo: Repository<AccountDeletionRequestEntity>,
    private readonly deletionService: AccountDeletionService,
  ) {}

  onModuleInit(): void {
    // Test veya CI ortamında otomatik loop istenmeyebilir
    if (process.env.NODE_ENV !== 'test') {
      this.startWorker();
    }
  }

  onModuleDestroy(): void {
    this.stopWorker();
  }

  startWorker(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.processBatch().catch(err => {
        this.logger.error(`[AccountDeletion Worker] Hata: ${(err as Error).message}`);
      });
    }, this.pollIntervalMs);
    this.logger.log(`[AccountDeletion Worker] Başlatıldı (Interval: ${this.pollIntervalMs}ms)`);
  }

  stopWorker(): void {
    this.isShuttingDown = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Süresi dolan PENDING veya yeniden denenecek FAILED talepleri işler
   */
  async processBatch(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    deadLetterCount: number;
  }> {
    if (this.isProcessing || this.isShuttingDown) {
      return { processed: 0, succeeded: 0, failed: 0, deadLetterCount: 0 };
    }
    this.isProcessing = true;

    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    let deadLetterCount = 0;

    try {
      const now = new Date();

      // 1. Süresi dolan PENDING kayıtlar veya retry edilecek FAILED kayıtlar
      const eligibleRequests = await this.deletionRepo.find({
        where: [
          {
            status: DeletionRequestStatus.PENDING,
            scheduledFor: LessThanOrEqual(now),
          },
          {
            status: DeletionRequestStatus.FAILED,
          },
        ],
        order: { createdAt: 'ASC' },
        take: 10,
      });

      for (const req of eligibleRequests) {
        if (this.isShuttingDown) break;

        // Azami deneme kontrolü (Dead-Letter ve Operasyonel Uyarı)
        if (req.attemptCount >= this.maxAttempts) {
          deadLetterCount++;
          this.logger.error(
            `[CRITICAL ALERT - DEAD_LETTER] Hesap silme talebi azami deneme (${this.maxAttempts}) sınırına ulaştı: ` +
              `RequestId=${req.id}, UserId=${req.userId}, Son Hata="${req.lastError}". Manuel müdahale gereklidir!`,
          );
          continue;
        }

        processed++;

        // Durumu PROCESSING olarak güncelle (State Machine)
        req.status = DeletionRequestStatus.PROCESSING;
        req.attemptCount += 1;
        await this.deletionRepo.save(req);

        try {
          const result = await this.deletionService.executeDeletion(req.userId, req.id);
          if (result.success) {
            succeeded++;
          } else {
            failed++;
          }
        } catch (err) {
          failed++;
          this.logger.warn(
            `[AccountDeletion Worker] İşlem hatası (Req ID: ${req.id}): ${(err as Error).message}`,
          );
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return { processed, succeeded, failed, deadLetterCount };
  }
}
