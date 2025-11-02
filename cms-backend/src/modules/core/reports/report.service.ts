import { Injectable } from '@nestjs/common';
import { Builder } from 'xml2js';
import { PredictionService } from '../prediction/prediction.service';
import { MetricsService } from '../metrics/metrics.service';
import { AlertsService } from '../alerts/alerts.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly predictionService: PredictionService,
    private readonly metricsService: MetricsService,
    private readonly alertsService: AlertsService,
    private readonly dashboardService: DashboardService,
    private readonly cacheService: CacheService,
  ) {}

  async getUserReport(userId: string, format: 'json' | 'xml' = 'json') {
    const cacheKey = `report:${userId}:${format}`;

    // 1️⃣ Revisar cache
    const cached = await this.cacheService.get<string | object>(cacheKey);
    if (cached) return cached;

    // 2️⃣ Obtener métricas
    const metrics = await this.metricsService.getEmployeeMetrics(userId);

    // 3️⃣ Obtener predicción + summary + alertas + intervenciones
    const analysis = await this.predictionService.predictBurnout(userId);

    // 4️⃣ Combinar alertas locales + inteligentes si quieres
    const combinedAlerts = await this.alertsService.getCombinedAlerts(
      userId,
      analysis.prediction.burnout_probability,
      metrics,
    );

    // 5️⃣ Obtener dashboard local (opcional, si quieres enriquecer)
    const dashboard = await this.dashboardService.getUserDashboard(userId);

    // 6️⃣ Construir reporte final
    const report = {
      reportDate: new Date().toISOString(),
      userId,
      metrics: metrics,
      prediction: analysis.prediction,
      alerts: combinedAlerts.length > 0 ? combinedAlerts : analysis.alert ? [analysis.alert] : [],
      dashboard: analysis.summary || dashboard,
      interventions: analysis.interventions || [],
    };

    // 7️⃣ Convertir a XML si el cliente lo pide
    let output: string | object = report;
    if (format === 'xml') {
      const builder = new Builder({ headless: true, rootName: 'WellbeingReport' });
      output = builder.buildObject(report);
    }

    // 8️⃣ Guardar en cache
    await this.cacheService.set(cacheKey, output, 600);

    return output;
  }
}
