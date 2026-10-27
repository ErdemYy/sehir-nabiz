import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [ModerationController],
})
export class ModerationModule {}
