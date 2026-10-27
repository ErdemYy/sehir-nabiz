import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../../database/entities/event.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { EventModerationLogEntity } from '../../database/entities/event-moderation-log.entity';
import { EventFeedbackEntity } from '../../database/entities/event-feedback.entity';
import { UserReputationLogEntity } from '../../database/entities/user-reputation-log.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { CategoriesModule } from '../categories/categories.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      UserEntity,
      CategoryEntity,
      EventModerationLogEntity,
      EventFeedbackEntity,
      UserReputationLogEntity,
    ]),
    CategoriesModule,
    NotificationsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
