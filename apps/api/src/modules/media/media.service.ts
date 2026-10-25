import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import sharp from 'sharp';
import { EventMediaEntity } from '../../database/entities/event-media.entity';
import { EventEntity } from '../../database/entities/event.entity';
import { StorageService } from '../storage/storage.service';
import {
  MediaStatus,
  EventStatus,
  UserRole,
  JwtPayload,
  EventMediaDto,
  UploadUrlResponseDto,
} from '@sehir-nabiz/shared';
import { UploadUrlDto, ALLOWED_MIME_TYPES } from './dto/upload-url.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  // Güvenlik sınırları
  private readonly MAX_FILES_PER_EVENT = 3;
  private readonly MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
  private readonly MAX_PIXELS = 25_000_000; // 25 Megapiksel (Decompression bomb koruması)
  private readonly MAX_DIMENSION = 8192; // 8K azami piksel kenarı

  constructor(
    @InjectRepository(EventMediaEntity)
    private readonly mediaRepository: Repository<EventMediaEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 1. Presigned Upload URL Üretimi (POST /events/:id/media/upload-url)
   * - 3 dosya sınırı transaction lock ile denetlenir (Eşzamanlı yarış koruması)
   * - Güvenli, tahmin edilemez storage key üretilir
   */
  async generateUploadUrl(
    eventId: string,
    dto: UploadUrlDto,
    user: JwtPayload,
  ): Promise<UploadUrlResponseDto> {
    // 1. Olayı doğrula
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    // Yetki kontrolü: Yalnızca olayın yazarı veya moderatör/admin görsel yükleyebilir
    const isAuthor = event.authorId === user.sub;
    const isModerator =
      user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;
    if (!isAuthor && !isModerator) {
      throw new ForbiddenException('Bu olaya görsel yükleme yetkiniz bulunmamaktadır.');
    }

    // Olay durumu kontrolü
    if (
      event.status === EventStatus.RESOLVED ||
      event.status === EventStatus.REJECTED ||
      event.status === EventStatus.EXPIRED
    ) {
      throw new BadRequestException('Kapanmış, çözülmüş veya reddedilmiş bir olaya yeni görsel eklenemez.');
    }

    // 2. MIME & Boyut Kontrolü
    if (!ALLOWED_MIME_TYPES.includes(dto.mimeType as any)) {
      throw new BadRequestException('Desteklenmeyen dosya formatı. Yalnızca JPEG, PNG ve WebP kabul edilir.');
    }
    if (dto.fileSize > this.MAX_FILE_SIZE) {
      throw new BadRequestException('Dosya boyutu 8 MB sınırını aşamaz.');
    }

    // 3. Eşzamanlılık Korumalı Dosya Sayısı Kontrolü (Transaction + Pessimistic Lock)
    const mediaId = crypto.randomUUID();
    const extension = this.getExtensionFromMime(dto.mimeType);
    const storageKey = this.storageService.generateStorageKey(eventId, mediaId, extension);

    await this.dataSource.transaction(async manager => {
      // Olay satırını kilitle
      await manager.query(`SELECT id FROM "events" WHERE id = $1 FOR UPDATE;`, [eventId]);

      const activeCount = await manager.count(EventMediaEntity, {
        where: [
          { eventId, status: MediaStatus.PENDING_UPLOAD },
          { eventId, status: MediaStatus.PROCESSING },
          { eventId, status: MediaStatus.READY },
        ],
      });

      if (activeCount >= this.MAX_FILES_PER_EVENT) {
        throw new BadRequestException(
          `Bir olay için en fazla ${this.MAX_FILES_PER_EVENT} adet görsel eklenebilir.`,
        );
      }

      // Medya kaydını PENDING_UPLOAD olarak oluştur
      const mediaRecord = manager.create(EventMediaEntity, {
        id: mediaId,
        eventId,
        uploadedById: user.sub,
        storageKey,
        originalFileName: dto.fileName.substring(0, 255),
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        status: MediaStatus.PENDING_UPLOAD,
      });

      await manager.save(mediaRecord);
    });

    // 4. Presigned Upload URL Üret (15 dakika geçerli)
    const uploadUrl = await this.storageService.getPresignedUploadUrl(
      storageKey,
      dto.mimeType,
      900,
    );

    return {
      mediaId,
      uploadUrl,
      storageKey,
      expiresInSeconds: 900,
    };
  }

  /**
   * 2. Yükleme Tamamlama ve Güvenli Doğrulama (POST /events/:id/media/:mediaId/complete)
   * - Nesnenin depolamada varlığını doğrular
   * - Magic bytes ve dosya imzasını inceler
   * - EXIF, GPS ve kamera meta verilerini Sharp ile temizler
   * - Decompression bomb (piksel bombası) saldırılarını engeller
   * - Görseli güvenli WebP formatında optimize ederek READY yapar
   */
  async completeUpload(
    eventId: string,
    mediaId: string,
    user: JwtPayload,
  ): Promise<EventMediaDto> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, eventId },
    });

    if (!media) {
      throw new NotFoundException('Medya kaydı bulunamadı.');
    }

    if (media.status === MediaStatus.READY) {
      return this.toDto(media);
    }

    if (media.status !== MediaStatus.PENDING_UPLOAD) {
      throw new BadRequestException(`Geçersiz medya durumu: ${media.status}`);
    }

    // Yetki kontrolü: Yükleyen kullanıcı veya moderatör
    const isUploader = media.uploadedById === user.sub;
    const isModerator =
      user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;
    if (!isUploader && !isModerator) {
      throw new ForbiddenException('Bu medyayı doğrulama yetkiniz bulunmamaktadır.');
    }

    // 1. Depolamada nesnenin varlığını doğrula
    const head = await this.storageService.headObject(media.storageKey);
    if (!head || head.contentLength === 0) {
      throw new BadRequestException(
        'Dosya depolama sunucusunda bulunamadı. Lütfen önce görseli presigned URL ile yükleyiniz.',
      );
    }

    if (head.contentLength > this.MAX_FILE_SIZE) {
      await this.quarantineFile(media, 'Dosya boyutu 8 MB sınırını aşıyor.');
      throw new BadRequestException('Yüklenen dosya izin verilen 8 MB sınırını aşıyor.');
    }

    // 2. Ham dosyayı sunucu belleğine indir
    const rawBuffer = await this.storageService.getObject(media.storageKey);

    // 3. Magic Bytes (Dosya İmzası) Doğrulaması
    const detectedType = this.verifyMagicBytes(rawBuffer);
    if (!detectedType) {
      await this.quarantineFile(media, 'Sahte veya geçersiz görsel imzası (Magic bytes mismatch).');
      throw new BadRequestException('Yüklenen dosya geçerli bir raster görsel formatında değil.');
    }

    // 4. Sharp ile Görsel Analizi, Boyut Kontrolü ve EXIF Temizleme
    try {
      const imagePipeline = sharp(rawBuffer, {
        failOn: 'error',
        limitInputPixels: this.MAX_PIXELS, // Piksel bombası koruması
      });

      const metadata = await imagePipeline.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Görsel boyutları okunamadı.');
      }

      if (metadata.width > this.MAX_DIMENSION || metadata.height > this.MAX_DIMENSION) {
        await this.quarantineFile(media, `Görsel çözünürlüğü çok yüksek (${metadata.width}x${metadata.height}).`);
        throw new BadRequestException('Görsel çözünürlüğü izin verilen 8192px sınırını aşıyor.');
      }

      // EXIF / GPS METADATA TEMİZLEME VE GÜVENLİ WEBP RE-ENCODE
      // .rotate() ile yön bilgisini piksel düzeyinde uygular, tüm EXIF ve meta verilerini strip eder
      const sanitizedBuffer = await imagePipeline
        .rotate()
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      const sanitizedMetadata = await sharp(sanitizedBuffer).metadata();
      const checksum = crypto.createHash('sha256').update(sanitizedBuffer).digest('hex');

      // 5. Temizlenmiş görseli depolamaya kaydet
      const cleanKey = this.storageService.generateCleanStorageKey(eventId, mediaId);
      await this.storageService.putObject(cleanKey, sanitizedBuffer, 'image/webp');

      // Ham/güvensiz orijinal dosyayı depolamadan derhal sil
      if (cleanKey !== media.storageKey) {
        await this.storageService.deleteObject(media.storageKey);
      }

      // 6. Veritabanı kaydını güncelle
      media.storageKey = cleanKey;
      media.mimeType = 'image/webp';
      media.fileSize = sanitizedBuffer.length;
      media.width = sanitizedMetadata.width || metadata.width;
      media.height = sanitizedMetadata.height || metadata.height;
      media.checksum = checksum;
      media.status = MediaStatus.READY;
      media.verifiedAt = new Date();
      media.rejectionReason = null;

      const savedMedia = await this.mediaRepository.save(media);
      this.logger.log(`Medya başarıyla doğrulandı ve EXIF temizlendi: ${mediaId} (Event: ${eventId})`);

      return this.toDto(savedMedia);
    } catch (err: any) {
      this.logger.error(`Görsel işleme hatası: ${err?.message || err}`);
      await this.quarantineFile(media, `Görsel işleme hatası: ${err?.message || 'Bozuk dosya'}`);
      throw new BadRequestException('Yüklenen görsel işlenemedi veya bozuk.');
    }
  }

  /**
   * 3. Olay Medyalarını Listeleme (GET /events/:id/media)
   * - Gizlilik kuralları: PENDING_REVIEW veya REJECTED olayların medyasını anonim kullanıcılara göstermez
   */
  async getEventMedia(eventId: string, user?: JwtPayload): Promise<EventMediaDto[]> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    const isAuthor = user && user.sub === event.authorId;
    const isModerator =
      user && (user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN);

    if (
      (event.status === EventStatus.PENDING_REVIEW || event.status === EventStatus.REJECTED) &&
      !isAuthor &&
      !isModerator
    ) {
      throw new NotFoundException('Olay bulunamadı.');
    }

    // Halka açık sorgularda yalnızca READY medyalar listelenir
    const mediaList = await this.mediaRepository.find({
      where: {
        eventId,
        status: MediaStatus.READY,
      },
      order: { createdAt: 'ASC' },
    });

    return mediaList.map(m => this.toDto(m));
  }

  /**
   * 4. Medya Silme (DELETE /events/:id/media/:mediaId)
   * - İdempotent silme
   * - Dosyayı depolamadan ve veritabanından güvenle kaldırır
   */
  async deleteMedia(
    eventId: string,
    mediaId: string,
    user: JwtPayload,
  ): Promise<{ success: boolean; message: string }> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, eventId },
    });

    if (!media) {
      throw new NotFoundException('Medya bulunamadı.');
    }

    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    const isUploader = media.uploadedById === user.sub;
    const isEventAuthor = event && event.authorId === user.sub;
    const isModerator =
      user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN;

    if (!isUploader && !isEventAuthor && !isModerator) {
      throw new ForbiddenException('Bu medyayı silme yetkiniz bulunmamaktadır.');
    }

    // Depolamadan kaldır
    await this.storageService.deleteObject(media.storageKey);

    // Durumu DELETED yap
    media.status = MediaStatus.DELETED;
    await this.mediaRepository.save(media);

    return {
      success: true,
      message: 'Görsel başarıyla silindi.',
    };
  }

  /**
   * Güvenlik: Magic Bytes Kontrolü
   */
  private verifyMagicBytes(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
    if (buffer.length < 12) return null;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return 'image/png';
    }

    // WebP: RIFF (bytes 0-3) ve WEBP (bytes 8-11)
    const riff = buffer.toString('ascii', 0, 4);
    const webp = buffer.toString('ascii', 8, 12);
    if (riff === 'RIFF' && webp === 'WEBP') {
      return 'image/webp';
    }

    return null;
  }

  /**
   * Dosyayı karantinaya al veya depolamadan temizle
   */
  private async quarantineFile(media: EventMediaEntity, reason: string): Promise<void> {
    media.status = MediaStatus.REJECTED;
    media.rejectionReason = reason;
    await this.mediaRepository.save(media);
    await this.storageService.deleteObject(media.storageKey);
  }

  private getExtensionFromMime(mime: string): string {
    switch (mime) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'bin';
    }
  }

  private toDto(m: EventMediaEntity): EventMediaDto {
    return {
      id: m.id,
      eventId: m.eventId,
      storageKey: m.storageKey,
      url: this.storageService.getPublicUrl(m.storageKey),
      mimeType: m.mimeType,
      fileSize: Number(m.fileSize),
      width: m.width || undefined,
      height: m.height || undefined,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }
}
