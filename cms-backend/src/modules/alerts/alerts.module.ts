import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from '../../entities/alert.entity';
import { DailyEmployeeMetrics } from '../../entities/daily_empl_metrics.entity';
import { Intervention } from '../../entities/intervention.entity';
import { Employee } from '../../entities/employee.entity';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, DailyEmployeeMetrics, Intervention, Employee]),
    AuthModule,       // acceso a JwtRedisGuard y AuthService
  ],
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}
