import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  RegisterInputSchema,
  LoginInputSchema,
  RefreshTokenInputSchema,
  type AuthResponse,
  type AuthTokens,
  type UserResponse,
  type JwtPayload,
} from '@sehir-nabiz/shared';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthRateLimitGuard } from './guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(AuthRateLimitGuard)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterInputSchema)) registerDto: RegisterDto,
  ): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(AuthRateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginInputSchema)) loginDto: LoginDto,
  ): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  /**
   * Silme Bekleme Sürecindeki Kullanıcı İçin Sınırlı Yetkili Oturum Açma
   * (POST /auth/reauthenticate-deletion)
   */
  @Post('reauthenticate-deletion')
  @UseGuards(AuthRateLimitGuard)
  @HttpCode(HttpStatus.OK)
  async reauthenticateDeletion(
    @Body(new ZodValidationPipe(LoginInputSchema)) loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: UserResponse; expiresIn: string }> {
    return this.authService.reauthenticateDeletion(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(RefreshTokenInputSchema)) refreshDto: RefreshTokenDto,
  ): Promise<AuthTokens> {
    return this.authService.refreshTokens(refreshDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body(new ZodValidationPipe(RefreshTokenInputSchema)) refreshDto: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(refreshDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request): Promise<UserResponse> {
    const userPayload = req.user as JwtPayload;
    return this.authService.getProfile(userPayload.sub);
  }
}
