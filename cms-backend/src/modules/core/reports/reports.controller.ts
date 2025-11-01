import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtRedisGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':userId')
  @Roles('Admin', 'Manager', 'Employee')
  async getReport(
    @Param('userId') userId: string,
    @Query('format') format: 'json' | 'xml' = 'json',
  ) {
    return this.reportService.getUserReport(userId, format);
  }
}
