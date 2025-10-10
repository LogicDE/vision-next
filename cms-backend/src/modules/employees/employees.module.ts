import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../../entities/employee.entity';
import { Rol } from '../../entities/rol.entity';
import { Empresa } from '../../entities/empresa.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { AuthModule } from '../../auth/auth.module';
import { AuditLogModule } from '../auditlogs/auditlogs.module'; // <-- importar módulo de auditoría

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Rol, Empresa]),
    AuthModule, // acceso a JwtRedisGuard y AuthService
    AuditLogModule, // <-- para inyectar AuditLogService
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
