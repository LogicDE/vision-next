import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { AlertsService } from '../alerts/alerts.service';
import { NotificationService } from '../../infrastructure/notification/notification.service';
import { PredictionService } from '../prediction/prediction.service';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('metrics')
@UseGuards(JwtRedisGuard, RolesGuard)
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly dashboardService: DashboardService,
    private readonly alertsService: AlertsService,
    private readonly notificationService: NotificationService,
    private readonly predictionService: PredictionService,
  ) {}

  // 🔹 KPIs en tiempo real
  @Get('realtime')
  @Roles('Admin', 'Manager', 'Employee')
  async getRealtime() {
    return this.metricsService.getRealtime();
  }

  // 🔹 KPIs en tiempo real por usuario con alertas y notificaciones
  @Get('realtime/:userId')
  @Roles('Admin', 'Manager', 'Employee')
  async getRealtimeMetrics(@Param('userId') userId: string) {
    const realtimeKPIs = await this.metricsService.getRealtime();

    // Generar alertas dinámicas en Redis
    for (const metric of realtimeKPIs) {
      await this.alertsService.generateAlert(userId, 'stress', metric.stress);
    }

    // Enviar notificaciones inmediatas
    const notifications = await this.notificationService.sendNotifications(userId);

    // Obtener dashboard agregado (cache o cálculo)
    const dashboard = await this.dashboardService.getUserDashboard(userId);

    return {
      realtimeKPIs,
      dashboard,
      notifications,
    };
  }

  // 🔹 KPIs semanales
  @Get('weekly')
  @Roles('Admin', 'Manager')
  async getWeekly() {
    return this.metricsService.getWeekly();
  }

  // 🔹 Radar de bienestar general
  @Get('radar')
  @Roles('Admin', 'Manager')
  async getRadar() {
    return this.metricsService.getRadar();
  }

  // 🔹 Predicción de burnout
  @Get('predict/:userId')
  @Roles('Admin', 'Manager', 'Employee')
  async predictBurnout(@Param('userId') userId: string) {
    const metrics = await this.metricsService.getEmployeeMetrics(userId);
    const score = await this.predictionService.predictBurnout(userId, metrics);
    return { userId, burnoutRisk: score };
  }
}
