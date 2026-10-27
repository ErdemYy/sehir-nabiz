import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DevicePushTokenEntity } from '../../database/entities/device-push-token.entity';

export interface PushNotificationPayload {
  to: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
}

export interface PushSendResult {
  sentCount: number;
  failedCount: number;
  invalidTokens: string[];
  isSimulated: boolean;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly expoApiUrl = 'https://exp.host/--/api/v2/push/send';
  private readonly isProduction: boolean;

  constructor(
    @InjectRepository(DevicePushTokenEntity)
    private readonly pushTokenRepository: Repository<DevicePushTokenEntity>,
    private readonly configService: ConfigService,
  ) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Expo Push Token Geçerlilik Formatı Kontrolü
   */
  isValidExpoPushToken(token: string): boolean {
    return (
      typeof token === 'string' &&
      (((token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')) &&
        token.endsWith(']')) ||
        /^[a-z0-9-_]{22,32}$/i.test(token))
    );
  }

  /**
   * Push Bildirimi Gönderme (Batch Destekli)
   */
  async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<PushSendResult> {
    if (!tokens || tokens.length === 0) {
      return { sentCount: 0, failedCount: 0, invalidTokens: [], isSimulated: false };
    }

    const validTokens = tokens.filter(t => this.isValidExpoPushToken(t));
    const malformedTokens = tokens.filter(t => !this.isValidExpoPushToken(t));

    // Hatalı biçimli tokenları doğrudan devre dışı bırak
    if (malformedTokens.length > 0) {
      this.logger.warn(
        `[PushNotificationService] ${malformedTokens.length} adet geçersiz biçimli push token tespit edildi.`,
      );
      await this.pushTokenRepository
        .createQueryBuilder()
        .update(DevicePushTokenEntity)
        .set({ isActive: false })
        .where('token IN (:...tokens)', { tokens: malformedTokens })
        .execute()
        .catch(() => {});
    }

    if (validTokens.length === 0) {
      return {
        sentCount: 0,
        failedCount: malformedTokens.length,
        invalidTokens: malformedTokens,
        isSimulated: false,
      };
    }

    // Geliştirme / Test ortamı: Kontrollü Simülasyon Adaptörü
    // (Gerçek EAS/FCM kimlik bilgileri olmadan API hatası almamak ve gereksiz dış ağ trafiği üretmemek için)
    const hasExpoAccessToken = Boolean(
      this.configService.get<string>('EXPO_ACCESS_TOKEN'),
    );

    if (!this.isProduction && !hasExpoAccessToken) {
      this.logger.log(
        `[PushNotificationService - DEV ADAPTER] Push simüle edildi: Alıcı=${validTokens.length}, Başlık="${title}", Gövde="${body}"`,
      );
      return {
        sentCount: validTokens.length,
        failedCount: malformedTokens.length,
        invalidTokens: malformedTokens,
        isSimulated: true,
      };
    }

    // Üretim / Canlı Gönderim (Expo Push API: 100'lük gruplar - Batching)
    const CHUNK_SIZE = 100;
    let totalSent = 0;
    let totalFailed = malformedTokens.length;
    const allInvalidTokens: string[] = [...malformedTokens];

    const accessToken = this.configService.get<string>('EXPO_ACCESS_TOKEN');
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    for (let i = 0; i < validTokens.length; i += CHUNK_SIZE) {
      const chunkTokens = validTokens.slice(i, i + CHUNK_SIZE);
      const messages = chunkTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      }));

      let chunkAttempt = 0;
      const maxChunkRetries = 2;
      let success = false;

      while (chunkAttempt <= maxChunkRetries && !success) {
        try {
          chunkAttempt++;
          const response = await fetch(this.expoApiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(messages),
          });

          // Geçici hata durumu (Rate Limit veya Servis Kesintisi): Exponential backoff ile tekrar dene
          if ((response.status === 429 || response.status >= 500) && chunkAttempt <= maxChunkRetries) {
            const backoffMs = Math.pow(2, chunkAttempt) * 1000 + Math.floor(Math.random() * 200);
            this.logger.warn(
              `[PushNotificationService] Expo API HTTP ${response.status} geçici hata. ${backoffMs}ms sonra yeniden deneniyor... (Deneme ${chunkAttempt}/${maxChunkRetries})`,
            );
            await new Promise(r => setTimeout(r, backoffMs));
            continue;
          }

          if (!response.ok) {
            throw new Error(`Expo Push API HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          const receipts = result.data || [];
          const chunkInvalidTokens: string[] = [];

          receipts.forEach((receipt: any, idx: number) => {
            if (receipt.status === 'error') {
              const errCode = receipt.details?.error;
              if (
                errCode === 'DeviceNotRegistered' ||
                errCode === 'InvalidCredentials' ||
                receipt.message?.includes('not registered')
              ) {
                const token = chunkTokens[idx];
                if (token) {
                  chunkInvalidTokens.push(token);
                }
              }
            }
          });

          // Geçersizleşmiş (DeviceNotRegistered / InvalidCredentials) tokenları temizle
          if (chunkInvalidTokens.length > 0) {
            allInvalidTokens.push(...chunkInvalidTokens);
            this.logger.warn(
              `[PushNotificationService] ${chunkInvalidTokens.length} adet geçersizleşmiş (DeviceNotRegistered) token pasifleştiriliyor.`,
            );
            await this.pushTokenRepository
              .createQueryBuilder()
              .update(DevicePushTokenEntity)
              .set({ isActive: false })
              .where('token IN (:...tokens)', { tokens: chunkInvalidTokens })
              .execute()
              .catch(() => {});
          }

          totalSent += chunkTokens.length - chunkInvalidTokens.length;
          totalFailed += chunkInvalidTokens.length;
          success = true;
        } catch (err) {
          if (chunkAttempt > maxChunkRetries) {
            this.logger.error(
              `[PushNotificationService] Chunk gönderim hatası (tüm denemeler tükendi): ${(err as Error).message}`,
            );
            totalFailed += chunkTokens.length;
          } else {
            const backoffMs = Math.pow(2, chunkAttempt) * 500;
            await new Promise(r => setTimeout(r, backoffMs));
          }
        }
      }
    }

    return {
      sentCount: totalSent,
      failedCount: totalFailed,
      invalidTokens: allInvalidTokens,
      isSimulated: false,
    };
  }
}
