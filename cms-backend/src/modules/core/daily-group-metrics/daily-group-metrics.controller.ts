import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { DailyGroupMetricsService } from './daily-group-metrics.service';
import { CreateDailyGroupMetricDto } from './dto/create-daily-group-metric.dto';
import { UpdateDailyGroupMetricDto } from './dto/update-daily-group-metric.dto';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { MetricEnum } from '../../../enums/metric.enum';
import { AggEnum } from '../../../enums/agg.enum';

@Controller('daily-group-metrics')
@UseGuards(JwtRedisGuard, RolesGuard)
export class DailyGroupMetricsController {
  constructor(private readonly service: DailyGroupMetricsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateDailyGroupMetricDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.service.findAll();
  }

  @Get(':snapshotId/:metricName/:aggType')
  @Roles('Admin', 'Manager')
  findOne(
    @Param('snapshotId') snapshotId: string,
    @Param('metricName') metricName: string,
    @Param('aggType') aggType: string,
  ) {
    return this.service.findOne(
      +snapshotId,
      metricName as MetricEnum,
      aggType as AggEnum,
    );
  }

  @Put(':snapshotId/:metricName/:aggType')
  @Roles('Admin')
  update(
    @Param('snapshotId') snapshotId: string,
    @Param('metricName') metricName: string,
    @Param('aggType') aggType: string,
    @Body() dto: UpdateDailyGroupMetricDto,
  ) {
    return this.service.update(
      +snapshotId,
      metricName as MetricEnum,
      aggType as AggEnum,
      dto,
    );
  }

  @Delete(':snapshotId/:metricName/:aggType')
  @Roles('Admin')
  remove(
    @Param('snapshotId') snapshotId: string,
    @Param('metricName') metricName: string,
    @Param('aggType') aggType: string,
  ) {
    return this.service.remove(
      +snapshotId,
      metricName as MetricEnum,
      aggType as AggEnum,
    );
  }
}
