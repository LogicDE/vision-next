import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB } from '@influxdata/influxdb-client';
import { MetricsService } from '../metrics/metrics.service';
import { BurnoutAIClient } from './clients/burnout-ai.client';

// ✅ DEFINIR INTERFACES
interface BiometricAnalysis {
  avg_heart_rate: number;
  max_heart_rate: number;
  min_heart_rate: number;
  std_deviation: number;
  stress_peaks: number;
  data_points: number;
  avg_hrv: number | null;
  median_hrv: number | null;
  avg_eda: number | null;
  eda_peaks: number;
  time_range_hours: number;
}

interface BurnoutRisk {
  score: number;
  level: 'low' | 'medium' | 'high';
  confidence: number;
  contributing_factors: string[];
  local_score?: number;
  ai_score?: number;
}

interface Alert {
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  title?: string;
  message?: string;
  recommendations?: string[];
  ai_insights?: string;
  requires_action?: boolean;
}

interface Intervention {
  id: string;
  name: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  frequency?: string;
  duration?: string;
  description?: string;
  estimated_duration?: string;
  details?: any;
}

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  private influxDB: InfluxDB;
  private org: string;
  private bucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
    private readonly burnoutAIClient: BurnoutAIClient,
  ) {
    const url = this.configService.get<string>('INFLUX_URL') || 'http://localhost:8086';
    const token = this.configService.get<string>('INFLUX_TOKEN');
    this.org = this.configService.get<string>('INFLUX_ORG') || 'ecosalud';
    this.bucket = this.configService.get<string>('INFLUX_BUCKET') || 'biometria';

    if (!token) {
      this.logger.error('INFLUX_TOKEN no está configurado');
      throw new Error('INFLUX_TOKEN es requerido');
    }

    this.influxDB = new InfluxDB({ url, token });
    this.logger.log('Cliente InfluxDB inicializado correctamente');
  }

  async getRecentBiometricData(userId: string, hours: number = 24) {
    const queryApi = this.influxDB.getQueryApi(this.org);

    const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -${hours}h)
        |> filter(fn: (r) => r["_measurement"] == "wearable_biometrics")
        |> filter(fn: (r) => r["worker_id"] == "${userId}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    const results = [];

    try {
      for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
        const row = tableMeta.toObject(values);
        results.push(row);
      }
      
      this.logger.log(`Obtenidos ${results.length} puntos biométricos para usuario ${userId}`);
      return results;
    } catch (error) {
      this.logger.error(`Error fetching biometric data for user ${userId}:`, error);
      return [];
    }
  }

  async analyzeStressPatternsEnhanced(biometricData: any[]): Promise<BiometricAnalysis | null> {
    if (!biometricData || biometricData.length === 0) {
      return null;
    }

    const hrValues = biometricData
      .map(point => point.hr_bpm)
      .filter(val => val != null && !isNaN(val));

    const hrvValues = biometricData
      .map(point => point.hrv_rmssd_ms)
      .filter(val => val != null && !isNaN(val));

    const edaValues = biometricData
      .map(point => point.eda_microsiemens)
      .filter(val => val != null && !isNaN(val));

    if (hrValues.length === 0) {
      return null;
    }

    const avgHR = hrValues.reduce((sum, val) => sum + val, 0) / hrValues.length;
    const maxHR = Math.max(...hrValues);
    const minHR = Math.min(...hrValues);
    const stressPeaks = hrValues.filter(hr => hr > 100).length;

    const variance = hrValues.reduce((sum, val) => sum + Math.pow(val - avgHR, 2), 0) / hrValues.length;
    const stdDev = Math.sqrt(variance);

    const avgHRV = hrvValues.length > 0 
      ? hrvValues.reduce((sum, val) => sum + val, 0) / hrvValues.length 
      : null;
    
    const medianHRV = hrvValues.length > 0
      ? this.calculateMedian(hrvValues)
      : null;

    const avgEDA = edaValues.length > 0
      ? edaValues.reduce((sum, val) => sum + val, 0) / edaValues.length
      : null;

    const edaPeaks = edaValues.filter(eda => eda > 2.5).length;

    return {
      avg_heart_rate: Math.round(avgHR * 10) / 10,
      max_heart_rate: maxHR,
      min_heart_rate: minHR,
      std_deviation: Math.round(stdDev * 10) / 10,
      stress_peaks: stressPeaks,
      data_points: hrValues.length,
      avg_hrv: avgHRV ? Math.round(avgHRV * 10) / 10 : null,
      median_hrv: medianHRV ? Math.round(medianHRV * 10) / 10 : null,
      avg_eda: avgEDA ? Math.round(avgEDA * 100) / 100 : null,
      eda_peaks: edaPeaks,
      time_range_hours: biometricData.length > 0 
        ? (new Date(biometricData[biometricData.length - 1]._time).getTime() - 
           new Date(biometricData[0]._time).getTime()) / (1000 * 60 * 60) 
        : 0
    };
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  async predictBurnout(userId: string, authToken?: string) {
    try {
      const biometricData = await this.getRecentBiometricData(userId, 48);
      const biometricAnalysis = await this.analyzeStressPatternsEnhanced(biometricData);
      const workMetrics = await this.metricsService.getEmployeeMetrics(userId);
      const localRisk = this.calculateBurnoutRisk(biometricAnalysis, workMetrics);
      
      let aiAnalysis = null;
      const aiAvailable = await this.burnoutAIClient.isAvailable();
      
      if (aiAvailable && biometricAnalysis) {
        aiAnalysis = await this.burnoutAIClient.analyzeWithAI(
          parseInt(userId),
          biometricAnalysis,
          workMetrics,
          authToken,
        );
      }

      const finalPrediction = this.mergePredictions(localRisk, aiAnalysis);
      const alert = this.generateIntelligentAlert(finalPrediction, biometricAnalysis, aiAnalysis);
      const interventions = this.recommendInterventions(finalPrediction, aiAnalysis);
      const summary = this.generateSummary(finalPrediction, biometricAnalysis, aiAnalysis);

      return {
        prediction: {
          burnout_probability: finalPrediction.score,
          risk_level: finalPrediction.level,
          confidence: finalPrediction.confidence,
          last_updated: new Date().toISOString(),
          source: aiAnalysis ? 'hybrid_ai' : 'local_analysis',
        },
        biometric_analysis: biometricAnalysis,
        work_metrics: workMetrics,
        local_risk: localRisk,
        ai_analysis: aiAnalysis ? {
          burnout_level: aiAnalysis.prediction.burnout_level,
          risk_category: aiAnalysis.prediction.risk_category,
          ml_probability: aiAnalysis.prediction.burnout_probability,
        } : null,
        alert: alert,
        interventions: interventions,
        summary: summary,
      };
    } catch (error) {
      this.logger.error(`Error in burnout prediction for user ${userId}:`, error);
      return this.getDefaultPrediction();
    }
  }

  private calculateBurnoutRisk(stressAnalysis: BiometricAnalysis | null, workMetrics: any): BurnoutRisk {
    let score = 0.2;
    const factors: string[] = [];
    
    if (stressAnalysis) {
      if (stressAnalysis.avg_heart_rate > 90) {
        score += 0.25;
        factors.push('Frecuencia cardíaca elevada (>90 bpm)');
      } else if (stressAnalysis.avg_heart_rate > 85) {
        score += 0.15;
        factors.push('Frecuencia cardíaca moderadamente alta (>85 bpm)');
      }

      if (stressAnalysis.stress_peaks > 10) {
        score += 0.25;
        factors.push(`${stressAnalysis.stress_peaks} picos de estrés detectados`);
      } else if (stressAnalysis.stress_peaks > 5) {
        score += 0.15;
        factors.push(`${stressAnalysis.stress_peaks} picos de estrés moderados`);
      }

      if (stressAnalysis.std_deviation < 10) {
        score += 0.10;
        factors.push('Baja variabilidad cardíaca');
      }
    }
    
    if (workMetrics) {
      if (workMetrics.overtime_hours > 15) {
        score += 0.20;
        factors.push(`Horas extra excesivas: ${workMetrics.overtime_hours}h`);
      } else if (workMetrics.overtime_hours > 10) {
        score += 0.10;
        factors.push(`Horas extra moderadas: ${workMetrics.overtime_hours}h`);
      }

      if (workMetrics.workload_score > 8) {
        score += 0.20;
        factors.push(`Carga de trabajo alta: ${workMetrics.workload_score}/10`);
      } else if (workMetrics.workload_score > 6) {
        score += 0.10;
        factors.push(`Carga de trabajo moderada: ${workMetrics.workload_score}/10`);
      }
    }

    score = Math.min(score, 1.0);
    const level = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';
    
    return {
      score: Math.round(score * 100) / 100,
      level: level as 'low' | 'medium' | 'high',
      confidence: 0.85,
      contributing_factors: factors
    };
  }

  private mergePredictions(localRisk: BurnoutRisk, aiAnalysis: any): BurnoutRisk {
    if (!aiAnalysis) {
      return localRisk;
    }

    const aiScore = aiAnalysis.prediction.burnout_probability;
    const localScore = localRisk.score;
    const mergedScore = aiScore * 0.7 + localScore * 0.3;

    const level = mergedScore >= 0.7 ? 'high' : mergedScore >= 0.4 ? 'medium' : 'low';

    return {
      score: Math.round(mergedScore * 100) / 100,
      level: level as 'low' | 'medium' | 'high',
      confidence: 0.92,
      contributing_factors: [
        ...localRisk.contributing_factors,
        `Análisis ML: ${aiAnalysis.prediction.burnout_level}`,
      ],
      local_score: localScore,
      ai_score: aiScore,
    };
  }

  private generateIntelligentAlert(finalPrediction: BurnoutRisk, biometricAnalysis: BiometricAnalysis | null, aiAnalysis: any): Alert | null {
    const alert: Alert = {
      type: `BURNOUT_RISK_${finalPrediction.level.toUpperCase()}`,
      severity: finalPrediction.level === 'high' ? 'CRITICAL' : finalPrediction.level === 'medium' ? 'WARNING' : 'INFO',
      timestamp: new Date().toISOString(),
    };

    if (finalPrediction.level === 'high') {
      alert.title = 'Alto Riesgo de Burnout Detectado';
      alert.message = biometricAnalysis 
        ? `Riesgo crítico: FC=${biometricAnalysis.avg_heart_rate} bpm, HRV=${biometricAnalysis.median_hrv} ms, ${biometricAnalysis.stress_peaks} picos de estrés.`
        : 'Alto riesgo detectado en métricas laborales.';
      
      alert.recommendations = [
        'ACCIÓN INMEDIATA: Reducir carga laboral al 60%',
        'Consulta médica ocupacional en 24-48h',
        'Descanso obligatorio de 2-3 días',
      ];

      if (aiAnalysis) {
        alert.ai_insights = `Modelo ML confirma: ${aiAnalysis.prediction.risk_category}`;
      }

      alert.requires_action = true;
    } else if (finalPrediction.level === 'medium') {
      alert.title = 'Riesgo Moderado de Burnout';
      alert.message = 'Monitoreo continuo requerido. Patrones de estrés detectados.';
      alert.recommendations = [
        'Implementar pausas activas cada 2 horas',
        'Monitorear calidad de sueño',
        'Sesiones de mindfulness 3x/semana',
      ];
      alert.requires_action = false;
    } else {
      return null;
    }

    return alert;
  }

  private recommendInterventions(finalPrediction: BurnoutRisk, aiAnalysis: any): Intervention[] {
    const baseInterventions: Intervention[] = [
      {
        id: 'mindfulness',
        name: 'Sesiones de mindfulness',
        frequency: 'Diaria',
        duration: '10-15 minutos',
        priority: 'MEDIUM',
      },
      {
        id: 'psych_eval',
        name: 'Evaluación psicológica',
        frequency: 'Mensual',
        duration: '45 minutos',
        priority: 'LOW',
      },
    ];

    let interventions: Intervention[] = [...baseInterventions];

    if (finalPrediction.level === 'high') {
      interventions = [
        {
          id: 'workload_reduction',
          name: 'Reducción inmediata de carga laboral',
          priority: 'URGENT',
          description: 'Reasignar el 40% de tareas, reducir a 60% de capacidad',
          estimated_duration: '2-4 semanas',
        },
        {
          id: 'medical_consult',
          name: 'Consulta médica ocupacional urgente',
          priority: 'URGENT',
          description: 'Evaluación completa con especialista en 24-48h',
          estimated_duration: '1 sesión + seguimiento',
        },
        ...baseInterventions,
      ];
    } else if (finalPrediction.level === 'medium') {
      interventions = [
        {
          id: 'stress_workshop',
          name: 'Taller de manejo de estrés',
          priority: 'HIGH',
          description: 'Sesión grupal semanal de 2 horas',
          estimated_duration: '4-6 semanas',
        },
        {
          id: 'schedule_optimization',
          name: 'Optimización de horarios',
          priority: 'MEDIUM',
          description: 'Revisar y ajustar carga de reuniones y horarios',
          estimated_duration: '1-2 semanas',
        },
        ...baseInterventions,
      ];
    }

    if (aiAnalysis?.interventions) {
      interventions.push({
        id: 'ai_recommendations',
        name: 'Recomendaciones del Modelo ML',
        priority: 'HIGH',
        description: 'Intervenciones personalizadas basadas en análisis predictivo',
        details: aiAnalysis.interventions,
      });
    }

    return interventions;
  }

  private generateSummary(finalPrediction: BurnoutRisk, biometricAnalysis: BiometricAnalysis | null, aiAnalysis: any): string {
    const lines: string[] = [];
    
    lines.push('ANALISIS DE BURNOUT');
    lines.push('========================');
    lines.push(`Riesgo: ${finalPrediction.level.toUpperCase()} (${(finalPrediction.score * 100).toFixed(0)}%)`);
    lines.push(`Fuente: ${aiAnalysis ? 'Análisis Híbrido (Local + IA ML)' : 'Análisis Local'}`);
    lines.push(`Fecha: ${new Date().toLocaleDateString()}`);
    lines.push('');

    if (biometricAnalysis) {
      lines.push('METRICAS BIOMETRICAS');
      lines.push(`   • FC Promedio: ${biometricAnalysis.avg_heart_rate} bpm`);
      if (biometricAnalysis.median_hrv) {
        lines.push(`   • HRV Mediana: ${biometricAnalysis.median_hrv} ms`);
      }
      lines.push(`   • Picos de Estrés: ${biometricAnalysis.stress_peaks} en ${Math.round(biometricAnalysis.time_range_hours)}h`);
      lines.push(`   • Puntos de Datos: ${biometricAnalysis.data_points}`);
      lines.push('');
    }

    if (aiAnalysis) {
      lines.push('ANALISIS DE INTELIGENCIA ARTIFICIAL');
      lines.push(`   • Nivel ML: ${aiAnalysis.prediction.burnout_level}`);
      lines.push(`   • Categoría: ${aiAnalysis.prediction.risk_category}`);
      lines.push(`   • Probabilidad ML: ${(aiAnalysis.prediction.burnout_probability * 100).toFixed(1)}%`);
      lines.push('');
    }

    if (finalPrediction.contributing_factors && finalPrediction.contributing_factors.length > 0) {
      lines.push('FACTORES DE RIESGO');
      finalPrediction.contributing_factors.forEach((factor: string) => {
        lines.push(`   • ${factor}`);
      });
    }

    return lines.join('\n');
  }

  private getDefaultPrediction() {
    return {
      prediction: {
        burnout_probability: 0.3,
        risk_level: 'unknown',
        confidence: 0.0,
        last_updated: new Date().toISOString(),
        error: 'No se pudo calcular predicción',
        source: 'fallback',
      },
      biometric_analysis: null,
      work_metrics: null,
      local_risk: null,
      ai_analysis: null,
      alert: null,
      interventions: [],
      summary: 'No hay datos suficientes para generar análisis'
    };
  }
}