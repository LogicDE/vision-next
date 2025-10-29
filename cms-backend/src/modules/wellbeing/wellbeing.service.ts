import { Injectable } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';
import { AlertsService } from '../alerts/alerts.service';
import { InterventionsService } from '../interventions/interventions.service';
import { WELLBEING_RULES } from './rules/intervention-rules';

@Injectable()
export class WellbeingService {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly alertsService: AlertsService,
    private readonly interventionsService: InterventionsService,
  ) {}

  // Evalúa métricas en tiempo real y genera alertas/intervenciones
  async evaluateRealtime() {
    const metrics = await this.metricsService.getRealtime();

    for (const m of metrics) {
      for (const rule of WELLBEING_RULES) {
        if (rule.condition(m)) {
          // Crear alerta
          await this.alertsService.trigger(
            m.id_metric,
            rule.alertType,
            `Se detectó la condición: ${rule.alertType}`
          );

          // Crear intervención usando assignToEmployee
          await this.interventionsService.assignToEmployee(
            m.employee_id,
            rule.interventionTitle,
            'Automática',
            `Generada automáticamente para ${rule.alertType}`
          );
        }
      }
    }

    return {
      message: 'Evaluación de métricas completada',
      metricsEvaluated: metrics.length,
    };
  }
}
