import { Injectable } from '@nestjs/common';
import { Builder } from 'xml2js';
import { PredictionService } from '../prediction/prediction.service';
import { MetricsService } from '../metrics/metrics.service';
import { AlertsService } from '../alerts/alerts.service';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly predictionService: PredictionService,
    private readonly metricsService: MetricsService,
    private readonly alertsService: AlertsService,
    private readonly cacheService: CacheService, // ✅ inyectamos cache
  ) {}

  async getUserReport(userId: string, format: 'json' | 'xml' = 'json') {
    const cacheKey = `report:${userId}:${format}`;

    // 1️⃣ Verificar si ya existe en cache
    const cached = await this.cacheService.get<string | object>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2️⃣ Obtener métricas
    const metrics = await this.metricsService.getEmployeeMetrics(userId);

    // 3️⃣ Obtener predicción
    const prediction = await this.predictionService.predictBurnout(userId, metrics);

    // 4️⃣ Obtener alertas
    const alerts = await this.alertsService.getUserAlerts(userId);

    // 5️⃣ Construir reporte
    const report = {
      reportDate: new Date().toISOString(),
      userId,
      metrics,
      prediction,
      alerts,
    };

    let output: string | object = report;

    // 6️⃣ Convertir a XML si es necesario
    if (format === 'xml') {
      const builder = new Builder({ headless: true, rootName: 'WellbeingReport' });
      output = builder.buildObject(report);
    }

    // 7️⃣ Guardar en cache con TTL (ej: 10 min)
    await this.cacheService.set(cacheKey, output, 600);

    return output;
  }
}
