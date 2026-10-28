import { Injectable, ExecutionContext, UnauthorizedException, Optional } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { AccountStatus } from '@sehir-nabiz/shared';
import { ALLOW_PENDING_DELETION_KEY } from '../../../common/decorators/allow-pending-deletion.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Optional() private readonly reflector?: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info?: any,
    context?: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Bu işlem için geçerli bir kimlik doğrulaması gereklidir.');
    }

    const jwtUser = user as any;
    if (jwtUser.accountStatus === AccountStatus.PENDING_DELETION && context) {
      const allowPending = this.reflector?.getAllAndOverride<boolean>(
        ALLOW_PENDING_DELETION_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!allowPending) {
        throw new UnauthorizedException(
          'Hesabınız silinme bekleme sürecindedir. Bu işlemi gerçekleştirmek için önce silme talebinizi iptal etmelisiniz.',
        );
      }
    }

    return user;
  }
}
