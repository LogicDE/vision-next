import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertStatus } from '../../entities/alert.entity';
import { DailyEmployeeMetrics } from '../../entities/daily_empl_metrics.entity';
import { Employee } from '../../entities/employee.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert) private readonly alertRepo: Repository<Alert>,
    @InjectRepository(DailyEmployeeMetrics) private readonly metricRepo: Repository<DailyEmployeeMetrics>,
    @InjectRepository(Employee) private readonly empRepo: Repository<Employee>,
  ) {}

  async trigger(metricId: number, type: string, message?: string) {
    const metric = await this.metricRepo.findOne({ where: { id_metric: metricId }, relations: ['employee'] });
    if (!metric) throw new NotFoundException('Métrica no encontrada');

    const alert = this.alertRepo.create({
      type,
      message,
      employee: metric.employee,
      metric,
      status: AlertStatus.PENDING,
    });

    return this.alertRepo.save(alert);
  }

  async findAll() {
    return this.alertRepo.find({
      relations: ['employee', 'metric', 'interventions'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsAttended(alertId: number, note?: string) {
    const alert = await this.alertRepo.findOne({ where: { id_alert: alertId } });
    if (!alert) throw new NotFoundException('Alerta no encontrada');

    alert.status = AlertStatus.RESOLVED;
    if (note) alert.note = note;
    return this.alertRepo.save(alert);
  }
}
