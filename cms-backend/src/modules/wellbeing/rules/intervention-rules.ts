import { DailyEmployeeMetrics } from '../../../entities/daily_empl_metrics.entity';

export interface WellbeingRule {
  alertType: string; // Tipo de alerta
  condition: (metric: DailyEmployeeMetrics) => boolean;
  interventionTitle: string;
}

export const WELLBEING_RULES: WellbeingRule[] = [
  {
    alertType: 'High Stress',
    condition: (metric) => metric.metric_name === 'stress' && metric.value > 70,
    interventionTitle: 'Sesión de relajación guiada',
  },
  {
    alertType: 'Low Sleep',
    condition: (metric) => metric.metric_name === 'sleep_quality' && metric.value < 50,
    interventionTitle: 'Recomendación de descanso nocturno',
  },
  {
    alertType: 'Low Activity',
    condition: (metric) => metric.metric_name === 'activity_level' && metric.value < 30,
    interventionTitle: 'Incentivo de actividad física',
  },
];
