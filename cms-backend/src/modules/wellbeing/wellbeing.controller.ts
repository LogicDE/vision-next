import { Controller, Get, UseGuards } from '@nestjs/common';
import { WellbeingService } from './wellbeing.service';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('wellbeing')
@UseGuards(JwtRedisGuard, RolesGuard)
export class WellbeingController {
  constructor(private readonly wellbeingService: WellbeingService) {}

  @Get('evaluate')
  @Roles('admin', 'manager')
  evaluate() {
    return this.wellbeingService.evaluateRealtime();
  }
}
