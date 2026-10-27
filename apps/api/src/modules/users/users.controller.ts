import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MyEventsQuerySchema, type JwtPayload, type UserStatsDto, type MyEventResponseDto } from '@sehir-nabiz/shared';
import { MyEventsQueryDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
