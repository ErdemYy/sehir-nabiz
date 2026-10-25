import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { CategoryEntity } from './entities/category.entity';
import { EventEntity } from './entities/event.entity';
import { EventModerationLogEntity } from './entities/event-moderation-log.entity';
import { EventMediaEntity } from './entities/event-media.entity';
import { InitialAuthAndPostGis1740000000000 } from './migrations/1740000000000-InitialAuthAndPostGis';
import { CreateCategoriesAndEvents1740000001000 } from './migrations/1740000001000-CreateCategoriesAndEvents';
import { CreateEventMedia1740000002000 } from './migrations/1740000002000-CreateEventMedia';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 5434),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres_secure_dev_password'),
        database: config.get<string>('DB_DATABASE', 'sehir_nabiz'),
        entities: [
          UserEntity,
          RefreshTokenEntity,
          CategoryEntity,
          EventEntity,
          EventModerationLogEntity,
          EventMediaEntity,
        ],
        migrations: [
          InitialAuthAndPostGis1740000000000,
          CreateCategoriesAndEvents1740000001000,
          CreateEventMedia1740000002000,
        ],
        synchronize: false,
        logging: config.get<boolean>('DB_LOGGING', false),
        retryAttempts: 2,
        retryDelay: 1500,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      RefreshTokenEntity,
      CategoryEntity,
      EventEntity,
      EventModerationLogEntity,
      EventMediaEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
