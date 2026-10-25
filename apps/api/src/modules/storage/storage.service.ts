import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from './storage.interface';
import { Readable } from 'stream';

@Injectable()
export class StorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrlBase: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>(
      'STORAGE_ENDPOINT',
      'http://127.0.0.1:9000',
    );
    const region = this.configService.get<string>('STORAGE_REGION', 'auto');
    const accessKeyId = this.configService.get<string>(
      'STORAGE_ACCESS_KEY',
      'minio_admin_user',
    );
    const secretAccessKey = this.configService.get<string>(
      'STORAGE_SECRET_KEY',
      'minio_secure_dev_password',
    );
    const forcePathStyle = this.configService.get<boolean>(
      'STORAGE_FORCE_PATH_STYLE',
      true,
    );

    this.bucket = this.configService.get<string>(
      'STORAGE_BUCKET',
      'sehir-nabiz-media',
    );
    this.publicUrlBase = this.configService.get<string>(
      'STORAGE_PUBLIC_URL',
      `http://127.0.0.1:9000/${this.bucket}`,
    );

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`[Storage] Bucket '${this.bucket}' hazır.`);
    } catch (err: any) {
      if (
        err?.name === 'NotFound' ||
        err?.$metadata?.httpStatusCode === 404 ||
        err?.Code === 'NoSuchBucket'
      ) {
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucket }),
          );
          this.logger.log(`[Storage] Bucket '${this.bucket}' otomatik oluşturuldu.`);
        } catch (createErr) {
          this.logger.warn(`[Storage] Bucket oluşturma uyarısı: ${createErr}`);
        }
      } else {
        this.logger.warn(`[Storage] Bucket kontrol uyarısı: ${err?.message || err}`);
      }
    }
  }

  /**
   * İstemcinin doğrudan nesne yükleyebileceği kısa ömürlü Presigned URL üretir
   */
  async getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresInSeconds: number = 900, // 15 dakika
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  /**
   * Özel/gizli nesneyi indirmek için kısa ömürlü Presigned URL üretir
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds: number = 3600, // 1 saat
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  /**
   * Nesneyi Buffer olarak depolamadan çeker (Sunucu tarafı doğrulama ve işleme için)
   */
  async getObject(key: string): Promise<Buffer> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(`Dosya gövdesi boş: ${key}`);
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }

    return Buffer.concat(chunks);
  }

  /**
   * İşlenmiş/temizlenmiş görseli depolamaya yazar
   */
  async putObject(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  }

  /**
   * Nesnenin varlığını ve temel başlık bilgilerini sorgular
   */
  async headObject(
    key: string,
  ): Promise<{ contentLength: number; contentType: string } | null> {
    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        contentLength: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (err: any) {
      if (err?.name === 'NotFound' || err?.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Nesneyi depolamadan kalıcı olarak siler
   */
  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (err) {
      this.logger.warn(`Dosya silinirken hata: ${key} -> ${err}`);
    }
  }

  /**
   * Tahmin edilmesi imkansız, kullanıcı bilgisi içermeyen güvenli Storage Key üretir
   * Format: events/{eventId}/raw/{mediaId}.{ext}
   */
  generateStorageKey(eventId: string, mediaId: string, extension: string): string {
    const cleanExt = extension.replace(/^\./, '').toLowerCase();
    return `events/${eventId}/raw/${mediaId}.${cleanExt}`;
  }

  /**
   * Temizlenmiş/onaylanmış nesne için anahtar üretir
   * Format: events/{eventId}/clean/{mediaId}.webp
   */
  generateCleanStorageKey(eventId: string, mediaId: string): string {
    return `events/${eventId}/clean/${mediaId}.webp`;
  }

  /**
   * Genel okuma URL'si
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrlBase}/${key}`;
  }
}
