import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './reports.controller';
import { PredictionModule } from '../prediction/prediction.module';
import { MetricsModule } from '../metrics/metrics.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AuthModule } from '../../../auth/auth.module';
import { CacheModule } from '../../infrastructure/cache/cache.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [PredictionModule, MetricsModule, AlertsModule, AuthModule, CacheModule, DashboardModule],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportsModule {}
