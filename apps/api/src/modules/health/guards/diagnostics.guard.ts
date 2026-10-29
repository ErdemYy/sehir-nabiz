import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@sehir-nabiz/shared';
import * as crypto from 'crypto';
import type { Request } from 'express';

@Injectable()
export class DiagnosticsGuard implements CanActivate {
  private readonly logger = new Logger(DiagnosticsGuard.name);

  constructor(
    @Optional() private readonly configService?: ConfigService,
    @Optional() private readonly jwtService?: JwtService,
  ) {}

  /**
   * Zamanlama saldırılarını (timing attack) önlemek için sabit zamanlı string karşılaştırması
   */
  private timingSafeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const nodeEnv =
      this.configService?.get<string>('NODE_ENV') ||
      process.env.NODE_ENV ||
      'development';

    const secretEnv =
      this.configService?.get<string>('DIAGNOSTICS_SECRET') ||
      process.env.DIAGNOSTICS_SECRET;

    // 1. Secret Key Başlığı Denetimi (x-diagnostics-key) & Secret Rotation Desteği
    const headerKey = req.headers['x-diagnostics-key'];
    if (headerKey && typeof headerKey === 'string' && secretEnv) {
      // Virgülle ayrılmış çoklu secret desteği (Zero-downtime secret rotation)
      const validSecrets = secretEnv
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const isSecretValid = validSecrets.some(sec => this.timingSafeCompare(headerKey, sec));
      if (isSecretValid) {
        return true;
      }
    }

    // 2. JWT Bearer Token & ADMIN Rolü Denetimi
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const accessSecret =
          this.configService?.get<string>('JWT_ACCESS_SECRET') ||
          process.env.JWT_ACCESS_SECRET ||
          'sehir_nabiz_default_access_jwt_secret_key_32chars_min!';

        if (this.jwtService) {
          const payload = await this.jwtService.verifyAsync(token, {
            secret: accessSecret,
          });
          if (payload && payload.role === UserRole.ADMIN) {
            (req as any).user = payload;
            return true;
          }
        }
      } catch {
        // Geçersiz veya süresi dolmuş token durumunda sessizce devam et
      }
    }

    // 3. Dahili Ağ / Localhost İzin Kontrolü (Yalnızca geliştirme/test ortamında açıkça etkinleştirilmişse)
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';

    const isLoopback =
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp === '::ffff:127.0.0.1' ||
      clientIp === 'localhost';

    const allowInternal = process.env.ALLOW_INTERNAL_DIAGNOSTICS === 'true';
    if (isLoopback && allowInternal && nodeEnv !== 'production') {
      return true;
    }

    // 4. Log Sanitization: Asla token, secret veya hassas başlık içeriğini loglama
    this.logger.warn(
      `Yetkisiz diagnostics erişim denemesi: IP=${clientIp || 'unknown'}, HasAuth=${Boolean(authHeader)}, HasSecretHeader=${Boolean(headerKey)}`,
    );

    throw new ForbiddenException(
      'Diagnostics uç noktasına erişim yetkiniz bulunmamaktadır. Yalnızca ADMIN yetkisi veya geçerli x-diagnostics-key gereklidir.',
    );
  }
}
