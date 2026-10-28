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
import type { Request } from 'express';

@Injectable()
export class DiagnosticsGuard implements CanActivate {
  private readonly logger = new Logger(DiagnosticsGuard.name);

  constructor(
    @Optional() private readonly configService?: ConfigService,
    @Optional() private readonly jwtService?: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const expectedSecret =
      this.configService?.get<string>('DIAGNOSTICS_SECRET') ||
      process.env.DIAGNOSTICS_SECRET ||
      'staging_internal_diagnostics_secret_token_2026!';

    // 1. Secret Key Başlığı Denetimi (x-diagnostics-key)
    const headerKey = req.headers['x-diagnostics-key'];
    if (headerKey && headerKey === expectedSecret) {
      return true;
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

    // 3. Dahili Ağ / Localhost İzin Kontrolü (Opsiyonel konfigürasyon ile)
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
    if (isLoopback && allowInternal) {
      return true;
    }

    this.logger.warn(
      `Yetkisiz diagnostics erişim denemesi: IP=${clientIp}, HasToken=${Boolean(authHeader)}, HasSecret=${Boolean(headerKey)}`,
    );

    throw new ForbiddenException(
      'Diagnostics uç noktasına erişim yetkiniz bulunmamaktadır. Yalnızca ADMIN yetkisi veya geçerli x-diagnostics-key gereklidir.',
    );
  }
}
