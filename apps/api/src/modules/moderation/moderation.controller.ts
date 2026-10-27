import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UserRole, ModerationEventsQuerySchema } from '@sehir-nabiz/shared';
import type { PaginatedModerationEventsResponse } from '@sehir-nabiz/shared';
import { ModerationEventsQueryDto } from '../events/dto';

@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MODERATOR, UserRole.ADMIN)
export class ModerationController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Moderatör Olay Listesi (GET /moderation/events)
   * Yalnızca MODERATOR ve ADMIN rollerine açıktır.
   */
  @Get('events')
  @HttpCode(HttpStatus.OK)
  async getModerationEvents(
    @Query(new ZodValidationPipe(ModerationEventsQuerySchema)) query: ModerationEventsQueryDto,
  ): Promise<PaginatedModerationEventsResponse> {
    return this.eventsService.getModerationEvents(query);
  }

  /**
   * Moderatör Olay Detayı (GET /moderation/events/:id)
   * Geri bildirimler ve denetim logları dahil tam detay
   */
  @Get('events/:id')
  @HttpCode(HttpStatus.OK)
  async getModerationEventById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<any> {
    return this.eventsService.getModerationEventById(id);
  }
}
