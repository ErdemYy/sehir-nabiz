import { Controller, Get } from '@nestjs/common';
import type { HealthCheckResponse } from '@sehir-nabiz/shared';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'sehir-nabiz-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
