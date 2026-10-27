import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type {
  JwtPayload,
  PaginatedNotificationsResponse,
  UserNotificationDto,
  NotificationPreferencesDto,
} from '@sehir-nabiz/shared';
import { NotificationsService } from './notifications.service';
import {
  NotificationsQueryDto,
  UpdateNotificationPreferencesDto,
} from './dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Req() req: Request,
    @Query() query: NotificationsQueryDto,
  ): Promise<PaginatedNotificationsResponse> {
    const user = req.user as JwtPayload;
    return this.notificationsService.getUserNotifications(user.sub, query);
  }

  @Get('unread-count')
  async getUnreadCount(
    @Req() req: Request,
  ): Promise<{ unreadCount: number }> {
    const user = req.user as JwtPayload;
    const count = await this.notificationsService.getUnreadCount(user.sub);
    return { unreadCount: count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<UserNotificationDto> {
    const user = req.user as JwtPayload;
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(
    @Req() req: Request,
  ): Promise<{ affected: number }> {
    const user = req.user as JwtPayload;
    return this.notificationsService.markAllAsRead(user.sub);
  }

  @Get('preferences')
  async getPreferences(
    @Req() req: Request,
  ): Promise<NotificationPreferencesDto> {
    const user = req.user as JwtPayload;
    const prefs = await this.notificationsService.getPreferences(user.sub);
    return {
      followedEvents: prefs.followedEvents,
      confirmedEvents: prefs.confirmedEvents,
      reportedEvents: prefs.reportedEvents,
      nearbyEvents: prefs.nearbyEvents,
      systemNotifications: prefs.systemNotifications,
      pushEnabled: prefs.pushEnabled,
      inAppEnabled: prefs.inAppEnabled,
    };
  }

  @Patch('preferences')
  @HttpCode(HttpStatus.OK)
  async updatePreferences(
    @Req() req: Request,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    const user = req.user as JwtPayload;
    return this.notificationsService.updatePreferences(user.sub, dto);
  }
}
