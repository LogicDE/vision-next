import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { DailyEmployeeMetric } from '../../entities/daily-employee-metric.entity';
import { DailyEmployeeMetricsService } from './daily-employee-metrics.service';
import { DailyEmployeeMetricsController } from './daily-employee-metrics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyEmployeeMetric]),
    AuthModule,
  ],
  controllers: [DailyEmployeeMetricsController],
  providers: [DailyEmployeeMetricsService],
  exports: [DailyEmployeeMetricsService],
})
export class DailyEmployeeMetricsModule {}
