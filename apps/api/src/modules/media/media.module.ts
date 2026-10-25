import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventMediaEntity } from '../../database/entities/event-media.entity';
import { EventEntity } from '../../database/entities/event.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventMediaEntity, EventEntity]),
    StorageModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
