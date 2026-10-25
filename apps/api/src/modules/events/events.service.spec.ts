import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventsService } from './events.service';
import { EventEntity } from '../../database/entities/event.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { EventModerationLogEntity } from '../../database/entities/event-moderation-log.entity';
import { Repository, DataSource } from 'typeorm';
import {
  EventStatus,
  EventSeverity,
  UserRole,
  AccountStatus,
  JwtPayload,
} from '@sehir-nabiz/shared';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('EventsService (Unit Tests)', () => {
  let service: EventsService;
  let eventRepo: Partial<Record<keyof Repository<EventEntity>, ReturnType<typeof vi.fn>>>;
  let userRepo: Partial<Record<keyof Repository<UserEntity>, ReturnType<typeof vi.fn>>>;
  let categoryRepo: Partial<Record<keyof Repository<CategoryEntity>, ReturnType<typeof vi.fn>>>;
  let moderationLogRepo: Partial<Record<keyof Repository<EventModerationLogEntity>, ReturnType<typeof vi.fn>>>;
  let dataSource: Partial<Record<keyof DataSource, ReturnType<typeof vi.fn>>>;

  const mockUser: UserEntity = {
    id: 'user-uuid-1',
    email: 'citizen@sehirnabiz.local',
    passwordHash: 'secret-hash',
    displayName: 'Vatandaş Ali',
    role: UserRole.CITIZEN,
    accountStatus: AccountStatus.ACTIVE,
    reputationScore: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory: CategoryEntity = {
    id: 'cat-uuid-1',
    code: 'TRAFFIC',
    nameTr: 'Trafik Yoğunluğu',
    descriptionTr: 'Araç kuyrukları',
    icon: 'traffic-cone',
    colorHex: '#EA580C',
    defaultDurationHours: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvent: EventEntity = {
    id: 'event-uuid-1',
    authorId: mockUser.id,
    author: mockUser,
    categoryId: mockCategory.id,
    category: mockCategory,
    title: 'Ana Cadde Trafik Tıkanıklığı',
    description: 'Kavşakta araçlar ilerleyemiyor',
    severity: EventSeverity.MEDIUM,
    status: EventStatus.PENDING_REVIEW,
    location: '0101000020E61000003D0AD7A370BD41405C8FC2F5285C4340',
    addressText: 'Cumhuriyet Caddesi',
    city: 'Kayseri',
    district: 'Melikgazi',
    confirmationCount: 0,
    denialCount: 0,
    reliabilityScore: 1.0,
    expiresAt: new Date(Date.now() + 3 * 3600 * 1000),
    resolvedAt: null,
    isDemo: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    eventRepo = {
      findOne: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    };
    userRepo = {
      findOne: vi.fn(),
    };
    categoryRepo = {
      findOne: vi.fn(),
    };
    moderationLogRepo = {
      find: vi.fn(),
      save: vi.fn(),
      create: vi.fn(),
    };
    dataSource = {
      query: vi.fn(),
      transaction: vi.fn(async (cb: any) => cb({
        update: vi.fn(),
        save: vi.fn(),
        create: vi.fn((_cls: any, obj: any) => obj),
      })),
    };

    service = new EventsService(
      eventRepo as any,
      userRepo as any,
      categoryRepo as any,
      moderationLogRepo as any,
      dataSource as any,
    );
  });

  describe('Olay Oluşturma ve Doğrulama (create)', () => {
    it('hesap durumu aktif olmayan kullanıcının olay oluşturmasını ForbiddenException ile engellemeli', async () => {
      userRepo.findOne!.mockResolvedValue({
        ...mockUser,
        accountStatus: AccountStatus.SUSPENDED,
      });

      await expect(
        service.create(mockUser.id, {
          categoryId: mockCategory.id,
          title: 'Yeni Olay Başlığı',
          description: 'Açıklama metni burada',
          severity: EventSeverity.MEDIUM,
          latitude: 38.72,
          longitude: 35.48,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('pasif veya geçersiz kategori seçildiğinde BadRequestException fırlatmalı', async () => {
      userRepo.findOne!.mockResolvedValue(mockUser);
      categoryRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.create(mockUser.id, {
          categoryId: 'non-existent-cat',
          title: 'Yeni Olay Başlığı',
          description: 'Açıklama metni burada',
          severity: EventSeverity.MEDIUM,
          latitude: 38.72,
          longitude: 35.48,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('oluşturulan olayın başlangıç durumunu daima PENDING_REVIEW olarak kaydetmeli', async () => {
      userRepo.findOne!.mockResolvedValue(mockUser);
      categoryRepo.findOne!.mockResolvedValue(mockCategory);
      // Mükerrer kontrolü boş döner
      dataSource.query!.mockImplementation(async (sql: string) => {
        if (sql.includes('SELECT \n        id, title, "createdAt"')) {
          return [];
        }
        if (sql.includes('INSERT INTO "events"')) {
          return [{ id: mockEvent.id, createdAt: new Date(), updatedAt: new Date() }];
        }
        // findById için raw rows
        if (sql.includes('SELECT \n        e.id, e.title')) {
          return [
            {
              id: mockEvent.id,
              title: mockEvent.title,
              description: mockEvent.description,
              severity: mockEvent.severity,
              status: EventStatus.PENDING_REVIEW,
              authorId: mockUser.id,
              author_id: mockUser.id,
              author_display_name: mockUser.displayName,
              author_reputation_score: mockUser.reputationScore,
              category_id: mockCategory.id,
              category_code: mockCategory.code,
              category_name_tr: mockCategory.nameTr,
              category_description_tr: mockCategory.descriptionTr,
              category_icon: mockCategory.icon,
              category_color_hex: mockCategory.colorHex,
              category_default_duration_hours: mockCategory.defaultDurationHours,
              latitude: 38.72,
              longitude: 35.48,
              createdAt: new Date(),
              updatedAt: new Date(),
              expiresAt: new Date(),
            },
          ];
        }
        return [];
      });

      const result = await service.create(mockUser.id, {
        categoryId: mockCategory.id,
        title: 'Kavşakta Tıkanıklık',
        description: 'Trafik akışı tamamen durdu.',
        severity: EventSeverity.HIGH,
        latitude: 38.72,
        longitude: 35.48,
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(EventStatus.PENDING_REVIEW);
      expect(result.author.id).toBe(mockUser.id);
      expect(result.author.displayName).toBe(mockUser.displayName);
      // Hassas bilgilerin public yanıtta OLMADIĞINI doğrula
      expect((result.author as any).email).toBeUndefined();
      expect((result.author as any).passwordHash).toBeUndefined();
    });
  });

  describe('Durum Geçişleri ve Moderasyon Yetkilendirmesi (updateStatus)', () => {
    it('moderatör bekleyen bir olayı (PENDING_REVIEW) ACTIVE yapabilmeli', async () => {
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      const moderatorUser: JwtPayload = {
        sub: 'mod-uuid-1',
        email: 'moderator@sehirnabiz.local',
        role: UserRole.MODERATOR,
      };

      vi.spyOn(service, 'findById').mockResolvedValue({
        ...mockEvent,
        status: EventStatus.ACTIVE,
      } as any);

      const result = await service.updateStatus(
        mockEvent.id,
        { status: EventStatus.ACTIVE, reason: 'Uygun görüldü' },
        moderatorUser,
      );

      expect(result.status).toBe(EventStatus.ACTIVE);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('normal vatandaş bekleyen olayı onaylamaya kalkışırsa ForbiddenException almalı', async () => {
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      const citizenUser: JwtPayload = {
        sub: 'random-citizen-uuid',
        email: 'other@sehirnabiz.local',
        role: UserRole.CITIZEN,
      };

      await expect(
        service.updateStatus(
          mockEvent.id,
          { status: EventStatus.ACTIVE },
          citizenUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('olayın yazarı kendi aktif olayını RESOLVED (çözüldü) yapabilmeli', async () => {
      eventRepo.findOne!.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.ACTIVE,
      });

      const authorUser: JwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: UserRole.CITIZEN,
      };

      vi.spyOn(service, 'findById').mockResolvedValue({
        ...mockEvent,
        status: EventStatus.RESOLVED,
      } as any);

      const result = await service.updateStatus(
        mockEvent.id,
        { status: EventStatus.RESOLVED, reason: 'Arıza giderildi' },
        authorUser,
      );

      expect(result.status).toBe(EventStatus.RESOLVED);
    });

    it('başka bir vatandaşın aktif olayı RESOLVED yapması ForbiddenException ile engellenmeli', async () => {
      eventRepo.findOne!.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.ACTIVE,
      });

      const strangerUser: JwtPayload = {
        sub: 'stranger-uuid',
        email: 'stranger@sehirnabiz.local',
        role: UserRole.CITIZEN,
      };

      await expect(
        service.updateStatus(
          mockEvent.id,
          { status: EventStatus.RESOLVED },
          strangerUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('geçersiz bir durum geçişinde (örn. REJECTED durumundan ACTIVE) BadRequestException fırlatmalı', async () => {
      eventRepo.findOne!.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.REJECTED,
      });

      const moderatorUser: JwtPayload = {
        sub: 'mod-uuid-1',
        email: 'moderator@sehirnabiz.local',
        role: UserRole.MODERATOR,
      };

      await expect(
        service.updateStatus(
          mockEvent.id,
          { status: EventStatus.ACTIVE },
          moderatorUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Gizlilik ve Güvenlik (findById)', () => {
    it('moderatör veya yazar olmayan rastgele kullanıcıya PENDING_REVIEW olayı için 404 dönmeli', async () => {
      dataSource.query!.mockResolvedValue([
        {
          id: mockEvent.id,
          status: EventStatus.PENDING_REVIEW,
          authorId: mockUser.id,
        },
      ]);

      const stranger: JwtPayload = {
        sub: 'stranger-uuid',
        email: 'stranger@local',
        role: UserRole.CITIZEN,
      };

      await expect(service.findById(mockEvent.id, stranger)).rejects.toThrow(NotFoundException);
    });

    it('olayın yazarı kendi PENDING_REVIEW olayını görüntüleyebilmeli', async () => {
      dataSource.query!.mockResolvedValue([
        {
          id: mockEvent.id,
          title: mockEvent.title,
          description: mockEvent.description,
          severity: mockEvent.severity,
          status: EventStatus.PENDING_REVIEW,
          authorId: mockUser.id,
          author_id: mockUser.id,
          author_display_name: mockUser.displayName,
          author_reputation_score: mockUser.reputationScore,
          category_id: mockCategory.id,
          category_code: mockCategory.code,
          category_name_tr: mockCategory.nameTr,
          category_description_tr: mockCategory.descriptionTr,
          category_icon: mockCategory.icon,
          category_color_hex: mockCategory.colorHex,
          category_default_duration_hours: mockCategory.defaultDurationHours,
          latitude: 38.72,
          longitude: 35.48,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(),
        },
      ]);

      const authorUser: JwtPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: UserRole.CITIZEN,
      };

      const result = await service.findById(mockEvent.id, authorUser);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockEvent.id);
    });
  });
});
