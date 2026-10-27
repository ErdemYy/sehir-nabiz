import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEntity } from '../../database/entities/event.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { EventModerationLogEntity } from '../../database/entities/event-moderation-log.entity';
import { EventFeedbackEntity } from '../../database/entities/event-feedback.entity';
import { UserReputationLogEntity } from '../../database/entities/user-reputation-log.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { NotificationsService } from '../notifications/notifications.service';
import { OutboxService, OutboxProcessorService } from '../outbox';
import {
  EventStatus,
  EventSeverity,
  UserRole,
  AccountStatus,
  JwtPayload,
  EventResponseDto,
  PaginatedEventsResponse,
  FeedbackType,
  FeedbackSummaryDto,
  ModerationEventItemDto,
  PaginatedModerationEventsResponse,
  NotificationType,
} from '@sehir-nabiz/shared';
import {
  CreateEventDto,
  NearbyEventsDto,
  BBoxEventsDto,
  UpdateEventStatusDto,
  CreateFeedbackDto,
  ModerationEventsQueryDto,
  SearchEventsDto,
} from './dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(EventModerationLogEntity)
    private readonly moderationLogRepository: Repository<EventModerationLogEntity>,
    @InjectRepository(EventFeedbackEntity)
    private readonly feedbackRepository: Repository<EventFeedbackEntity>,
    @InjectRepository(UserReputationLogEntity)
    private readonly reputationLogRepository: Repository<UserReputationLogEntity>,
    private readonly dataSource: DataSource,
    @Optional()
    private readonly realtimeService?: RealtimeService,
    @Optional()
    private readonly notificationsService?: NotificationsService,
    @Optional()
    private readonly outboxService?: OutboxService,
    @Optional()
    private readonly outboxProcessor?: OutboxProcessorService,
  ) {}

  /**
   * Güvenli Olay Oluşturma (POST /events)
   * - JWT'den authorId
   * - Zod & DTO doğrulama
   * - 150m / 45dk mükerrerlik uyarısı kontrolü
   * - Başlangıç durumu: PENDING_REVIEW
   */
  async create(authorId: string, dto: CreateEventDto): Promise<EventResponseDto> {
    // 1. Kullanıcı kontrolü
    const user = await this.userRepository.findOne({ where: { id: authorId } });
    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Hesabınız aktif değil veya bildirim yetkiniz kısıtlanmış.');
    }

    // 2. Kategori kontrolü
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId, isActive: true },
    });
    if (!category) {
      throw new BadRequestException('Seçilen kategori geçerli değil veya pasif durumda.');
    }

    // 3. Mükerrer Olay (Duplicate) Kontrolü (150m, 45 dk, aynı kategori)
    const duplicateCandidate = await this.checkDuplicateCandidate(
      dto.categoryId,
      dto.longitude,
      dto.latitude,
    );

    // 4. Bitiş Süresi Hesaplama
    const expiresAt = new Date(Date.now() + category.defaultDurationHours * 3600 * 1000);

    // 5. Veritabanına PostGIS geometry formatında kayıt
    const sanitizedTitle = dto.title.trim().replace(/<[^>]*>?/gm, '');
    const sanitizedDescription = dto.description.trim().replace(/<[^>]*>?/gm, '');

    const insertSql = `
      INSERT INTO "events" (
        "authorId", "categoryId", "title", "description", "severity", "status",
        "location", "addressText", "city", "district", "expiresAt", "isDemo",
        "confirmationCount", "denialCount", "reliabilityScore", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        ST_SetSRID(ST_MakePoint($7, $8), 4326),
        $9, $10, $11, $12, false,
        0, 0, 1.0, NOW(), NOW()
      )
      RETURNING id, "createdAt", "updatedAt";
    `;
    const insertParams = [
      authorId,
      category.id,
      sanitizedTitle,
      sanitizedDescription,
      dto.severity || EventSeverity.MEDIUM,
      EventStatus.PENDING_REVIEW, // Normal kullanıcı bildirimi daima PENDING_REVIEW başlar
      dto.longitude,
      dto.latitude,
      dto.addressText || null,
      dto.city || null,
      dto.district || null,
      expiresAt,
    ];

    let createdEventId: string;
    if (this.outboxService) {
      createdEventId = await this.dataSource.transaction(async manager => {
        const insertResult = await manager.query(insertSql, insertParams);
        const eventId = insertResult[0].id;
        await this.outboxService!.createOutboxEvent(
          manager,
          'Event',
          eventId,
          'EVENT_CREATED',
          {
            eventId,
            authorId,
            status: EventStatus.PENDING_REVIEW,
            title: sanitizedTitle,
          },
        );
        return eventId;
      });
      this.outboxProcessor?.triggerProcess();
    } else {
      const insertResult = await this.dataSource.query(insertSql, insertParams);
      createdEventId = insertResult[0].id;
    }

    const event = await this.findById(createdEventId, { sub: authorId, role: user.role } as JwtPayload);

    if (duplicateCandidate) {
      // Gizlilik Kalkanı: Eğer mükerrer aday henüz ACTIVE değilse ve bildiren kullanıcıya ait değilse,
      // başka bir kullanıcının PENDING_REVIEW / REJECTED / DISPUTED olay başlığı ve kimliği sızdırılamaz.
      const isPublic = duplicateCandidate.status === EventStatus.ACTIVE;
      const isOwnEvent = duplicateCandidate.authorId === authorId;
      const canViewDetails = isPublic || isOwnEvent;

      event.duplicateWarning = {
        isDuplicateSuspected: true,
        message: canViewDetails
          ? undefined
          : 'Yakın bölgede benzer bir bildirim bulunuyor olabilir.',
        candidateId: canViewDetails ? duplicateCandidate.id : undefined,
        candidateTitle: canViewDetails ? duplicateCandidate.title : undefined,
        distanceMeters: Math.round(duplicateCandidate.distance_meters),
        createdAt: canViewDetails ? duplicateCandidate.createdAt : undefined,
      };
    }

    // Gerçek zamanlı bildirim ve yayın (WebSocket / Outbox harici fallback)
    if (!this.outboxService) {
      if (event.status === EventStatus.PENDING_REVIEW) {
        this.realtimeService?.notifyModerationQueue(event);
      } else if (event.status === EventStatus.ACTIVE) {
        this.realtimeService?.broadcastEventCreated(event);
      }
    }

    return event;
  }

  /**
   * Yakındaki Olaylar Sorgusu (GET /events/nearby)
   * ST_DWithin ve ST_Distance ile metre bazlı hesaplama
   */
  async findNearby(
    query: NearbyEventsDto,
    requestingUser?: JwtPayload,
  ): Promise<PaginatedEventsResponse> {
    const radiusMeters = Math.min(Math.max(query.radiusMeters || 5000, 50), 50000);
    const limit = Math.min(Math.max(query.limit || 20, 1), 100);

    const isModerator =
      requestingUser &&
      (requestingUser.role === UserRole.MODERATOR || requestingUser.role === UserRole.ADMIN);

    const params: unknown[] = [query.longitude, query.latitude, radiusMeters];
    let paramIndex = 4;

    // Görünürlük filtrelemesi: Moderatör olmayanlar yalnızca onaylı/aktif/çözüldü olayları görür
    let statusClause = `e.status IN ('ACTIVE', 'DISPUTED', 'RESOLVED')`;
    if (isModerator && query.status) {
      statusClause = `e.status = $${paramIndex++}`;
      params.push(query.status);
    } else if (query.status && ['ACTIVE', 'DISPUTED', 'RESOLVED'].includes(query.status)) {
      statusClause = `e.status = $${paramIndex++}`;
      params.push(query.status);
    }

    // Kategori filtresi
    let categoryClause = '';
    if (query.category) {
      categoryClause = `AND (c.code = $${paramIndex} OR c.id::text = $${paramIndex})`;
      params.push(query.category);
      paramIndex++;
    }

    // Önem derecesi filtresi
    let severityClause = '';
    if (query.severity) {
      severityClause = `AND e.severity = $${paramIndex++}`;
      params.push(query.severity);
    }

    // Cursor Pagination (distance_meters + id)
    let cursorClause = '';
    if (query.cursor) {
      try {
        const decoded = Buffer.from(query.cursor, 'base64').toString('utf8');
        const [cursorDistance, cursorId] = decoded.split('_');
        const distNum = parseFloat(cursorDistance || '');
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (isNaN(distNum) || !cursorId || !uuidRegex.test(cursorId)) {
          throw new BadRequestException('Geçersiz cursor parametresi.');
        }
        cursorClause = `
          AND (
            ST_Distance(e.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) > $${paramIndex}
            OR (
              ST_Distance(e.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) = $${paramIndex}
              AND e.id > $${paramIndex + 1}
            )
          )
        `;
        params.push(distNum, cursorId);
        paramIndex += 2;
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        throw new BadRequestException('Geçersiz cursor parametresi.');
      }
    }

    params.push(limit + 1);
    const limitParam = `$${paramIndex}`;

    const rawRows = await this.dataSource.query(
      `
      SELECT 
        e.id, e.title, e.description, e.severity, e.status,
        e."addressText", e.city, e.district, e."isDemo",
        e."confirmationCount", e."denialCount", e."reliabilityScore",
        e."createdAt", e."updatedAt", e."expiresAt", e."resolvedAt",
        ST_X(e.location) AS longitude,
        ST_Y(e.location) AS latitude,
        ST_Distance(e.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters,
        c.id AS category_id, c.code AS category_code, c.name_tr AS category_name_tr,
        c.description_tr AS category_description_tr, c.icon AS category_icon,
        c.color_hex AS category_color_hex, c.default_duration_hours AS category_default_duration_hours,
        u.id AS author_id, u."displayName" AS author_display_name, u."reputationScore" AS author_reputation_score
      FROM "events" e
      INNER JOIN "categories" c ON c.id = e."categoryId"
      INNER JOIN "users" u ON u.id = e."authorId"
      WHERE ST_DWithin(e.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
        AND ${statusClause}
        ${categoryClause}
        ${severityClause}
        ${cursorClause}
      ORDER BY distance_meters ASC, e.id ASC
      LIMIT ${limitParam};
      `,
      params,
    );

    const hasMore = rawRows.length > limit;
    const itemsRows = hasMore ? rawRows.slice(0, limit) : rawRows;

    let nextCursor: string | null = null;
    if (hasMore && itemsRows.length > 0) {
      const last = itemsRows[itemsRows.length - 1];
      nextCursor = Buffer.from(`${last.distance_meters}_${last.id}`).toString('base64');
    }

    const items: EventResponseDto[] = itemsRows.map((r: any) => this.mapRawToDto(r));

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Harita Bounding Box Sorgusu (GET /events/bbox)
   * Harita görünüm alanı içindeki olayları döndürür
   */
  async findBBox(
    query: BBoxEventsDto,
    requestingUser?: JwtPayload,
  ): Promise<PaginatedEventsResponse> {
    const { west, south, east, north } = query;
    const limit = Math.min(Math.max(query.limit || 20, 1), 100);

    if (south > north) {
      throw new BadRequestException('Güney enlemi (south) kuzey enleminden (north) büyük olamaz.');
    }

    // DoS önlemi: Aşırı büyük harita alanlarını sınırla (max 100 derece kare)
    const latDiff = north - south;
    const lonDiff = west <= east ? east - west : 360 - (west - east);
    if (latDiff * lonDiff > 100) {
      throw new BadRequestException('İstenen coğrafi alan çok büyük. Lütfen haritayı yakınlaştırınız.');
    }

    const isModerator =
      requestingUser &&
      (requestingUser.role === UserRole.MODERATOR || requestingUser.role === UserRole.ADMIN);

    const params: unknown[] = [];
    let paramIndex = 1;

    // Uluslararası tarih çizgisi (Antimeridian Crossing - west > east) kontrolü
    let spatialEnvelopeClause = '';
    if (west > east) {
      spatialEnvelopeClause = `(
        e.location && ST_MakeEnvelope($${paramIndex}, $${paramIndex + 1}, 180, $${paramIndex + 2}, 4326)
        OR
        e.location && ST_MakeEnvelope(-180, $${paramIndex + 1}, $${paramIndex + 3}, $${paramIndex + 2}, 4326)
      )`;
      params.push(west, south, north, east);
      paramIndex += 4;
    } else {
      spatialEnvelopeClause = `e.location && ST_MakeEnvelope($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, 4326)`;
      params.push(west, south, east, north);
      paramIndex += 4;
    }

    // Görünürlük
    let statusClause = `e.status IN ('ACTIVE', 'DISPUTED', 'RESOLVED')`;
    if (isModerator) {
      statusClause = `e.status != 'REJECTED'`;
    }

    // Kategori filtresi
    let categoryClause = '';
    if (query.category) {
      categoryClause = `AND (c.code = $${paramIndex} OR c.id::text = $${paramIndex})`;
      params.push(query.category);
      paramIndex++;
    }

    // Önem derecesi
    let severityClause = '';
    if (query.severity) {
      severityClause = `AND e.severity = $${paramIndex++}`;
      params.push(query.severity);
    }

    // Cursor Pagination (createdAt + id)
    let cursorClause = '';
    if (query.cursor) {
      try {
        const decoded = Buffer.from(query.cursor, 'base64').toString('utf8');
        const [cursorDate, cursorId] = decoded.split('_');
        const parsedDate = new Date(cursorDate || '');
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!cursorDate || !cursorId || isNaN(parsedDate.getTime()) || !uuidRegex.test(cursorId)) {
          throw new BadRequestException('Geçersiz cursor parametresi.');
        }
        cursorClause = `
          AND (
            e."createdAt" < $${paramIndex}
            OR (e."createdAt" = $${paramIndex} AND e.id > $${paramIndex + 1})
          )
        `;
        params.push(parsedDate, cursorId);
        paramIndex += 2;
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        throw new BadRequestException('Geçersiz cursor parametresi.');
      }
    }

    params.push(limit + 1);
    const limitParam = `$${paramIndex}`;

    const rawRows = await this.dataSource.query(
      `
      SELECT 
        e.id, e.title, e.description, e.severity, e.status,
        e."addressText", e.city, e.district, e."isDemo",
        e."confirmationCount", e."denialCount", e."reliabilityScore",
        e."createdAt", e."updatedAt", e."expiresAt", e."resolvedAt",
        ST_X(e.location) AS longitude,
        ST_Y(e.location) AS latitude,
        c.id AS category_id, c.code AS category_code, c.name_tr AS category_name_tr,
        c.description_tr AS category_description_tr, c.icon AS category_icon,
        c.color_hex AS category_color_hex, c.default_duration_hours AS category_default_duration_hours,
        u.id AS author_id, u."displayName" AS author_display_name, u."reputationScore" AS author_reputation_score
      FROM "events" e
      INNER JOIN "categories" c ON c.id = e."categoryId"
      INNER JOIN "users" u ON u.id = e."authorId"
      WHERE ${spatialEnvelopeClause}
        AND ${statusClause}
        ${categoryClause}
        ${severityClause}
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
      nextCursor = Buffer.from(`${new Date(last.createdAt).toISOString()}_${last.id}`).toString('base64');
    }

    const items: EventResponseDto[] = itemsRows.map((r: any) => this.mapRawToDto(r));

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Olay Arama (GET /events/search)
   * Başlık, açıklama, adres ve ilçe alanlarında Türkçe uyumlu ve gizlilik kalkanlı arama
   */
  async searchEvents(
    query: SearchEventsDto,
    requestingUser?: JwtPayload,
  ): Promise<PaginatedEventsResponse> {
    const rawQ = (query.q || '').trim();
    if (rawQ.length < 2) {
      throw new BadRequestException('Arama terimi en az 2 karakter olmalıdır.');
    }
    if (rawQ.length > 100) {
      throw new BadRequestException('Arama terimi maksimum 100 karakter olabilir.');
    }

    // Tarih aralığı katı doğrulaması (Maksimum 366 gün / 1 yıl)
    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Geçersiz tarih formatı.');
      }
      if (start > end) {
        throw new BadRequestException('Başlangıç tarihi bitiş tarihinden sonra olamaz.');
      }
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      if (diffDays > 366) {
        throw new BadRequestException('Tarih aralığı en fazla 366 gün (1 yıl) olabilir.');
      }
    }

    const limit = Math.min(Math.max(query.limit || 20, 1), 50);
    const isModerator =
      requestingUser &&
      (requestingUser.role === UserRole.MODERATOR || requestingUser.role === UserRole.ADMIN);

    const params: unknown[] = [];
    let paramIndex = 1;

    // Arama koşulu: Başlık, açıklama, adres, ilçe (Türkçe unaccent duyarsız arama + standart ILIKE)
    const searchParam = `%${rawQ}%`;
    const searchClause = `(
      unaccent(LOWER(e.title)) ILIKE unaccent(LOWER($${paramIndex}))
      OR e.title ILIKE $${paramIndex}
      OR unaccent(LOWER(e.description)) ILIKE unaccent(LOWER($${paramIndex}))
      OR e.description ILIKE $${paramIndex}
      OR unaccent(LOWER(e."addressText")) ILIKE unaccent(LOWER($${paramIndex}))
      OR e."addressText" ILIKE $${paramIndex}
      OR unaccent(LOWER(e.district)) ILIKE unaccent(LOWER($${paramIndex}))
      OR e.district ILIKE $${paramIndex}
    )`;
    params.push(searchParam);
    paramIndex++;

    // Gizlilik Kalkanı: Yalnızca kamuya açık olaylar (ACTIVE, DISPUTED, RESOLVED)
    let statusClause = `e.status IN ('ACTIVE', 'DISPUTED', 'RESOLVED')`;
    if (isModerator) {
      statusClause = `e.status != 'REJECTED'`;
    }

    // Kategori filtresi
    let categoryClause = '';
    if (query.category) {
      categoryClause = `AND (c.code = $${paramIndex} OR c.id::text = $${paramIndex})`;
      params.push(query.category);
      paramIndex++;
    }

    // Şehir filtresi
    let cityClause = '';
    if (query.city) {
      cityClause = `AND (unaccent(LOWER(e.city)) ILIKE unaccent(LOWER($${paramIndex})) OR e.city ILIKE $${paramIndex})`;
      params.push(`%${query.city.trim()}%`);
      paramIndex++;
    }

    // İlçe filtresi
    let districtClause = '';
    if (query.district) {
      districtClause = `AND (unaccent(LOWER(e.district)) ILIKE unaccent(LOWER($${paramIndex})) OR e.district ILIKE $${paramIndex})`;
      params.push(`%${query.district.trim()}%`);
      paramIndex++;
    }

    // Tarih filtreleri
    let dateClause = '';
    if (query.startDate) {
      dateClause += ` AND e."createdAt" >= $${paramIndex}`;
      params.push(new Date(query.startDate));
      paramIndex++;
    }
    if (query.endDate) {
      dateClause += ` AND e."createdAt" <= $${paramIndex}`;
      params.push(new Date(query.endDate));
      paramIndex++;
    }

    // Cursor Pagination (createdAt + id)
    let cursorClause = '';
    if (query.cursor) {
      try {
        const decoded = Buffer.from(query.cursor, 'base64').toString('utf8');
        const [cursorDate, cursorId] = decoded.split('_');
        const parsedDate = new Date(cursorDate || '');
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!cursorDate || !cursorId || isNaN(parsedDate.getTime()) || !uuidRegex.test(cursorId)) {
          throw new BadRequestException('Geçersiz cursor parametresi.');
        }
        cursorClause = `
          AND (
            e."createdAt" < $${paramIndex}
            OR (e."createdAt" = $${paramIndex} AND e.id > $${paramIndex + 1})
          )
        `;
        params.push(parsedDate, cursorId);
        paramIndex += 2;
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        throw new BadRequestException('Geçersiz cursor parametresi.');
      }
    }

    params.push(limit + 1);
    const limitParam = `$${paramIndex}`;

    const rawRows = await this.dataSource.query(
      `
      SELECT 
        e.id, e.title, e.description, e.severity, e.status,
        e."addressText", e.city, e.district, e."isDemo",
        e."confirmationCount", e."denialCount", e."reliabilityScore",
        e."createdAt", e."updatedAt", e."expiresAt", e."resolvedAt",
        ST_X(e.location) AS longitude,
        ST_Y(e.location) AS latitude,
        c.id AS category_id, c.code AS category_code, c.name_tr AS category_name_tr,
        c.description_tr AS category_description_tr, c.icon AS category_icon,
        c.color_hex AS category_color_hex, c.default_duration_hours AS category_default_duration_hours,
        u.id AS author_id, u."displayName" AS author_display_name, u."reputationScore" AS author_reputation_score
      FROM "events" e
      INNER JOIN "categories" c ON c.id = e."categoryId"
      INNER JOIN "users" u ON u.id = e."authorId"
      WHERE ${searchClause}
        AND ${statusClause}
        ${categoryClause}
        ${cityClause}
        ${districtClause}
        ${dateClause}
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

    const items: EventResponseDto[] = itemsRows.map((r: any) => this.mapRawToDto(r));

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Olay Detayı Getirme (GET /events/:id)
   * Yetkisiz kullanıcılara PENDING_REVIEW veya REJECTED gösterilmez
   */
  async findById(id: string, requestingUser?: JwtPayload): Promise<EventResponseDto> {
    const rawRows = await this.dataSource.query(
      `
      SELECT 
        e.id, e.title, e.description, e.severity, e.status,
        e."addressText", e.city, e.district, e."isDemo",
        e."confirmationCount", e."denialCount", e."reliabilityScore",
        e."createdAt", e."updatedAt", e."expiresAt", e."resolvedAt",
        e."authorId",
        ST_X(e.location) AS longitude,
        ST_Y(e.location) AS latitude,
        c.id AS category_id, c.code AS category_code, c.name_tr AS category_name_tr,
        c.description_tr AS category_description_tr, c.icon AS category_icon,
        c.color_hex AS category_color_hex, c.default_duration_hours AS category_default_duration_hours,
        u.id AS author_id, u."displayName" AS author_display_name, u."reputationScore" AS author_reputation_score
      FROM "events" e
      INNER JOIN "categories" c ON c.id = e."categoryId"
      INNER JOIN "users" u ON u.id = e."authorId"
      WHERE e.id = $1
      LIMIT 1;
      `,
      [id],
    );

    if (!rawRows || rawRows.length === 0) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    const event = rawRows[0];

    // Görünürlük Kontrolü
    const isAuthor = requestingUser && requestingUser.sub === event.authorId;
    const isModerator =
      requestingUser &&
      (requestingUser.role === UserRole.MODERATOR || requestingUser.role === UserRole.ADMIN);

    if (
      (event.status === EventStatus.PENDING_REVIEW || event.status === EventStatus.REJECTED) &&
      !isAuthor &&
      !isModerator
    ) {
      // 404 dönerek gizli olayların kimliğini koru
      throw new NotFoundException('Olay bulunamadı.');
    }

    return this.mapRawToDto(event);
  }

  /**
   * Olay Yaşam Döngüsü ve Durum Güncelleme (PATCH /events/:id/status)
   * Moderatör, Belediye Görevlisi ve Yazar Yetkilendirme Matrisi
   */
  async updateStatus(
    id: string,
    dto: UpdateEventStatusDto,
    user: JwtPayload,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    const currentStatus = event.status;
    const newStatus = dto.status;

    if (currentStatus === newStatus) {
      return this.findById(id, user);
    }

    // Durum Geçiş ve Yetki Matrisi Kontrolü
    this.validateStatusTransition(currentStatus, newStatus, user, event.authorId);

    // Transaction ile güvenli durum güncelleme ve denetim logu (Audit Trail)
    await this.dataSource.transaction(async manager => {
      const updatePayload: Partial<EventEntity> = {
        status: newStatus,
        version: (event.version || 1) + 1,
        updatedAt: new Date(),
      };

      if (newStatus === EventStatus.RESOLVED) {
        updatePayload.resolvedAt = new Date();
      }

      await manager.update(EventEntity, { id }, updatePayload);

      // Audit Log kaydı
      await manager.save(
        EventModerationLogEntity,
        manager.create(EventModerationLogEntity, {
          eventId: id,
          moderatorId: user.sub,
          previousStatus: currentStatus,
          newStatus,
          reason: dto.reason || null,
        }),
      );

      // Transactional Outbox Kaydı (Phase 11: Atomic Event & Outbox)
      if (this.outboxService) {
        await this.outboxService.createOutboxEvent(
          manager,
          'Event',
          id,
          'EVENT_STATUS_CHANGED',
          {
            eventId: id,
            previousStatus: currentStatus,
            newStatus,
            authorId: event.authorId,
            title: event.title,
            reason: dto.reason || null,
            updatedBy: user.sub,
            updatedByRole: user.role,
          },
        );
      }
    });

    this.logger.log(
      `Olay durumu güncellendi: ${id} [${currentStatus} -> ${newStatus}] Kullanıcı: ${user.sub} (${user.role})`,
    );

    const updatedEvent = await this.findById(id, user);

    // Outbox processor tetiklemesi
    if (this.outboxProcessor) {
      this.outboxProcessor.triggerProcess();
    }

    // Outbox devrede değilse doğrudan ilet (Unit testler ve geriye uyumluluk)
    if (!this.outboxService) {
      // Gerçek zamanlı WebSocket yayını
      this.realtimeService?.broadcastEventStatusChanged(updatedEvent);

      // Akıllı bildirim üretimi
      if (newStatus === EventStatus.ACTIVE) {
        this.notificationsService
          ?.createNotification({
            userId: event.authorId,
            type: NotificationType.EVENT_APPROVED,
            title: 'Bildiriminiz yayınlandı',
            body: `"${event.title}" başlıklı bildiriminiz onaylandı ve yayına alındı.`,
            eventId: id,
          })
          .catch(() => {});
      } else if (newStatus === EventStatus.REJECTED) {
        this.notificationsService
          ?.createNotification({
            userId: event.authorId,
            type: NotificationType.EVENT_REJECTED,
            title: 'Bildiriminiz hakkında bir moderasyon kararı verildi',
            body: `"${event.title}" başlıklı bildiriminiz moderasyon tarafından onaylanmadı.${dto.reason ? ` Gerekçe: ${dto.reason}` : ''}`,
            eventId: id,
          })
          .catch(() => {});
      } else if (newStatus === EventStatus.RESOLVED) {
        this.notificationsService
          ?.createNotification({
            userId: event.authorId,
            type: NotificationType.EVENT_RESOLVED,
            title: 'Takip ettiğiniz gelişme çözüldü olarak işaretlendi',
            body: `"${event.title}" başlıklı aksaklık çözüldü olarak işaretlendi.`,
            eventId: id,
          })
          .catch(() => {});
      } else if (newStatus === EventStatus.DISPUTED) {
        this.notificationsService
          ?.createNotification({
            userId: event.authorId,
            type: NotificationType.EVENT_DISPUTED,
            title: 'Katkıda bulunduğunuz olaya itiraz edildi',
            body: `"${event.title}" başlıklı olay hakkında ihtilaf kaydı oluşturuldu.`,
            eventId: id,
          })
          .catch(() => {});
      }
    }

    return updatedEvent;
  }

  /**
   * Olay Moderasyon Geçmişini Getir
   */
  async getModerationLogs(eventId: string): Promise<EventModerationLogEntity[]> {
    return this.moderationLogRepository.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 150m Yarıçapında ve Son 45 Dakikada Aynı Kategoride Mükerrer Aday Kontrolü
   */
  async checkDuplicateCandidate(
    categoryId: string,
    lon: number,
    lat: number,
  ): Promise<{ id: string; title: string; status: EventStatus; authorId: string; distance_meters: number; createdAt: string } | null> {
    const candidates = await this.dataSource.query(
      `
      SELECT 
        id, title, status, "authorId", "createdAt",
        ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters
      FROM "events"
      WHERE "categoryId" = $3
        AND "createdAt" >= NOW() - INTERVAL '45 minutes'
        AND status IN ('ACTIVE', 'PENDING_REVIEW', 'DISPUTED')
        AND ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 150)
      ORDER BY distance_meters ASC
      LIMIT 1;
      `,
      [lon, lat, categoryId],
    );

    if (candidates && candidates.length > 0) {
      return candidates[0];
    }

    return null;
  }

  /**
   * Olay Durum Geçiş Kuralları ve Rol Yetkilendirme Doğrulaması
   */
  private validateStatusTransition(
    current: EventStatus,
    target: EventStatus,
    user: JwtPayload,
    authorId: string,
  ): void {
    const isAuthor = user.sub === authorId;
    const isModeratorOrAdmin =
      user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;
    const isMunicipalOfficer = user.role === UserRole.MUNICIPAL_OFFICER;

    // 1. PENDING_REVIEW -> ACTIVE | REJECTED: Yalnızca MODERATOR / ADMIN
    if (current === EventStatus.PENDING_REVIEW) {
      if (target === EventStatus.ACTIVE || target === EventStatus.REJECTED) {
        if (!isModeratorOrAdmin) {
          throw new ForbiddenException('Bekleyen olayları yalnızca moderatörler onaylayabilir veya reddedebilir.');
        }
        return;
      }
    }

    // 2. ACTIVE -> RESOLVED: Yazarın kendisi, Belediye Görevlisi, Moderatör veya Admin yapabilir
    if (current === EventStatus.ACTIVE && target === EventStatus.RESOLVED) {
      if (isAuthor || isMunicipalOfficer || isModeratorOrAdmin) {
        return;
      }
      throw new ForbiddenException('Bu olayı çözüldü olarak işaretleme yetkiniz yok.');
    }

    // 3. ACTIVE -> DISPUTED: Topluluk itirazı / Moderatör
    if (current === EventStatus.ACTIVE && target === EventStatus.DISPUTED) {
      if (!isModeratorOrAdmin) {
        throw new ForbiddenException('Olayı itirazlı duruma alma yetkisi moderatörlere aittir.');
      }
      return;
    }

    // 4. DISPUTED -> RESOLVED: Moderatör, Belediye veya Admin
    if (current === EventStatus.DISPUTED && target === EventStatus.RESOLVED) {
      if (isMunicipalOfficer || isModeratorOrAdmin) {
        return;
      }
      throw new ForbiddenException('İtirazlı bir olayı yalnızca yetkililer çözüldü yapabilir.');
    }

    // 4b. DISPUTED -> ACTIVE | REJECTED: Yalnızca Moderatör / Admin
    if (
      current === EventStatus.DISPUTED &&
      (target === EventStatus.ACTIVE || target === EventStatus.REJECTED)
    ) {
      if (!isModeratorOrAdmin) {
        throw new ForbiddenException('İtirazlı olayı yeniden yayınlama veya reddetme yetkisi moderatörlere aittir.');
      }
      return;
    }

    // 4c. ACTIVE -> REJECTED: Yalnızca Moderatör / Admin
    if (current === EventStatus.ACTIVE && target === EventStatus.REJECTED) {
      if (!isModeratorOrAdmin) {
        throw new ForbiddenException('Yayındaki bir olayı yalnızca moderatörler reddedebilir.');
      }
      return;
    }

    // 5. ACTIVE -> EXPIRED: Moderatör veya Admin
    if (current === EventStatus.ACTIVE && target === EventStatus.EXPIRED) {
      if (!isModeratorOrAdmin) {
        throw new ForbiddenException('Süre aşımı durumunu yalnızca yetkililer atayabilir.');
      }
      return;
    }

    throw new BadRequestException(
      `Geçersiz durum geçişi: ${current} durumundaki bir olay ${target} durumuna geçirilemez.`,
    );
  }

  /**
   * Topluluk Geri Bildirimi Gönderme / Güncelleme (POST /events/:id/feedback)
   * - JWT ve aktif hesap zorunlu
   * - Gizli olaylar için 404 (bilgi sızıntısını önler)
   * - Kullanıcı kendi olayını teyit edemez (400 BadRequest)
   * - Eşzamanlı istekler DB unique kısıtı ile korunur
   * - Transaction içinde sayaçlar güncellenir
   */
  async submitFeedback(
    eventId: string,
    userId: string,
    dto: CreateFeedbackDto,
  ): Promise<FeedbackSummaryDto> {
    // 1. Kullanıcı aktiflik kontrolü
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Hesabınız aktif değil veya geri bildirim yetkiniz kısıtlanmış.');
    }

    // 2. Olay varlık kontrolü
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    // 3. Kullanıcı kendi olayına geri bildirim veremez (Yazar denetimi)
    if (event.authorId === userId) {
      throw new BadRequestException('Kendi bildirdiğiniz olaya geri bildirim veremezsiniz.');
    }

    // Gizli / Reddedilmiş olay koruması: Sadece moderatör/admin erişebilir; normal vatandaşa 404
    const isModerator = user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;
    if (
      (event.status === EventStatus.PENDING_REVIEW || event.status === EventStatus.REJECTED) &&
      !isModerator
    ) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    // 4. Transaction ile güvenli upsert ve sayaç güncelleme
    await this.dataSource.transaction(async manager => {
      const feedbackRepo = manager.getRepository(EventFeedbackEntity);
      let feedback = await feedbackRepo.findOne({ where: { eventId, userId } });

      if (feedback) {
        feedback.type = dto.type;
        feedback.reason = dto.reason ? dto.reason.trim() : null;
        feedback.updatedAt = new Date();
        await feedbackRepo.save(feedback);
      } else {
        feedback = feedbackRepo.create({
          eventId,
          userId,
          type: dto.type,
          reason: dto.reason ? dto.reason.trim() : null,
        });
        await feedbackRepo.save(feedback);
      }

      // 5. Güncel sayaçları hesapla ve olayı atomik güncelle
      const countsRaw = await manager.query(
        `
        SELECT 
          COUNT(*) FILTER (WHERE "type" = 'CONFIRM')::int AS confirm_count,
          COUNT(*) FILTER (WHERE "type" = 'DISPUTE')::int AS dispute_count,
          COUNT(*) FILTER (WHERE "type" = 'RESOLVED_REPORT')::int AS resolved_count
        FROM "event_feedbacks"
        WHERE "eventId" = $1;
        `,
        [eventId],
      );

      const confirmCount = countsRaw[0]?.confirm_count || 0;
      const disputeCount = countsRaw[0]?.dispute_count || 0;
      const resolvedCount = countsRaw[0]?.resolved_count || 0;

      await manager.update(EventEntity, { id: eventId }, {
        confirmationCount: confirmCount,
        denialCount: disputeCount,
        disputeCount: disputeCount,
        resolvedReportCount: resolvedCount,
        updatedAt: new Date(),
      });

      // Transactional Outbox (Phase 11)
      if (this.outboxService) {
        await this.outboxService.createOutboxEvent(
          manager,
          'Event',
          eventId,
          'EVENT_FEEDBACK_SUBMITTED',
          {
            eventId,
            feedbackType: dto.type,
            reason: dto.reason ? dto.reason.trim() : null,
            voterId: userId,
            eventAuthorId: event.authorId,
            confirmationCount: confirmCount,
            denialCount: disputeCount,
            disputeCount,
            resolvedReportCount: resolvedCount,
          },
        );
      }
    });

    this.logger.log(
      `Geri bildirim kaydedildi: Olay: ${eventId}, Kullanıcı: ${userId}, Tür: ${dto.type}`,
    );

    // Outbox Processor tetiklemesi
    if (this.outboxProcessor) {
      this.outboxProcessor.triggerProcess();
    }

    const summary = await this.getFeedbackSummary(eventId, userId);

    // Outbox devrede değilse doğrudan ilet (Unit testler ve geriye uyumluluk)
    if (!this.outboxService) {
      // Gerçek zamanlı WebSocket yayını
      this.realtimeService?.broadcastFeedbackUpdated({
        id: eventId,
        confirmationCount: summary.confirmCount,
        disputeCount: summary.disputeCount,
        resolvedReportCount: summary.resolvedReportCount,
        reliabilityScore: 1.0,
      });

      // Olay sahibine bildirim iletimi (Anti-spam kurallarıyla)
      if (event.authorId !== userId) {
        if (dto.type === FeedbackType.CONFIRM) {
          this.notificationsService
            ?.createNotification({
              userId: event.authorId,
              type: NotificationType.EVENT_FEEDBACK,
              title: 'Bildirdiğiniz olay teyit edildi',
              body: `"${event.title}" başlıklı bildiriminiz bir mahalle sakini tarafından görüldü olarak teyit edildi.`,
              eventId,
            })
            .catch(() => {});
        } else if (dto.type === FeedbackType.DISPUTE) {
          this.notificationsService
            ?.createNotification({
              userId: event.authorId,
              type: NotificationType.EVENT_DISPUTED,
              title: 'Bildiriminize itiraz edildi',
              body: `"${event.title}" başlıklı bildiriminize bilgi yanlışı veya yanıltıcı ihbar gerekçesiyle itiraz edildi.`,
              eventId,
            })
            .catch(() => {});
        }
      }
    }

    return summary;
  }

  /**
   * Topluluk Geri Bildirimini Geri Çekme (DELETE /events/:id/feedback)
   */
  async removeFeedback(eventId: string, userId: string): Promise<FeedbackSummaryDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException('Hesabınız aktif değil veya işlem yetkiniz yok.');
    }

    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    const isModerator = user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;
    if (
      (event.status === EventStatus.PENDING_REVIEW || event.status === EventStatus.REJECTED) &&
      !isModerator
    ) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    await this.dataSource.transaction(async manager => {
      const feedbackRepo = manager.getRepository(EventFeedbackEntity);
      const existing = await feedbackRepo.findOne({ where: { eventId, userId } });
      if (!existing) {
        throw new NotFoundException('Geri çekilecek bir geri bildirim bulunamadı.');
      }

      await feedbackRepo.remove(existing);

      // Sayaçları güncelle
      const countsRaw = await manager.query(
        `
        SELECT 
          COUNT(*) FILTER (WHERE "type" = 'CONFIRM')::int AS confirm_count,
          COUNT(*) FILTER (WHERE "type" = 'DISPUTE')::int AS dispute_count,
          COUNT(*) FILTER (WHERE "type" = 'RESOLVED_REPORT')::int AS resolved_count
        FROM "event_feedbacks"
        WHERE "eventId" = $1;
        `,
        [eventId],
      );

      const confirmCount = countsRaw[0]?.confirm_count || 0;
      const disputeCount = countsRaw[0]?.dispute_count || 0;
      const resolvedCount = countsRaw[0]?.resolved_count || 0;

      await manager.update(EventEntity, { id: eventId }, {
        confirmationCount: confirmCount,
        denialCount: disputeCount,
        disputeCount: disputeCount,
        resolvedReportCount: resolvedCount,
        updatedAt: new Date(),
      });

      // Transactional Outbox (Phase 11)
      if (this.outboxService) {
        await this.outboxService.createOutboxEvent(
          manager,
          'Event',
          eventId,
          'EVENT_FEEDBACK_REMOVED',
          {
            eventId,
            voterId: userId,
            eventAuthorId: event.authorId,
            confirmationCount: confirmCount,
            denialCount: disputeCount,
            disputeCount,
            resolvedReportCount: resolvedCount,
          },
        );
      }
    });

    this.logger.log(`Geri bildirim geri çekildi: Olay: ${eventId}, Kullanıcı: ${userId}`);

    // Outbox Processor tetiklemesi
    if (this.outboxProcessor) {
      this.outboxProcessor.triggerProcess();
    }

    const summary = await this.getFeedbackSummary(eventId, userId);

    if (!this.outboxService) {
      this.realtimeService?.broadcastFeedbackUpdated({
        id: eventId,
        confirmationCount: summary.confirmCount,
        disputeCount: summary.disputeCount,
        resolvedReportCount: summary.resolvedReportCount,
        reliabilityScore: 1.0,
      });
    }

    return summary;
  }

  /**
   * Topluluk Geri Bildirim Özeti (GET /events/:id/feedback/summary)
   * Açıklanabilir metin ve sahte kesinlik barındırmayan gösterge
   */
  async getFeedbackSummary(
    eventId: string,
    userId?: string,
    requestingUser?: JwtPayload,
  ): Promise<FeedbackSummaryDto> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    const isAuthor = requestingUser && requestingUser.sub === event.authorId;
    const isModerator =
      requestingUser &&
      (requestingUser.role === UserRole.MODERATOR || requestingUser.role === UserRole.ADMIN);

    if (
      (event.status === EventStatus.PENDING_REVIEW || event.status === EventStatus.REJECTED) &&
      !isAuthor &&
      !isModerator
    ) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    const countsRaw = await this.dataSource.query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE "type" = 'CONFIRM')::int AS confirm_count,
        COUNT(*) FILTER (WHERE "type" = 'DISPUTE')::int AS dispute_count,
        COUNT(*) FILTER (WHERE "type" = 'RESOLVED_REPORT')::int AS resolved_count
      FROM "event_feedbacks"
      WHERE "eventId" = $1;
      `,
      [eventId],
    );

    const confirmCount = countsRaw[0]?.confirm_count || 0;
    const disputeCount = countsRaw[0]?.dispute_count || 0;
    const resolvedReportCount = countsRaw[0]?.resolved_count || 0;
    const totalCount = confirmCount + disputeCount + resolvedReportCount;

    let userFeedback: { type: FeedbackType; reason?: string | null; createdAt: string } | null = null;
    if (userId) {
      const fb = await this.feedbackRepository.findOne({ where: { eventId, userId } });
      if (fb) {
        userFeedback = {
          type: fb.type,
          reason: fb.reason || null,
          createdAt: fb.createdAt.toISOString(),
        };
      }
    }

    // Açıklanabilir topluluk değerlendirmesi
    const hasSufficientSample = totalCount >= 3;
    let communityAssessment: string;

    if (!hasSufficientSample) {
      communityAssessment = 'Topluluk değerlendirmesi henüz oluşmadı (en az 3 bağımsız bildirim gereklidir).';
    } else {
      const parts: string[] = [];
      if (confirmCount > 0) parts.push(`${confirmCount} kişi gördüğünü bildirdi`);
      if (disputeCount > 0) parts.push(`${disputeCount} kişi bilgiye itiraz etti`);
      if (resolvedReportCount > 0) parts.push(`${resolvedReportCount} kişi çözüldüğünü düşünüyor`);
      communityAssessment = parts.join(', ');
    }

    return {
      eventId,
      confirmCount,
      disputeCount,
      resolvedReportCount,
      totalCount,
      userFeedback,
      hasSufficientSample,
      communityAssessment,
      disclaimer: 'Topluluk bildirimleri kamuoyunu bilgilendirme amaçlıdır; resmî doğrulama niteliği taşımaz.',
    };
  }

  /**
   * Moderasyon Olayları Listesi (GET /moderation/events)
   * Yalnızca MODERATOR ve ADMIN rollerine açık
   */
  async getModerationEvents(query: ModerationEventsQueryDto): Promise<PaginatedModerationEventsResponse> {
    const limit = query.limit || 20;
    const params: any[] = [];
    let paramIndex = 1;

    let statusClause = '';
    if (query.status) {
      statusClause = `e.status = $${paramIndex++}`;
      params.push(query.status);
    } else {
      // Varsayılan: inceleme bekleyen veya ihtilaflı olaylar öncelikli
      statusClause = `e.status IN ('PENDING_REVIEW', 'DISPUTED')`;
    }

    let categoryClause = '';
    if (query.category) {
      categoryClause = `AND (c.code = $${paramIndex} OR c.id::text = $${paramIndex})`;
      params.push(query.category);
      paramIndex++;
    }

    let severityClause = '';
    if (query.severity) {
      severityClause = `AND e.severity = $${paramIndex++}`;
      params.push(query.severity);
    }

    let cityClause = '';
    if (query.city) {
      cityClause = `AND e.city ILIKE $${paramIndex++}`;
      params.push(`%${query.city}%`);
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
        this.logger.warn(`Geçersiz moderation cursor: ${query.cursor}`);
      }
    }

    params.push(limit + 1);
    const limitParam = `$${paramIndex}`;

    const rawRows = await this.dataSource.query(
      `
      SELECT 
        e.id, e.title, e.description, e.severity, e.status,
        e."addressText", e.city, e.district, e."isDemo",
        e."confirmationCount", e."denialCount", e."disputeCount", e."resolvedReportCount",
        e."reliabilityScore",
        e."createdAt", e."updatedAt", e."expiresAt", e."resolvedAt",
        ST_X(e.location) AS longitude,
        ST_Y(e.location) AS latitude,
        c.id AS category_id, c.code AS category_code, c.name_tr AS category_name_tr,
        c.description_tr AS category_description_tr, c.icon AS category_icon,
        c.color_hex AS category_color_hex, c.default_duration_hours AS category_default_duration_hours,
        u.id AS author_id, u."displayName" AS author_display_name, u."reputationScore" AS author_reputation_score,
        u.email AS author_email
      FROM "events" e
      INNER JOIN "categories" c ON c.id = e."categoryId"
      INNER JOIN "users" u ON u.id = e."authorId"
      WHERE ${statusClause}
        ${categoryClause}
        ${severityClause}
        ${cityClause}
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
      nextCursor = Buffer.from(`${new Date(last.createdAt).toISOString()}_${last.id}`).toString('base64');
    }

    const items: ModerationEventItemDto[] = itemsRows.map((r: any) => {
      const baseDto = this.mapRawToDto(r);
      return {
        ...baseDto,
        feedbackSummary: {
          confirmCount: r.confirmationCount || 0,
          disputeCount: r.disputeCount || r.denialCount || 0,
          resolvedReportCount: r.resolvedReportCount || 0,
          totalCount: (r.confirmationCount || 0) + (r.disputeCount || r.denialCount || 0) + (r.resolvedReportCount || 0),
        },
      };
    });

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Moderatör İçin Olay Detayı (GET /moderation/events/:id)
   */
  async getModerationEventById(id: string): Promise<any> {
    const eventDto = await this.findById(id, { sub: 'moderator-internal', role: UserRole.MODERATOR } as JwtPayload);
    const moderationLogs = await this.getModerationLogs(id);
    const feedbackSummary = await this.getFeedbackSummary(id);

    // Son 20 geri bildirimi listele
    const recentFeedbacks = await this.dataSource.query(
      `
      SELECT 
        f.id, f."type", f.reason, f."createdAt",
        u.id AS user_id, u."displayName" AS user_display_name, u."reputationScore" AS user_reputation_score
      FROM "event_feedbacks" f
      INNER JOIN "users" u ON u.id = f."userId"
      WHERE f."eventId" = $1
      ORDER BY f."createdAt" DESC
      LIMIT 20;
      `,
      [id],
    );

    return {
      ...eventDto,
      feedbackSummary,
      moderationLogs,
      recentFeedbacks: recentFeedbacks.map((f: any) => ({
        id: f.id,
        type: f.type,
        reason: f.reason,
        createdAt: new Date(f.createdAt).toISOString(),
        user: {
          id: f.user_id,
          displayName: f.user_display_name,
          reputationScore: f.user_reputation_score,
        },
      })),
    };
  }

  /**
   * Kullanıcı İtibar Değişikliğini Audit Trail Olarak Kaydet (Phase 8)
   */
  async recordReputationChange(
    userId: string,
    delta: number,
    reason: string,
    referenceId?: string,
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      const user = await manager.findOne(UserEntity, { where: { id: userId } });
      if (!user) return;

      user.reputationScore = Math.max(0, user.reputationScore + delta);
      await manager.save(UserEntity, user);

      const log = manager.create(UserReputationLogEntity, {
        userId,
        delta,
        reason,
        referenceId: referenceId || null,
      });
      await manager.save(UserReputationLogEntity, log);
    });
  }

  /**
   * Kullanıcının İtibar Denetim Kayıtlarını Getir (Phase 8)
   */
  async getUserReputationLogs(userId: string): Promise<UserReputationLogEntity[]> {
    return this.reputationLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Raw SQL satırını kamuya açık güvenli DTO'ya dönüştürür (Hassas alanlar gizlenir)
   */
  private mapRawToDto(r: any): EventResponseDto {
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      severity: r.severity,
      status: r.status,
      category: {
        id: r.category_id,
        code: r.category_code,
        nameTr: r.category_name_tr,
        descriptionTr: r.category_description_tr,
        icon: r.category_icon,
        colorHex: r.category_color_hex,
        defaultDurationHours: r.category_default_duration_hours,
        isActive: true,
      },
      location: {
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
      },
      addressText: r.addressText || undefined,
      city: r.city || undefined,
      district: r.district || undefined,
      distanceMeters: r.distance_meters !== undefined ? Math.round(parseFloat(r.distance_meters)) : undefined,
      confirmationCount: r.confirmationCount || 0,
      denialCount: r.denialCount || 0,
      reliabilityScore: parseFloat(r.reliabilityScore || '1.0'),
      author: {
        id: r.author_id,
        displayName: r.author_display_name,
        reputationScore: r.author_reputation_score || 10,
      },
      isDemo: r.isDemo || false,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
      expiresAt: new Date(r.expiresAt).toISOString(),
      resolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toISOString() : undefined,
    };
  }
}
