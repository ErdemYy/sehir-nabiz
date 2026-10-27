import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotificationEntity } from '../../database/entities/user-notification.entity';
import { DevicePushTokenEntity } from '../../database/entities/device-push-token.entity';
import { UserNotificationPreferenceEntity } from '../../database/entities/user-notification-preference.entity';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { NotificationsController } from './notifications.controller';
import { DevicesController } from './devices.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserNotificationEntity,
      DevicePushTokenEntity,
      UserNotificationPreferenceEntity,
    ]),
    RealtimeModule,
  ],
  controllers: [NotificationsController, DevicesController],
  providers: [NotificationsService, PushNotificationService],
  exports: [NotificationsService, PushNotificationService],
})
export class NotificationsModule {}
