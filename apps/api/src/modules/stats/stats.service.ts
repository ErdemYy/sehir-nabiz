import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import {
  StatsPeriod,
  type StatsOverviewDto,
  type HeatmapResponseDto,
  type HeatmapPointDto,
  type CategoryStatDto,
  type TimelineStatDto,
  type DistrictStatDto,
} from '@sehir-nabiz/shared';
import { HeatmapQueryDto } from './dto';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Şehir Olay İstatistikleri Özeti (GET /stats/overview)
   * Yalnızca kamuya açık olaylar (ACTIVE, RESOLVED, DISPUTED) hesaba katılır.
   * Sonuçlar 60 saniye Redis önbelleğinde saklanır.
   */
  async getCityOverview(
    city: string = 'Kayseri',
    period: StatsPeriod = '7d',
  ): Promise<StatsOverviewDto> {
    const cacheKey = `stats:overview:${(city || 'all').toLowerCase()}:${period}`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as StatsOverviewDto;
      }
    } catch (err) {
      this.logger.warn(`Redis önbellek okuma hatası: ${(err as Error).message}`);
    }

    // Tarih aralığı belirleme
    let intervalClause = `INTERVAL '7 days'`;
    if (period === '24h') {
      intervalClause = `INTERVAL '24 hours'`;
    } else if (period === '30d') {
      intervalClause = `INTERVAL '30 days'`;
    } else if (period === 'all') {
      intervalClause = `INTERVAL '10 years'`;
    }

    const cityParam = city && city !== 'all' ? `%${city.trim()}%` : null;
    const params: unknown[] = [];
    let paramIndex = 1;

    let cityClause = '';
    if (cityParam) {
      cityClause = `AND e.city ILIKE $${paramIndex++}`;
      params.push(cityParam);
    }

    // 1. Özet Sayılar
    const summaryRows = await this.dataSource.query(
      `
      SELECT 
        COUNT(e.id)::int AS total_events,
        COUNT(e.id) FILTER (WHERE e.status = 'ACTIVE')::int AS active_events,
        COUNT(e.id) FILTER (WHERE e.status = 'RESOLVED')::int AS resolved_events,
        COUNT(e.id) FILTER (WHERE e.status = 'DISPUTED')::int AS disputed_events,
        COALESCE(ROUND(AVG(e."confirmationCount")::numeric, 1), 0)::float AS avg_confirmations
      FROM "events" e
      WHERE e.status IN ('ACTIVE', 'RESOLVED', 'DISPUTED')
        AND e."createdAt" >= NOW() - ${intervalClause}
        ${cityClause};
      `,
      params,
    );

    const summary = summaryRows[0] || {
      total_events: 0,
      active_events: 0,
      resolved_events: 0,
      disputed_events: 0,
      avg_confirmations: 0,
    };

    const totalEvents = summary.total_events || 0;
    const activeEvents = summary.active_events || 0;
    const resolvedEvents = summary.resolved_events || 0;
    const disputedEvents = summary.disputed_events || 0;
    const averageConfirmations = summary.avg_confirmations || 0;
    const resolutionRate = totalEvents > 0 ? Math.round((resolvedEvents / totalEvents) * 1000) / 10 : 0;

    // 2. Kategori Dağılımı
    const categoryRows = await this.dataSource.query(
      `
      SELECT 
        c.code AS category_code,
        c.name_tr AS category_name,
        c.color_hex AS color_hex,
        COUNT(e.id)::int AS count
      FROM "categories" c
      LEFT JOIN "events" e ON e."categoryId" = c.id
        AND e.status IN ('ACTIVE', 'RESOLVED', 'DISPUTED')
        AND e."createdAt" >= NOW() - ${intervalClause}
        ${cityClause}
      WHERE c.is_active = true
      GROUP BY c.id, c.code, c.name_tr, c.color_hex
      ORDER BY count DESC;
      `,
      params,
    );

    const categoryDistribution: CategoryStatDto[] = categoryRows.map((r: any) => ({
      categoryCode: r.category_code,
      categoryName: r.category_name,
      colorHex: r.color_hex,
      count: r.count,
      percentage: totalEvents > 0 ? Math.round((r.count / totalEvents) * 1000) / 10 : 0,
    }));

    // 3. Zaman Serisi / Trend (Günlük dilimler)
    const timelineRows = await this.dataSource.query(
      `
      SELECT 
        to_char(e."createdAt", 'YYYY-MM-DD') AS date,
        COUNT(e.id)::int AS count,
        COUNT(e.id) FILTER (WHERE e.status = 'RESOLVED')::int AS resolved_count
      FROM "events" e
      WHERE e.status IN ('ACTIVE', 'RESOLVED', 'DISPUTED')
        AND e."createdAt" >= NOW() - ${intervalClause}
        ${cityClause}
      GROUP BY to_char(e."createdAt", 'YYYY-MM-DD')
      ORDER BY date ASC;
      `,
      params,
    );

    const timeline: TimelineStatDto[] = timelineRows.map((r: any) => ({
      date: r.date,
      count: r.count,
      resolvedCount: r.resolved_count,
    }));

    // 4. İlçe Karşılaştırması
    const districtRows = await this.dataSource.query(
      `
      SELECT 
        COALESCE(NULLIF(TRIM(e.district), ''), 'Diğer') AS district,
        COUNT(e.id)::int AS count,
        COUNT(e.id) FILTER (WHERE e.status = 'RESOLVED')::int AS resolved_count
      FROM "events" e
      WHERE e.status IN ('ACTIVE', 'RESOLVED', 'DISPUTED')
        AND e."createdAt" >= NOW() - ${intervalClause}
        ${cityClause}
      GROUP BY COALESCE(NULLIF(TRIM(e.district), ''), 'Diğer')
      ORDER BY count DESC
      LIMIT 12;
      `,
      params,
    );

    const districtComparison: DistrictStatDto[] = districtRows.map((r: any) => ({
      district: r.district,
      count: r.count,
      resolvedCount: r.resolved_count,
      percentage: totalEvents > 0 ? Math.round((r.count / totalEvents) * 1000) / 10 : 0,
    }));

    const result: StatsOverviewDto = {
      city: city || 'Kayseri',
      period,
      totalEvents,
      activeEvents,
      resolvedEvents,
      disputedEvents,
      averageConfirmations,
      resolutionRate,
      categoryDistribution,
      timeline,
      districtComparison,
      disclaimer:
        'İstatistikler ŞehirNabız üzerinde yayınlanan kullanıcı bildirimlerine dayanmaktadır; tüm gerçek olayların eksiksiz kaydını temsil etmez.',
    };

    // Önbelleğe kaydet (60 saniye TTL)
    try {
      const client = (this.redisService as any).client;
      if (client && this.redisService.isReady) {
        await client.set(cacheKey, JSON.stringify(result), 'EX', 60);
      }
    } catch (err) {
      this.logger.warn(`Redis önbellek yazma uyarısı: ${(err as Error).message}`);
    }

    return result;
  }

  /**
   * Coğrafi Yoğunluk / Isı Haritası Agregasyonu (GET /stats/heatmap)
   * İlk 300 olayla sınırlama yapmaz; tüm BBox içindeki olayları ızgara (grid) tabanlı özetler.
   */
  async getHeatmap(query: HeatmapQueryDto): Promise<HeatmapResponseDto> {
    const { minLng, minLat, maxLng, maxLat, category, period } = query;

    const params: unknown[] = [minLng, minLat, maxLng, maxLat];
    let paramIndex = 5;

    let categoryClause = '';
    if (category) {
      categoryClause = `AND (c.code = $${paramIndex} OR c.id::text = $${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    let intervalClause = `INTERVAL '30 days'`;
    if (period === '24h') {
      intervalClause = `INTERVAL '24 hours'`;
    } else if (period === '7d') {
      intervalClause = `INTERVAL '7 days'`;
    } else if (period === 'all') {
      intervalClause = `INTERVAL '10 years'`;
    }

    // PostGIS Izgara / Koordinat Gruplaması (3 ondalık basamak ~ 110 metre)
    // Bu sayede on binlerce olay olsa dahi harita aşırı yüklenmeden gerçek bildirim yoğunluğu gösterilir.
    const clusterRows = await this.dataSource.query(
      `
      SELECT 
        ROUND(ST_Y(e.location)::numeric, 3)::float AS latitude,
        ROUND(ST_X(e.location)::numeric, 3)::float AS longitude,
        COUNT(e.id)::int AS count,
        MAX(c.code) AS category_code
      FROM "events" e
      INNER JOIN "categories" c ON c.id = e."categoryId"
      WHERE e.location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        AND e.status IN ('ACTIVE', 'RESOLVED', 'DISPUTED')
        AND e."createdAt" >= NOW() - ${intervalClause}
        ${categoryClause}
      GROUP BY ROUND(ST_Y(e.location)::numeric, 3), ROUND(ST_X(e.location)::numeric, 3)
      ORDER BY count DESC
      LIMIT 1000;
      `,
      params,
    );

    const threshold = query.minCount && query.minCount > 1 ? query.minCount : 1;
    let maxCount = 1;
    let totalPoints = 0;
    let suppressedPoints = 0;
    const filteredRows: any[] = [];

    for (const row of clusterRows) {
      totalPoints += row.count;
      if (row.count < threshold) {
        suppressedPoints += row.count;
      } else {
        filteredRows.push(row);
        if (row.count > maxCount) {
          maxCount = row.count;
        }
      }
    }

    // Normalleştirilmiş ağırlık hesabı (0.1 - 1.0)
    const points: HeatmapPointDto[] = filteredRows.map((r: any) => {
      const weight = Math.min(1.0, Math.max(0.1, Math.round((r.count / maxCount) * 100) / 100));
      return {
        latitude: r.latitude,
        longitude: r.longitude,
        weight,
        count: r.count,
        categoryCode: r.category_code,
      };
    });

    return {
      totalPoints,
      aggregatedClusterCount: points.length,
      points,
      suppressedPoints,
      kAnonymityThreshold: threshold,
      disclaimer:
        'Yoğunluk haritası gizlilik korumalı mekânsal agregasyonla üretilmektedir; tekil olay konumlarını doğrudan temsil etmez ve resmî tehlike veya risk haritası değildir.',
    };
  }
}
