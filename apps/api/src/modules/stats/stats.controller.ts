import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  StatsOverviewQuerySchema,
  HeatmapQuerySchema,
  type StatsOverviewDto,
  type HeatmapResponseDto,
} from '@sehir-nabiz/shared';
import { StatsOverviewQueryDto, HeatmapQueryDto } from './dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * Şehir Olay İstatistikleri Genel Özeti (GET /stats/overview)
   */
  @Get('overview')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getOverview(
    @Query(new ZodValidationPipe(StatsOverviewQuerySchema)) query: StatsOverviewQueryDto,
  ): Promise<StatsOverviewDto> {
    return this.statsService.getCityOverview(query.city, query.period);
  }

  /**
   * Harita Coğrafi Bildirim Yoğunluğu (GET /stats/heatmap)
   */
  @Get('heatmap')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getHeatmap(
    @Query(new ZodValidationPipe(HeatmapQuerySchema)) query: HeatmapQueryDto,
  ): Promise<HeatmapResponseDto> {
    return this.statsService.getHeatmap(query);
  }
}
