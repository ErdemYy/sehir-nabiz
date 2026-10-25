import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser | null {
    // Kimlik doğrulama token'ı yoksa veya geçersizse hata fırlatma; anonim isteğe izin ver
    return user || null;
  }
}
