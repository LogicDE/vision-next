import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('metrics')
@UseGuards(JwtRedisGuard, RolesGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('realtime')
  @Roles('admin', 'manager', 'employee')
  getRealtime() {
    return this.metricsService.getRealtime();
  }

  @Get('weekly')
  @Roles('admin', 'manager')
  getWeekly() {
    return this.metricsService.getWeekly();
  }

  @Get('radar')
  @Roles('admin', 'manager')
  getRadar() {
    return this.metricsService.getRadar();
  }
}
