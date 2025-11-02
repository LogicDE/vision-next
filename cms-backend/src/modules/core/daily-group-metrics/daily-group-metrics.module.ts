import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { DailyGroupMetric } from '../../../entities/daily-group-metric.entity';
import { DailyGroupMetricsService } from './daily-group-metrics.service';
import { DailyGroupMetricsController } from './daily-group-metrics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyGroupMetric]),
    AuthModule,
  ],
  controllers: [DailyGroupMetricsController],
  providers: [DailyGroupMetricsService],
  exports: [DailyGroupMetricsService],
})
export class DailyGroupMetricsModule {}
