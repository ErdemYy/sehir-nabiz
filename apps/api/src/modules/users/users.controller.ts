import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { UsersService } from './users.service';
import { AccountDeletionService } from './account-deletion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AllowPendingDeletion } from '../../common/decorators/allow-pending-deletion.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  MyEventsQuerySchema,
  DeleteAccountInputSchema,
  WebDeleteAccountInputSchema,
  CancelDeletionInputSchema,
  DeletionClientSource,
  type JwtPayload,
  type UserStatsDto,
  type MyEventResponseDto,
  type DeleteAccountInput,
  type WebDeleteAccountInput,
  type CancelDeletionInput,
  type AccountDeletionResponseDto,
  type AccountDeletionStatusDto,
} from '@sehir-nabiz/shared';
import { MyEventsQueryDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountDeletionService: AccountDeletionService,
  ) {}

  /**
   * Kullanıcının Katkı İstatistikleri (GET /users/me/stats)
   */
  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyStats(@Req() req: Request): Promise<UserStatsDto> {
    const user = req.user as JwtPayload;
    return this.usersService.getMyStats(user.sub);
  }

  /**
   * Kullanıcının Kendi Bildirdiği Olaylar (GET /users/me/events)
   */
  @Get('me/events')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyEvents(
    @Req() req: Request,
    @Query(new ZodValidationPipe(MyEventsQuerySchema)) query: MyEventsQueryDto,
  ): Promise<{ items: MyEventResponseDto[]; nextCursor: string | null; hasMore: boolean }> {
    const user = req.user as JwtPayload;
    return this.usersService.getMyEvents(user.sub, query);
  }

  /**
   * Hesap ve Kişisel Verileri Silme Talebi (DELETE /users/me)
   * Apple App Store Guideline 5.1.1(v) ve Google Play uyumlu
   */
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Req() req: Request,
    @Body(new ZodValidationPipe(DeleteAccountInputSchema)) dto: DeleteAccountInput,
  ): Promise<AccountDeletionResponseDto> {
    const user = req.user as JwtPayload;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.accountDeletionService.requestDeletion(user.sub, dto, {
      ip,
      userAgent,
      source: DeletionClientSource.MOBILE_APP,
    });
  }

  /**
   * Hesap Silme Durumu Sorgulama (GET /users/me/deletion-status)
   */
  @Get('me/deletion-status')
  @UseGuards(JwtAuthGuard)
  @AllowPendingDeletion()
  @HttpCode(HttpStatus.OK)
  async getDeletionStatus(@Req() req: Request): Promise<AccountDeletionStatusDto> {
    const user = req.user as JwtPayload;
    return this.accountDeletionService.getDeletionStatus(user.sub);
  }

  /**
   * Oturumlu Kullanıcı İçin Silme Talebini İptal Etme (POST /users/me/cancel-deletion)
   */
  @Post('me/cancel-deletion')
  @UseGuards(JwtAuthGuard)
  @AllowPendingDeletion()
  @HttpCode(HttpStatus.OK)
  async cancelDeletionAuthenticated(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CancelDeletionInputSchema)) dto: CancelDeletionInput,
  ): Promise<{ success: boolean; message: string }> {
    const user = req.user as JwtPayload;
    return this.accountDeletionService.cancelDeletion({ userId: user.sub }, dto);
  }

  /**
   * Oturumu Kapanmış Kullanıcı İçin E-posta ve Şifre ile İptal (POST /users/cancel-deletion)
   */
  @Post('cancel-deletion')
  @HttpCode(HttpStatus.OK)
  async cancelDeletionPublic(
    @Body() body: { email: string; password: string },
  ): Promise<{ success: boolean; message: string }> {
    if (!body?.email || !body?.password) {
      throw new BadRequestException('E-posta ve şifre zorunludur.');
    }
    return this.accountDeletionService.cancelDeletion(
      { email: body.email },
      { password: body.password },
    );
  }

  /**
   * Web Üzerinden Hesap Silme Talebi (POST /users/web-deletion-request)
   */
  @Post('web-deletion-request')
  @HttpCode(HttpStatus.OK)
  async requestWebDeletion(
    @Req() req: Request,
    @Body(new ZodValidationPipe(WebDeleteAccountInputSchema)) dto: WebDeleteAccountInput,
  ): Promise<AccountDeletionResponseDto> {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.accountDeletionService.requestWebDeletion(dto, { ip, userAgent });
  }

  /**
   * Web Hesap Silme Sayfası HTML (GET /users/account-deletion)
   * Doğrudan tarayıcıda Urban Floating UI temalı hesap silme formu sunar
   */
  @Get('account-deletion')
  getWebDeletionPage(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(this.accountDeletionService.renderAccountDeletionHtml());
  }
}
