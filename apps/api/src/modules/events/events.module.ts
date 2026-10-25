import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../../database/entities/event.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { EventModerationLogEntity } from '../../database/entities/event-moderation-log.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      UserEntity,
      CategoryEntity,
      EventModerationLogEntity,
    ]),
    CategoriesModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
