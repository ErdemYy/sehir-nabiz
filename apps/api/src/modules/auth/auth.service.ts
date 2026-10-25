import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import {
  UserRole,
  AccountStatus,
  RegisterInput,
  LoginInput,
  AuthResponse,
  AuthTokens,
  UserResponse,
  JwtPayload,
} from '@sehir-nabiz/shared';
import { UserEntity, RefreshTokenEntity } from '../../database/entities';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 12;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Yeni Kullanıcı Kaydı
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // 1. Mükerrer E-posta Kontrolü
    const existing = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Bu e-posta adresiyle kayıtlı bir hesap zaten bulunmaktadır.');
    }

    // 2. Güvenli Şifre Hashleme
    const passwordHash = await this.hashPassword(input.password);

    // 3. Kullanıcıyı Kaydet
    const newUser = this.userRepository.create({
      email: normalizedEmail,
      displayName: input.displayName.trim(),
      passwordHash,
      role: UserRole.CITIZEN,
      accountStatus: AccountStatus.ACTIVE,
      reputationScore: 10,
    });

    const savedUser = await this.userRepository.save(newUser);

    // 4. Token Üretimi ve Oturum Başlatma
    const tokens = await this.generateTokens(savedUser);
    await this.persistRefreshToken(savedUser.id, tokens.refreshToken);

    return {
      user: this.toUserResponse(savedUser),
      tokens,
    };
  }

  /**
   * Güvenli Kullanıcı Girişi
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Kullanıcıyı şifre hash'i ile birlikte getir
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: normalizedEmail })
      .getOne();

    // Generic Hata Mesajı (Zamanlama ve kullanıcı varlığı sızdırmaz)
    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    // Hesap Durumu Kontrolü
    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException('Hesabınız askıya alınmıştır. Destek ekibiyle iletişime geçiniz.');
    }

    // Şifre Doğrulama
    const isPasswordValid = await this.comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    // Token Çifti Üretimi
    const tokens = await this.generateTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toUserResponse(user),
      tokens,
    };
  }

  /**
   * Rotasyonlu Refresh Token & Token Reuse Detection
   */
  async refreshTokens(refreshTokenStr: string): Promise<AuthTokens> {
    // 1. JWT Doğrulaması
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshTokenStr, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş oturum belirteci.');
    }

    const tokenHash = this.hashToken(refreshTokenStr);

    // 2. Veritabanında Token Ara
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    // 3. KRİTİK GÜVENLİK: Token Reuse Tespiti
    if (tokenRecord && tokenRecord.isRevoked) {
      this.logger.warn(
        `[SECURITY] Token Reuse Tespit Edildi! Kullanıcı ID: ${payload.sub}. Tüm aktif oturumlar iptal ediliyor.`,
      );
      // Bu kullanıcının tüm aktif oturumlarını iptal et (Compromise Recovery)
      await this.refreshTokenRepository.update(
        { userId: payload.sub, isRevoked: false },
        { isRevoked: true },
      );
      throw new UnauthorizedException(
        'Güvenlik ihlali tespit edildi: Oturum sonlandırıldı. Lütfen tekrar giriş yapınız.',
      );
    }

    if (!tokenRecord) {
      throw new UnauthorizedException('Geçersiz veya tanınmayan oturum kaydı.');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Oturum süresi dolmuş. Lütfen tekrar giriş yapınız.');
    }

    // 4. Kullanıcıyı Getir
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.accountStatus === AccountStatus.SUSPENDED) {
      throw new UnauthorizedException('Kullanıcı hesabı aktif değil.');
    }

    // 5. Yeni Token Çifti Üret (Rotation)
    const newTokens = await this.generateTokens(user);
    const newTokenHash = this.hashToken(newTokens.refreshToken);

    // 6. Eski Token'ı İptal Et ve Değişim Zincirini Kaydet
    tokenRecord.isRevoked = true;
    tokenRecord.replacedByTokenHash = newTokenHash;
    await this.refreshTokenRepository.save(tokenRecord);

    // 7. Yeni Token'ı Kaydet
    await this.persistRefreshToken(user.id, newTokens.refreshToken);

    return newTokens;
  }

  /**
   * Güvenli Oturum Kapatma (Logout)
   */
  async logout(refreshTokenStr: string): Promise<void> {
    try {
      const tokenHash = this.hashToken(refreshTokenStr);
      await this.refreshTokenRepository.update(
        { tokenHash, isRevoked: false },
        { isRevoked: true },
      );
    } catch (err) {
      this.logger.warn(`Logout sırasında oturum iptal uyarısı: ${(err as Error).message}`);
    }
  }

  /**
   * Profil Bilgisi
   */
  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    return this.toUserResponse(user);
  }

  // ==================== Yardımcı Güvenlik Fonksiyonları ====================

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(user: UserEntity): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'sehir_nabiz_default_access_jwt_secret_key_32chars_min!',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'sehir_nabiz_default_refresh_jwt_secret_key_32chars_min!',
    );

    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    // Benzersiz jti ile her refresh token'ın tekil olmasını sağla
    const jti = randomBytes(16).toString('hex');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(
        { ...payload, jti },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn as any,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 dakika (saniye cinsinden)
    };
  }

  private async persistRefreshToken(userId: string, refreshTokenStr: string): Promise<void> {
    const tokenHash = this.hashToken(refreshTokenStr);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün geçerli

    const tokenEntity = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(tokenEntity);
  }

  toUserResponse(user: UserEntity): UserResponse {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      accountStatus: user.accountStatus,
      reputationScore: user.reputationScore,
      createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }
}
