import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../../database/entities/event.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { RedisModule } from '../redis/redis.module';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity, CategoryEntity]),
    RedisModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
