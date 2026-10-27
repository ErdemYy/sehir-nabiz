import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { EventEntity } from '../../database/entities/event.entity';
import { EventFeedbackEntity } from '../../database/entities/event-feedback.entity';
import { EventModerationLogEntity } from '../../database/entities/event-moderation-log.entity';
import { AccountDeletionRequestEntity } from '../../database/entities/account-deletion-request.entity';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';
import { DevicePushTokenEntity } from '../../database/entities/device-push-token.entity';
import { UserNotificationEntity } from '../../database/entities/user-notification.entity';
import { UserNotificationPreferenceEntity } from '../../database/entities/user-notification-preference.entity';
import { EventMediaEntity } from '../../database/entities/event-media.entity';
import { UsersService } from './users.service';
import { AccountDeletionService } from './account-deletion.service';
import { UsersController } from './users.controller';
import { AccountDeletionWebController } from './account-deletion-web.controller';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EventEntity,
      EventFeedbackEntity,
      EventModerationLogEntity,
      AccountDeletionRequestEntity,
      RefreshTokenEntity,
      DevicePushTokenEntity,
      UserNotificationEntity,
      UserNotificationPreferenceEntity,
      EventMediaEntity,
    ]),
    AuthModule,
    StorageModule,
    RealtimeModule,
  ],
  controllers: [UsersController, AccountDeletionWebController],
  providers: [UsersService, AccountDeletionService],
  exports: [UsersService, AccountDeletionService],
})
export class UsersModule {}
