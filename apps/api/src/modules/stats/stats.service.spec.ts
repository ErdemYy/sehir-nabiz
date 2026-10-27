import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsService } from './stats.service';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';

describe('StatsService (Unit Tests)', () => {
  let service: StatsService;
  let mockDataSource: Partial<DataSource>;
  let mockRedisService: Partial<RedisService>;

  beforeEach(() => {
    mockDataSource = {
      query: vi.fn(),
    };

    mockRedisService = {
      get: vi.fn().mockResolvedValue(null),
      isReady: false,
    };

    service = new StatsService(
      mockDataSource as DataSource,
      mockRedisService as RedisService,
    );
  });

  describe('getCityOverview', () => {
    it('şehir genel istatistiklerini doğru hesaplamalı ve disclaimer içermeli', async () => {
      // 1. query (summary)
      // 2. query (categories)
      // 3. query (timeline)
      // 4. query (districts)
      vi.mocked(mockDataSource.query!)
        .mockResolvedValueOnce([
          {
            total_events: 10,
            active_events: 6,
            resolved_events: 3,
            disputed_events: 1,
            avg_confirmations: 4.5,
          },
        ])
        .mockResolvedValueOnce([
          {
            category_code: 'TRAFFIC_ACCIDENT',
            category_name: 'Trafik Kazası',
            color_hex: '#EF4444',
            count: 7,
          },
          {
            category_code: 'ROAD_WORK',
            category_name: 'Yol Çalışması',
            color_hex: '#F59E0B',
            count: 3,
          },
        ])
        .mockResolvedValueOnce([
          { date: '2026-10-25', count: 4, resolved_count: 1 },
          { date: '2026-10-26', count: 6, resolved_count: 2 },
        ])
        .mockResolvedValueOnce([
          { district: 'Melikgazi', count: 6, resolved_count: 2 },
          { district: 'Kocasinan', count: 4, resolved_count: 1 },
        ]);

      const result = await service.getCityOverview('Kayseri', '7d');

      expect(result.city).toBe('Kayseri');
      expect(result.totalEvents).toBe(10);
      expect(result.activeEvents).toBe(6);
      expect(result.resolvedEvents).toBe(3);
      expect(result.disputedEvents).toBe(1);
      expect(result.resolutionRate).toBe(30);
      expect(result.averageConfirmations).toBe(4.5);
      expect(result.categoryDistribution).toHaveLength(2);
      expect(result.categoryDistribution[0]?.percentage).toBe(70);
      expect(result.timeline).toHaveLength(2);
      expect(result.districtComparison).toHaveLength(2);
      expect(result.disclaimer).toContain('tüm gerçek olayların eksiksiz kaydını temsil etmez');
    });

    it('veri olmadığında sıfır değerli boş özet dönmeli', async () => {
      vi.mocked(mockDataSource.query!)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getCityOverview('BilinmeyenSehir', '24h');

      expect(result.totalEvents).toBe(0);
      expect(result.activeEvents).toBe(0);
      expect(result.resolutionRate).toBe(0);
      expect(result.categoryDistribution).toHaveLength(0);
      expect(result.timeline).toHaveLength(0);
      expect(result.districtComparison).toHaveLength(0);
    });

    it('Redis önbelleğinde kayıt varsa doğrudan önbellekten dönmeli', async () => {
      const cachedData = {
        city: 'Kayseri',
        period: '7d',
        totalEvents: 42,
        activeEvents: 20,
        resolvedEvents: 22,
        disputedEvents: 0,
        averageConfirmations: 5,
        resolutionRate: 52.4,
        categoryDistribution: [],
        timeline: [],
        districtComparison: [],
        disclaimer: 'cached',
      };
      mockRedisService.get = vi.fn().mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getCityOverview('Kayseri', '7d');
      expect(result.totalEvents).toBe(42);
      expect(mockDataSource.query).not.toHaveBeenCalled();
    });
  });

  describe('getHeatmap', () => {
    it('coğrafi BBox için ızgara kümeleme noktalarını ve ağırlıkları hesaplamalı', async () => {
      vi.mocked(mockDataSource.query!).mockResolvedValueOnce([
        { latitude: 38.72, longitude: 35.48, count: 20, category_code: 'TRAFFIC_ACCIDENT' },
        { latitude: 38.73, longitude: 35.49, count: 10, category_code: 'ROAD_WORK' },
        { latitude: 38.70, longitude: 35.45, count: 2, category_code: 'WATER_OUTAGE' },
      ]);

      const result = await service.getHeatmap({
        minLng: 35.4,
        minLat: 38.6,
        maxLng: 35.6,
        maxLat: 38.8,
        period: '30d',
      });

      expect(result.totalPoints).toBe(32);
      expect(result.aggregatedClusterCount).toBe(3);
      expect(result.points[0]?.weight).toBe(1.0); // 20 / 20 = 1.0
      expect(result.points[1]?.weight).toBe(0.5); // 10 / 20 = 0.5
      expect(result.points[2]?.weight).toBe(0.1); // min weight
      expect(result.disclaimer).toContain('resmî tehlike veya risk haritası değildir');
    });
  });
});
