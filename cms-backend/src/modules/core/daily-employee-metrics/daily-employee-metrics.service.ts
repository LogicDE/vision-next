import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyEmployeeMetric } from '../../../entities/daily-employee-metric.entity';
import { CreateDailyEmployeeMetricDto } from './dto/create-daily-employee-metric.dto';
import { UpdateDailyEmployeeMetricDto } from './dto/update-daily-employee-metric.dto';
import { MetricEnum } from '../../../enums/metric.enum';
import { AggEnum } from '../../../enums/agg.enum';

@Injectable()
export class DailyEmployeeMetricsService {
  constructor(
    @InjectRepository(DailyEmployeeMetric)
    private readonly demRepo: Repository<DailyEmployeeMetric>,
  ) {}

  create(dto: CreateDailyEmployeeMetricDto) {
    const metric = this.demRepo.create(dto);
    return this.demRepo.save(metric);
  }

  findAll() {
    return this.demRepo.find({ relations: ['employee', 'snapshot'] });
  }

  async findOne(
    employeeId: number,
    snapshotId: number,
    metricName: MetricEnum,
    aggType: AggEnum,
  ) {
    const metric = await this.demRepo.findOne({
      where: { employeeId, snapshotId, metricName, aggType },
      relations: ['employee', 'snapshot'],
    });
    if (!metric) throw new NotFoundException('DailyEmployeeMetric no encontrada');
    return metric;
  }

  async update(
    employeeId: number,
    snapshotId: number,
    metricName: MetricEnum,
    aggType: AggEnum,
    dto: UpdateDailyEmployeeMetricDto,
  ) {
    const metric = await this.findOne(employeeId, snapshotId, metricName, aggType);
    Object.assign(metric, dto);
    return this.demRepo.save(metric);
  }

  async remove(
    employeeId: number,
    snapshotId: number,
    metricName: MetricEnum,
    aggType: AggEnum,
  ) {
    const metric = await this.findOne(employeeId, snapshotId, metricName, aggType);
    await this.demRepo.remove(metric);
    return { message: 'DailyEmployeeMetric eliminada' };
  }
}
