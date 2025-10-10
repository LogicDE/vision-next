import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './auditlogs.service';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtRedisGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.auditLogService.findAll();
  }
}
