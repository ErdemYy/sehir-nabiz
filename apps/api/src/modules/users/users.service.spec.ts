import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersService } from './users.service';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { EventEntity } from '../../database/entities/event.entity';
import { EventFeedbackEntity } from '../../database/entities/event-feedback.entity';
import { EventStatus, EventSeverity } from '@sehir-nabiz/shared';

describe('UsersService (Unit Tests)', () => {
  let service: UsersService;
  let mockUserRepo: Partial<Repository<UserEntity>>;
  let mockEventRepo: Partial<Repository<EventEntity>>;
  let mockFeedbackRepo: Partial<Repository<EventFeedbackEntity>>;
  let mockDataSource: Partial<DataSource>;

  beforeEach(() => {
    mockUserRepo = {
      findOne: vi.fn(),
    };
    mockEventRepo = {
      count: vi.fn(),
    };
    mockFeedbackRepo = {
      count: vi.fn(),
    };
    mockDataSource = {
      query: vi.fn(),
    };

    service = new UsersService(
      mockUserRepo as Repository<UserEntity>,
      mockEventRepo as Repository<EventEntity>,
      mockFeedbackRepo as Repository<EventFeedbackEntity>,
      mockDataSource as DataSource,
    );
  });

  describe('getMyStats', () => {
    it('kullanıcının gerçek verilerini hesaplamalı ve rütbe düzeyini belirlemeli', async () => {
      vi.mocked(mockUserRepo.findOne!).mockResolvedValue({
        id: 'user-uuid-1',
        reputationScore: 55,
      } as UserEntity);

      vi.mocked(mockEventRepo.count!)
        .mockResolvedValueOnce(8) // reportedCount
        .mockResolvedValueOnce(3); // resolvedCount

      vi.mocked(mockFeedbackRepo.count!)
        .mockResolvedValueOnce(15) // confirmedCount
        .mockResolvedValueOnce(2); // disputedCount

      const result = await service.getMyStats('user-uuid-1');

      expect(result.reportedCount).toBe(8);
      expect(result.resolvedCount).toBe(3);
      expect(result.confirmedCount).toBe(15);
      expect(result.disputedCount).toBe(2);
      expect(result.reputationScore).toBe(55);
      expect(result.reputationLevel).toContain('Güvenilir Gözlemci');
    });

    it('kullanıcı bulunamadığında NotFoundException fırlatmalı', async () => {
      vi.mocked(mockUserRepo.findOne!).mockResolvedValue(null);
      await expect(service.getMyStats('missing-uuid')).rejects.toThrow('Kullanıcı hesabı bulunamadı');
    });
  });

  describe('getMyEvents', () => {
    it('yalnızca kullanıcının kendi olaylarını listelemeli ve reddedilenlerde gerekçeyi sunmalı', async () => {
      vi.mocked(mockDataSource.query!).mockResolvedValueOnce([
        {
          id: 'event-uuid-1',
          title: 'Çalışma Bildirimi',
          description: 'Açıklama',
          severity: EventSeverity.MEDIUM,
          status: EventStatus.REJECTED,
          addressText: 'Sivas Cad.',
          city: 'Kayseri',
          district: 'Melikgazi',
          confirmationCount: 0,
          disputeCount: 0,
          createdAt: new Date('2026-10-26T10:00:00Z'),
          updatedAt: new Date('2026-10-26T11:00:00Z'),
          latitude: '38.72',
          longitude: '35.48',
          category_code: 'ROAD_WORK',
          category_name: 'Yol Çalışması',
          category_color: '#F59E0B',
          rejection_reason: 'Mükerrer ve asılsız bildirim.',
        },
      ]);

      const result = await service.getMyEvents('user-uuid-1', { limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe('event-uuid-1');
      expect(result.items[0]?.status).toBe(EventStatus.REJECTED);
      expect(result.items[0]?.rejectionReason).toBe('Mükerrer ve asılsız bildirim.');
      expect(result.hasMore).toBe(false);
    });
  });
});
