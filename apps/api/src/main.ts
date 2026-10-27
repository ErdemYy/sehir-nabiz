import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RedisIoAdapter } from './modules/realtime/redis-io.adapter';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', '/api/v1');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Güvenlik Başlıkları (Helmet)
  app.use(helmet());

  // CORS Yapılandırması
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global Prefix (exclude account-deletion web page)
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''), {
    exclude: ['account-deletion'],
  });

  // Global Request Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Merkezi Hata Yönetimi
  app.useGlobalFilters(new AllExceptionsFilter());

  // WebSocket Redis IoAdapter Entegrasyonu
  const redisIoAdapter = new RedisIoAdapter(app, configService);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(port);
  logger.log(`🚀 ŞehirNabız API [${nodeEnv}] http://localhost:${port}/${apiPrefix.replace(/^\//, '')}`);
}

bootstrap().catch(err => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
