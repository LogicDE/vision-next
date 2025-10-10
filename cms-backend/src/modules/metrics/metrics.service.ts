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
}
