import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEntity } from '../../database/entities/event.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { EventModerationLogEntity } from '../../database/entities/event-moderation-log.entity';
import {
  EventStatus,
  EventSeverity,
  UserRole,
  AccountStatus,
  JwtPayload,
  EventResponseDto,
  PaginatedEventsResponse,
} from '@sehir-nabiz/shared';
import {
  CreateEventDto,
  NearbyEventsDto,
  BBoxEventsDto,
  UpdateEventStatusDto,
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
    private readonly dataSource: DataSource,
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

    const insertResult = await this.dataSource.query(
      `
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
      `,
      [
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
      ],
    );

    const createdEventId = insertResult[0].id;
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
        if (cursorDistance && cursorId) {
          cursorClause = `
            AND (
              ST_Distance(e.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) > $${paramIndex}
              OR (
                ST_Distance(e.location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) = $${paramIndex}
                AND e.id > $${paramIndex + 1}
              )
            )
          `;
          params.push(parseFloat(cursorDistance), cursorId);
          paramIndex += 2;
        }
      } catch (err) {
        this.logger.warn(`Geçersiz cursor parametresi: ${query.cursor}`);
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
        this.logger.warn(`Geçersiz bbox cursor: ${query.cursor}`);
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
    });

    this.logger.log(
      `Olay durumu güncellendi: ${id} [${currentStatus} -> ${newStatus}] Kullanıcı: ${user.sub} (${user.role})`,
    );

    return this.findById(id, user);
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
