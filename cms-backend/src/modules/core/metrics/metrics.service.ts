import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MetricsService {
  constructor(private readonly dataSource: DataSource) {}

  // ==============================
  // 🔹 Funciones de Monitoreo real
  // ==============================
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
      `SELECT * FROM daily_employee_metrics WHERE id_employee = $1 ORDER BY id_snapshot DESC LIMIT 100`,
      [userId],
    );
  }

  // ==============================
  // 🔹 NUEVAS FUNCIONES ADMIN CLAVES
  // ==============================
//implementado ya
  async getGroupMetricsSummary(days = 7) {
    return this.dataSource.query(`SELECT * FROM fn_group_metrics_summary($1);`, [days]);
  }

  // implementado ya
  async getEnterpriseWellbeing() {
    return this.dataSource.query(`SELECT * FROM fn_enterprise_wellbeing_summary();`);
  }

  async getGroupTrendAlerts() {
    return this.dataSource.query(`SELECT * FROM fn_group_trend_alerts();`);
  }

  async getSurveyParticipation() {
    return this.dataSource.query(`SELECT * FROM fn_survey_participation_summary();`);
  }

  async getEmployeeActivity(days = 7) {
    return this.dataSource.query(`SELECT * FROM fn_employee_activity($1);`, [days]);
  }

  async getDailyOverview() {
    return this.dataSource.query(`SELECT * FROM fn_daily_system_overview();`);
  }
}
