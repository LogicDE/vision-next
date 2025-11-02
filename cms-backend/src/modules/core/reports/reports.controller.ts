import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtRedisGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':userId')
  @Roles('Admin', 'Manager', 'Employee', 'User')
  async getReport(
    @Param('userId') userId: string,
    @Query('format') format: 'json' | 'xml' = 'json',
    @Req() req: any,
  ) {
    const loggedUser = req.user;
    const allowedRoles = ['Admin', 'Manager'];

    // Si no es Admin/Manager y quiere ver otro usuario → bloquear
    if (
      !allowedRoles.includes(loggedUser.role) &&
      loggedUser.id !== Number(userId)
    ) {
      throw new ForbiddenException('No tienes permisos para ver este reporte.');
    }

    return this.reportService.getUserReport(userId, format);
  }
}
