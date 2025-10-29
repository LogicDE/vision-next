import { Module } from '@nestjs/common';
import { WellbeingService } from './wellbeing.service';
import { WellbeingController } from './wellbeing.controller';
import { MetricsService } from '../metrics/metrics.service';
import { AlertsModule } from '../alerts/alerts.module';
import { InterventionsModule } from '../interventions/interventions.module';
import { EmployeesModule } from '../employees/employees.module';
import { AuthModule } from '../../auth/auth.module'; // seguridad

@Module({
  imports: [
    AlertsModule,
    InterventionsModule,
    EmployeesModule,
    AuthModule, 
  ],
  controllers: [WellbeingController],
  providers: [WellbeingService, MetricsService],
  exports: [WellbeingService],
})
export class WellbeingModule {}
