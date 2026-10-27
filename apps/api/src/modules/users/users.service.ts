import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { EventEntity } from '../../database/entities/event.entity';
import { EventFeedbackEntity } from '../../database/entities/event-feedback.entity';
import { FeedbackType, EventStatus, type UserStatsDto, type MyEventResponseDto } from '@sehir-nabiz/shared';
import { MyEventsQueryDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(EventFeedbackEntity)
    private readonly feedbackRepo: Repository<EventFeedbackEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Kullanıcının Gerçek Katkı İstatistikleri (GET /users/me/stats)
   */
  async getMyStats(userId: string): Promise<UserStatsDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { id: true, reputationScore: true },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı hesabı bulunamadı.');
    }

    // Gerçek veritabanı sorguları (sahte veya hayalî veri üretilmez)
    const [reportedCount, resolvedCount, confirmedCount, disputedCount] = await Promise.all([
      // Kullanıcının bildirdiği tüm olaylar
      this.eventRepo.count({
        where: { authorId: userId },
      }),
      // Kullanıcının bildirdiği ve çözülen olaylar
      this.eventRepo.count({
        where: { authorId: userId, status: EventStatus.RESOLVED },
      }),
      // Kullanıcının teyit ettiği olaylar (CONFIRM)
      this.feedbackRepo.count({
        where: { userId, type: FeedbackType.CONFIRM },
      }),
      // Kullanıcının itiraz ettiği olaylar (DISPUTE)
      this.feedbackRepo.count({
        where: { userId, type: FeedbackType.DISPUTE },
      }),
    ]);

    // İtibar Skoru Seviyesi Açıklaması
    const score = user.reputationScore ?? 10;
    let reputationLevel = 'Topluluk Gözlemcisi (Seviye 1)';
    if (score >= 100) {
      reputationLevel = 'Şehir Koruyucusu (Seviye 4)';
    } else if (score >= 50) {
      reputationLevel = 'Güvenilir Gözlemci (Seviye 3)';
    } else if (score >= 20) {
      reputationLevel = 'Aktif Vatandaş (Seviye 2)';
    }

    return {
      reportedCount,
      confirmedCount,
      resolvedCount,
      disputedCount,
      reputationScore: score,
      reputationLevel,
    };
  }

  /**
   * Kullanıcının Kendi Bildirdiği Olaylar (GET /users/me/events)
   * Yalnızca kullanıcının kendi bildirimleri döndürülür; başkalarının gizli olayları sızdırılmaz.
   */
  async getMyEvents(
    userId: string,
    query: MyEventsQueryDto,
  ): Promise<{ items: MyEventResponseDto[]; nextCursor: string | null; hasMore: boolean }> {
    const limit = Math.min(Math.max(query.limit || 20, 1), 50);
    const params: unknown[] = [userId];
    let paramIndex = 2;

    let statusClause = '';
    if (query.status) {
      statusClause = `AND e.status = $${paramIndex++}`;
      params.push(query.status);
    }

    let cursorClause = '';
    if (query.cursor) {
      try {
        const decoded = Buffer.from(query.cursor, 'base64').toString('utf8');
        const [cursorDate, cursorId] = decoded.split('_');
        if (cursorDate && cursorId) {
          cursorClause = `
            AND (
              e."createdAt" < $${paramIndex}
              OR (e."createdAt" = $${paramIndex} AND e.id > $${paramIndex + 1})
            )
          `;
          params.push(new Date(cursorDate), cursorId);
          paramIndex += 2;
        }
      } catch (err) {
        this.logger.warn(`Geçersiz my-events cursor: ${query.cursor}`);
      }
    }

    params.push(limit + 1);
    const limitParam = `$${paramIndex}`;

    // Reddedilen olaylar için moderasyon gerekçesini son log kaydından çekiyoruz
    const rawRows = await this.dataSource.query(
      `
      SELECT 
        e.id, e.title, e.description, e.severity, e.status,
        e."addressText", e.city, e.district,
        e."confirmationCount", e."disputeCount",
        e."createdAt", e."updatedAt",
        ST_X(e.location) AS longitude,
        ST_Y(e.location) AS latitude,
        c.code AS category_code, c.name_tr AS category_name, c.color_hex AS category_color,
        (
          SELECT l.reason 
          FROM "event_moderation_logs" l 
          WHERE l."eventId" = e.id AND l."newStatus" = 'REJECTED'
          ORDER BY l."createdAt" DESC 
          LIMIT 1
        ) AS rejection_reason
      FROM "events" e
      INNER JOIN "categories" c ON c.id = e."categoryId"
      WHERE e."authorId" = $1
        ${statusClause}
        ${cursorClause}
      ORDER BY e."createdAt" DESC, e.id ASC
      LIMIT ${limitParam};
      `,
      params,
    );

    const hasMore = rawRows.length > limit;
    const itemsRows = hasMore ? rawRows.slice(0, limit) : rawRows;

    let nextCursor: string | null = null;
    if (hasMore && itemsRows.length > 0) {
      const last = itemsRows[itemsRows.length - 1];
      const rawCursor = `${new Date(last.createdAt).toISOString()}_${last.id}`;
      nextCursor = Buffer.from(rawCursor, 'utf8').toString('base64');
    }

    const items: MyEventResponseDto[] = itemsRows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      severity: r.severity,
      status: r.status,
      categoryCode: r.category_code,
      categoryName: r.category_name,
      categoryColor: r.category_color,
      location: {
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
      },
      addressText: r.addressText || null,
      city: r.city || null,
      district: r.district || null,
      confirmationCount: r.confirmationCount || 0,
      disputeCount: r.disputeCount || 0,
      rejectionReason: r.status === EventStatus.REJECTED ? r.rejection_reason || 'Moderatör tarafından uygun bulunmadı.' : null,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));

    return {
      items,
      nextCursor,
      hasMore,
    };
  }
}
