import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { DailyEmployeeMetricsService } from './daily-employee-metrics.service';
import { CreateDailyEmployeeMetricDto } from './dto/create-daily-employee-metric.dto';
import { UpdateDailyEmployeeMetricDto } from './dto/update-daily-employee-metric.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { MetricEnum } from '../../enums/metric.enum';
import { AggEnum } from '../../enums/agg.enum';

@Controller('daily-employee-metrics')
@UseGuards(JwtRedisGuard, RolesGuard)
export class DailyEmployeeMetricsController {
  constructor(private readonly service: DailyEmployeeMetricsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateDailyEmployeeMetricDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.service.findAll();
  }

  @Get(':employeeId/:snapshotId/:metricName/:aggType')
  @Roles('Admin', 'Manager')
  findOne(
    @Param('employeeId') employeeId: string,
    @Param('snapshotId') snapshotId: string,
    @Param('metricName') metricName: string,
    @Param('aggType') aggType: string,
  ) {
    // Convertimos los strings a enums
    return this.service.findOne(
      +employeeId,
      +snapshotId,
      metricName as MetricEnum,
      aggType as AggEnum,
    );
  }

  @Put(':employeeId/:snapshotId/:metricName/:aggType')
  @Roles('Admin')
  update(
    @Param('employeeId') employeeId: string,
    @Param('snapshotId') snapshotId: string,
    @Param('metricName') metricName: string,
    @Param('aggType') aggType: string,
    @Body() dto: UpdateDailyEmployeeMetricDto,
  ) {
    return this.service.update(
      +employeeId,
      +snapshotId,
      metricName as MetricEnum,
      aggType as AggEnum,
      dto,
    );
  }

  @Delete(':employeeId/:snapshotId/:metricName/:aggType')
  @Roles('Admin')
  remove(
    @Param('employeeId') employeeId: string,
    @Param('snapshotId') snapshotId: string,
    @Param('metricName') metricName: string,
    @Param('aggType') aggType: string,
  ) {
    return this.service.remove(
      +employeeId,
      +snapshotId,
      metricName as MetricEnum,
      aggType as AggEnum,
    );
  }
}
