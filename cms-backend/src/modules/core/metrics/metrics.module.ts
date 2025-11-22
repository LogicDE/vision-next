import { Module, forwardRef  } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { DashboardModule } from '../dashboard/dashboard.module';
import { AlertsModule } from '../alerts/alerts.module';
import { NotificationModule } from '../../infrastructure/notification/notification.module';
import { PredictionModule } from '../prediction/prediction.module';
import { AuthModule } from '../../../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([]), 
    DashboardModule,
    AlertsModule,
    NotificationModule,
    forwardRef (() => PredictionModule),
    AuthModule,
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService], // Para que otros módulos puedan usar MetricsService
})
export class MetricsModule {}
