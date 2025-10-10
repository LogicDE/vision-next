import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../entities/auditlog.entity';
import { AuditLogService } from './auditlogs.service';
import { AuditLogController } from './auditlogs.controller';
import { AuthModule } from '../../auth/auth.module'; // <-- importar AuthModule
import { Action, Service } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, Action, Service]),
    AuthModule, // <-- necesario para JwtRedisGuard
  ],  
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
