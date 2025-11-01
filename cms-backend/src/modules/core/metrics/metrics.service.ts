import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MetricsService {
  constructor(private readonly dataSource: DataSource) {}

  async getRealtime() {
    return this.dataSource.query('SELECT * FROM sp_kpi_realtime();');
  }

  async getWeekly() {
    return this.dataSource.query('SELECT * FROM sp_kpi_weekly();');
  }

  async getRadar() {
    return this.dataSource.query('SELECT * FROM sp_kpi_radar();');
  }

  async getEmployeeMetrics(userId: string) {
    return this.dataSource.query(
      `SELECT * FROM daily_employee_metrics WHERE id_employee = $1 ORDER BY timestamp DESC LIMIT 100`,
      [userId],
    );
  }
}
