import { Controller, Post, Param, Body, Get, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('alerts')
@UseGuards(JwtRedisGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('trigger/:metricId')
  @Roles('admin', 'manager')
  triggerAlert(
    @Param('metricId') metricId: number,
    @Body() body: { type: string; message?: string }
  ) {
    return this.alertsService.trigger(metricId, body.type, body.message);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll() {
    return this.alertsService.findAll();
  }

  @Post('attend/:id')
  @Roles('admin', 'manager')
  markAttended(@Param('id') id: number, @Body() body: { note?: string }) {
    return this.alertsService.markAsAttended(id, body.note);
  }
}
