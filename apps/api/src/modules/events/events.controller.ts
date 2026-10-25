import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateEventDtoSchema,
  NearbyEventsQuerySchema,
  BBoxEventsQuerySchema,
  UpdateEventStatusSchema,
} from '@sehir-nabiz/shared';
import type {
  JwtPayload,
  EventResponseDto,
  PaginatedEventsResponse,
} from '@sehir-nabiz/shared';
import {
  CreateEventDto,
  NearbyEventsDto,
  BBoxEventsDto,
  UpdateEventStatusDto,
} from './dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Yeni Olay Bildirimi Oluşturma (POST /events)
   * Yalnızca oturum açmış kullanıcılar bildirim yapabilir.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateEventDtoSchema)) dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const user = req.user as JwtPayload;
    return this.eventsService.create(user.sub, dto);
  }

  /**
   * Yakındaki Olayları Getir (GET /events/nearby)
   * ST_DWithin ile coğrafi mesafe ve yarıçap filtrelemesi
   */
  @Get('nearby')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getNearbyEvents(
    @Req() req: Request,
    @Query(new ZodValidationPipe(NearbyEventsQuerySchema)) query: NearbyEventsDto,
  ): Promise<PaginatedEventsResponse> {
    const user = (req.user as JwtPayload) || undefined;
    return this.eventsService.findNearby(query, user);
  }

  /**
   * Harita Bounding Box Alanındaki Olayları Getir (GET /events/bbox)
   */
  @Get('bbox')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBBoxEvents(
    @Req() req: Request,
    @Query(new ZodValidationPipe(BBoxEventsQuerySchema)) query: BBoxEventsDto,
  ): Promise<PaginatedEventsResponse> {
    const user = (req.user as JwtPayload) || undefined;
    return this.eventsService.findBBox(query, user);
  }

  /**
   * Olay Detayı Getir (GET /events/:id)
   */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getEventById(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<EventResponseDto> {
    const user = (req.user as JwtPayload) || undefined;
    return this.eventsService.findById(id, user);
  }

  /**
   * Olay Durumunu Güncelle / Moderasyon (PATCH /events/:id/status)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateEventStatus(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(UpdateEventStatusSchema)) dto: UpdateEventStatusDto,
  ): Promise<EventResponseDto> {
    const user = req.user as JwtPayload;
    return this.eventsService.updateStatus(id, dto, user);
  }
}
