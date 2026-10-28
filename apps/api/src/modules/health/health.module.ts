import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { DiagnosticsGuard } from './guards/diagnostics.guard';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  controllers: [HealthController],
  providers: [DiagnosticsGuard],
  exports: [DiagnosticsGuard],
})
export class HealthModule {}
