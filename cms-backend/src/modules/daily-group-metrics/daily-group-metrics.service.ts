import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyGroupMetric } from '../../entities/daily-group-metric.entity';
import { CreateDailyGroupMetricDto } from './dto/create-daily-group-metric.dto';
import { UpdateDailyGroupMetricDto } from './dto/update-daily-group-metric.dto';
import { MetricEnum } from '../../enums/metric.enum';
import { AggEnum } from '../../enums/agg.enum';

@Injectable()
export class DailyGroupMetricsService {
  constructor(
    @InjectRepository(DailyGroupMetric)
    private readonly dgmRepo: Repository<DailyGroupMetric>,
  ) {}

  create(dto: CreateDailyGroupMetricDto) {
    const metric = this.dgmRepo.create(dto);
    return this.dgmRepo.save(metric);
  }

  findAll() {
    return this.dgmRepo.find({ relations: ['snapshot'] });
  }

  async findOne(snapshotId: number, metricName: MetricEnum, aggType: AggEnum) {
    const metric = await this.dgmRepo.findOne({
      where: { snapshotId, metricName, aggType },
      relations: ['snapshot'],
    });

    if (!metric) throw new NotFoundException('DailyGroupMetric no encontrada');

    return metric;
  }

  async update(snapshotId: number, metricName: MetricEnum, aggType: AggEnum, dto: UpdateDailyGroupMetricDto) {
    const metric = await this.findOne(snapshotId, metricName, aggType);
    Object.assign(metric, dto);
    return this.dgmRepo.save(metric);
  }

  async remove(snapshotId: number, metricName: MetricEnum, aggType: AggEnum) {
    const metric = await this.findOne(snapshotId, metricName, aggType);
    await this.dgmRepo.remove(metric);
    return { message: 'DailyGroupMetric eliminada' };
  }
}
