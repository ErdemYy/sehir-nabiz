import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { InitialAuthAndPostGis1740000000000 } from './migrations/1740000000000-InitialAuthAndPostGis';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres_secure_dev_password'),
        database: config.get<string>('DB_DATABASE', 'sehir_nabiz'),
        entities: [UserEntity, RefreshTokenEntity],
        migrations: [InitialAuthAndPostGis1740000000000],
        synchronize: false,
        logging: config.get<boolean>('DB_LOGGING', false),
        retryAttempts: 2,
        retryDelay: 1500,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
