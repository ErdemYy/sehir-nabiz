import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEventEntity } from '../../database/entities/outbox-event.entity';
import { UserNotificationEntity } from '../../database/entities/user-notification.entity';
import { OutboxService } from './outbox.service';
import { OutboxProcessorService } from './outbox-processor.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutboxEventEntity, UserNotificationEntity]),
    forwardRef(() => RealtimeModule),
    forwardRef(() => NotificationsModule),
    RedisModule,
  ],
  providers: [OutboxService, OutboxProcessorService],
  exports: [OutboxService, OutboxProcessorService],
})
export class OutboxModule {}
