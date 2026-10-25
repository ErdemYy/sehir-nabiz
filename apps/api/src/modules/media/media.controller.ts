import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UploadUrlInputSchema } from '@sehir-nabiz/shared';
import type {
  JwtPayload,
  EventMediaDto,
  UploadUrlResponseDto,
} from '@sehir-nabiz/shared';
import { UploadUrlDto } from './dto/upload-url.dto';

@Controller('events/:id/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Presigned Upload URL Al (POST /events/:id/media/upload-url)
   */
  @Post('upload-url')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUploadUrl(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Body(new ZodValidationPipe(UploadUrlInputSchema)) dto: UploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    const user = req.user as JwtPayload;
    return this.mediaService.generateUploadUrl(eventId, dto, user);
  }

  /**
   * Yüklemeyi Doğrula ve Tamamla (POST /events/:id/media/:mediaId/complete)
   */
  @Post(':mediaId/complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async completeUpload(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Param('mediaId', new ParseUUIDPipe({ version: '4' })) mediaId: string,
  ): Promise<EventMediaDto> {
    const user = req.user as JwtPayload;
    return this.mediaService.completeUpload(eventId, mediaId, user);
  }

  /**
   * Olay Medyalarını Listele (GET /events/:id/media)
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMedia(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe({ version: '4' })) eventId: string,
  ): Promise<EventMediaDto[]> {
    const user = (req.user as JwtPayload) || undefined;
    return this.mediaService.getEventMedia(eventId, user);
  }

  /**
   * Medya Sil (DELETE /events/:id/media/:mediaId)
   */
  @Delete(':mediaId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteMedia(
    @Req() req: Request,
    @Param('id', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Param('mediaId', new ParseUUIDPipe({ version: '4' })) mediaId: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = req.user as JwtPayload;
    return this.mediaService.deleteMedia(eventId, mediaId, user);
  }
}
