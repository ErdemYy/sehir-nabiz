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

    // Üretim / Canlı Gönderim
    try {
      const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      }));

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      };

      const accessToken = this.configService.get<string>('EXPO_ACCESS_TOKEN');
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(this.expoApiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        throw new Error(`Expo Push API HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const receipts = result.data || [];
      const invalidTokens: string[] = [];

      receipts.forEach((receipt: any, idx: number) => {
        if (receipt.status === 'error') {
          if (
            receipt.details?.error === 'DeviceNotRegistered' ||
            receipt.message?.includes('not registered')
          ) {
            const token = validTokens[idx];
            if (token) {
              invalidTokens.push(token);
            }
          }
        }
      });

      // Geçersizleşmiş (DeviceNotRegistered) tokenları temizle
      if (invalidTokens.length > 0) {
        this.logger.warn(
          `[PushNotificationService] ${invalidTokens.length} cihaz kaydı silinmiş token pasifleştiriliyor.`,
        );
        await this.pushTokenRepository
          .createQueryBuilder()
          .update(DevicePushTokenEntity)
          .set({ isActive: false })
          .where('token IN (:...tokens)', { tokens: invalidTokens })
          .execute()
          .catch(() => {});
      }

      return {
        sentCount: validTokens.length - invalidTokens.length,
        failedCount: invalidTokens.length,
        invalidTokens,
        isSimulated: false,
      };
    } catch (err) {
      this.logger.error(
        `[PushNotificationService] Push gönderim hatası: ${(err as Error).message}`,
      );
      return {
        sentCount: 0,
        failedCount: validTokens.length,
        invalidTokens: [],
        isSimulated: false,
      };
    }
  }
}
