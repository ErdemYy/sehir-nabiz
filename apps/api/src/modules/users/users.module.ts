import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { EventEntity } from '../../database/entities/event.entity';
import { EventFeedbackEntity } from '../../database/entities/event-feedback.entity';
import { EventModerationLogEntity } from '../../database/entities/event-moderation-log.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EventEntity,
      EventFeedbackEntity,
      EventModerationLogEntity,
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
