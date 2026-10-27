import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload, AccountStatus } from '@sehir-nabiz/shared';
import { UserEntity } from '../../../database/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ACCESS_SECRET',
        'sehir_nabiz_default_access_jwt_secret_key_32chars_min!',
      ),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş oturum belirteci.');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, accountStatus: true },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı hesabı bulunamadı veya silinmiş.');
    }

    if (
      user.accountStatus === AccountStatus.DELETED ||
      user.accountStatus === AccountStatus.PENDING_DELETION ||
      user.accountStatus === AccountStatus.SUSPENDED
    ) {
      throw new UnauthorizedException('Kullanıcı hesabı aktif değil veya silinmiş.');
    }

    return payload;
  }
}
