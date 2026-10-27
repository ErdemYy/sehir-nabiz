import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MediaService } from './media.service';
import { EventMediaEntity } from '../../database/entities/event-media.entity';
import { EventEntity } from '../../database/entities/event.entity';
import { StorageService } from '../storage/storage.service';
import { Repository, DataSource } from 'typeorm';
import {
  MediaStatus,
  EventStatus,
  UserRole,
  JwtPayload,
} from '@sehir-nabiz/shared';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('MediaService (Unit Tests)', () => {
  let service: MediaService;
  let mediaRepo: Partial<Record<keyof Repository<EventMediaEntity>, ReturnType<typeof vi.fn>>>;
  let eventRepo: Partial<Record<keyof Repository<EventEntity>, ReturnType<typeof vi.fn>>>;
  let storageService: Partial<Record<keyof StorageService, ReturnType<typeof vi.fn>>>;
  let dataSource: Partial<Record<keyof DataSource, ReturnType<typeof vi.fn>>>;

  const mockUser: JwtPayload = {
    sub: 'user-uuid-1',
    email: 'author@sehirnabiz.local',
    role: UserRole.CITIZEN,
  };

  const mockEvent: EventEntity = {
    id: 'event-uuid-1',
    authorId: mockUser.sub,
    title: 'Meydanda Kaza',
    description: 'Açıklama',
    severity: 'MEDIUM' as any,
    status: EventStatus.ACTIVE,
    location: '',
    confirmationCount: 0,
    denialCount: 0,
    disputeCount: 0,
    resolvedReportCount: 0,
    reliabilityScore: 1,
    expiresAt: new Date(),
    isDemo: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: null as any,
    categoryId: 'cat-1',
    category: null as any,
  };

  const mockMedia: EventMediaEntity = {
    id: 'media-uuid-1',
    eventId: mockEvent.id,
    event: mockEvent,
    uploadedById: mockUser.sub,
    uploadedBy: null as any,
    storageKey: `events/${mockEvent.id}/raw/media-uuid-1.jpg`,
    originalFileName: 'kaza.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024 * 500,
    status: MediaStatus.PENDING_UPLOAD,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mediaRepo = {
      findOne: vi.fn(),
      save: vi.fn(async (m: any) => m),
      find: vi.fn(),
    };
    eventRepo = {
      findOne: vi.fn(),
    };
    storageService = {
      generateStorageKey: vi.fn((e, m, ext) => `events/${e}/raw/${m}.${ext}`),
      generateCleanStorageKey: vi.fn((e, m) => `events/${e}/clean/${m}.webp`),
      getPresignedUploadUrl: vi.fn(async () => 'https://storage.test/upload-url'),
      getPresignedDownloadUrl: vi.fn(async () => 'https://storage.test/download-url'),
      getPublicUrl: vi.fn((key: string) => `https://storage.test/${key}`),
      headObject: vi.fn(),
      getObject: vi.fn(),
      putObject: vi.fn(),
      deleteObject: vi.fn(),
    };
    dataSource = {
      transaction: vi.fn(async (cb: any) =>
        cb({
          query: vi.fn(),
          count: vi.fn().mockResolvedValue(0),
          create: vi.fn((_cls: any, obj: any) => obj),
          save: vi.fn(async (obj: any) => obj),
        }),
      ),
    };

    service = new MediaService(
      mediaRepo as any,
      eventRepo as any,
      storageService as any,
      dataSource as any,
    );
  });

  describe('generateUploadUrl', () => {
    it('olay bulunamazsa NotFoundException fırlatmalı', async () => {
      eventRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.generateUploadUrl(
          'non-existent-event',
          { fileName: 'kaza.jpg', mimeType: 'image/jpeg', fileSize: 5000 },
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('yetkisiz kullanıcı (olayın yazarı veya moderatör olmayan) için ForbiddenException fırlatmalı', async () => {
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      const stranger: JwtPayload = {
        sub: 'stranger-uuid',
        email: 'stranger@local',
        role: UserRole.CITIZEN,
      };

      await expect(
        service.generateUploadUrl(
          mockEvent.id,
          { fileName: 'kaza.jpg', mimeType: 'image/jpeg', fileSize: 5000 },
          stranger,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('çözülmüş (RESOLVED) bir olaya görsel yüklenmeye çalışıldığında BadRequestException fırlatmalı', async () => {
      eventRepo.findOne!.mockResolvedValue({
        ...mockEvent,
        status: EventStatus.RESOLVED,
      });

      await expect(
        service.generateUploadUrl(
          mockEvent.id,
          { fileName: 'kaza.jpg', mimeType: 'image/jpeg', fileSize: 5000 },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('desteklenmeyen bir MIME tipinde (örn. SVG veya PDF) BadRequestException fırlatmalı', async () => {
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      await expect(
        service.generateUploadUrl(
          mockEvent.id,
          { fileName: 'zararli.svg', mimeType: 'image/svg+xml' as any, fileSize: 5000 },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('dosya boyutu 8 MB sınırını aştığında BadRequestException fırlatmalı', async () => {
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      await expect(
        service.generateUploadUrl(
          mockEvent.id,
          { fileName: 'huge.jpg', mimeType: 'image/jpeg', fileSize: 9 * 1024 * 1024 },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('olayda halihazırda 3 adet görsel varsa 4. görsel isteğini engellemeli (3 görsel sınırı)', async () => {
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      dataSource.transaction = vi.fn(async (cb: any) =>
        cb({
          query: vi.fn(),
          count: vi.fn().mockResolvedValue(3), // 3 adet mevcut
        }),
      );

      await expect(
        service.generateUploadUrl(
          mockEvent.id,
          { fileName: 'kaza4.jpg', mimeType: 'image/jpeg', fileSize: 5000 },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('geçerli istekte presigned upload URL ve storageKey başarıyla üretilmeli', async () => {
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      const result = await service.generateUploadUrl(
        mockEvent.id,
        { fileName: 'kaza.jpg', mimeType: 'image/jpeg', fileSize: 5000 },
        mockUser,
      );

      expect(result).toBeDefined();
      expect(result.uploadUrl).toBe('https://storage.test/upload-url');
      expect(result.mediaId).toBeDefined();
      expect(result.storageKey).toContain(mockEvent.id);
      expect(result.expiresInSeconds).toBe(900);
    });
  });

  describe('completeUpload', () => {
    it('medya kaydı bulunamazsa NotFoundException fırlatmalı', async () => {
      mediaRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.completeUpload(mockEvent.id, 'non-existent-media', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('dosya depolama sunucusunda bulunamazsa (yükleme yapılmamışsa) BadRequestException fırlatmalı', async () => {
      mediaRepo.findOne!.mockResolvedValue(mockMedia);
      storageService.headObject!.mockResolvedValue(null);

      await expect(
        service.completeUpload(mockEvent.id, mockMedia.id, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('magic bytes doğrulamasında sahte MIME tipi tespit edilirse dosyayı karantinaya alıp reddetmeli', async () => {
      mediaRepo.findOne!.mockResolvedValue(mockMedia);
      storageService.headObject!.mockResolvedValue({
        contentLength: 100,
        contentType: 'image/jpeg',
      });
      // Sahte dosya içeriği (JPEG yerine metin / HTML)
      const fakeBuffer = Buffer.from('<script>alert("hacked")</script>');
      storageService.getObject!.mockResolvedValue(fakeBuffer);

      await expect(
        service.completeUpload(mockEvent.id, mockMedia.id, mockUser),
      ).rejects.toThrow(BadRequestException);

      expect(mediaRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MediaStatus.REJECTED,
        }),
      );
      expect(storageService.deleteObject).toHaveBeenCalledWith(mockMedia.storageKey);
    });
  });

  describe('deleteMedia', () => {
    it('yetkili yazar medyayı başarıyla sildiğinde depolamadan kaldırmalı ve DELETED yapmalı', async () => {
      mediaRepo.findOne!.mockResolvedValue(mockMedia);
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      const result = await service.deleteMedia(mockEvent.id, mockMedia.id, mockUser);

      expect(result.success).toBe(true);
      expect(storageService.deleteObject).toHaveBeenCalledWith(mockMedia.storageKey);
      expect(mediaRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MediaStatus.DELETED,
        }),
      );
    });

    it('yetkisiz kullanıcının silme denemesi ForbiddenException ile engellenmeli', async () => {
      mediaRepo.findOne!.mockResolvedValue(mockMedia);
      eventRepo.findOne!.mockResolvedValue(mockEvent);

      const stranger: JwtPayload = {
        sub: 'stranger-uuid',
        email: 'stranger@local',
        role: UserRole.CITIZEN,
      };

      await expect(
        service.deleteMedia(mockEvent.id, mockMedia.id, stranger),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
