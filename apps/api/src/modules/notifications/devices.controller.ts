import {
  Controller,
  Post,
  Delete,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '@sehir-nabiz/shared';
import { NotificationsService } from './notifications.service';
import { RegisterPushTokenApiDto } from './dto';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('push-token')
  @HttpCode(HttpStatus.OK)
  async registerPushToken(
    @Req() req: Request,
    @Body() dto: RegisterPushTokenApiDto,
  ): Promise<{ success: boolean; id: string }> {
    const user = req.user as JwtPayload;
    const token = await this.notificationsService.registerPushToken(user.sub, dto);
    return { success: true, id: token.id };
  }

  @Delete('push-token')
  @HttpCode(HttpStatus.OK)
  async deactivatePushToken(
    @Req() req: Request,
    @Body('token') token: string,
  ): Promise<{ success: boolean }> {
    const user = req.user as JwtPayload;
    return this.notificationsService.deactivatePushToken(user.sub, token);
  }
}
