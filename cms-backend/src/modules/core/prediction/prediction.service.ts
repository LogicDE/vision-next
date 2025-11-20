import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB } from '@influxdata/influxdb-client';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  private influxDB: InfluxDB;
  private org: string;
  private bucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {
    // Inicializar cliente InfluxDB
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

  /**
   * Obtiene datos biométricos recientes de InfluxDB
   */
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

  /**
   * Analiza patrones de estrés basados en datos biométricos
   */
  async analyzeStressPatterns(biometricData: any[]) {
    if (!biometricData || biometricData.length === 0) {
      return null;
    }

    // Extraer valores de HR
    const hrValues = biometricData
      .map(point => point.hr_bpm)
      .filter(val => val != null && !isNaN(val));

    if (hrValues.length === 0) {
      return null;
    }

    const avgHR = hrValues.reduce((sum, val) => sum + val, 0) / hrValues.length;
    const maxHR = Math.max(...hrValues);
    const minHR = Math.min(...hrValues);
    
    // Detectar picos de estrés (HR > 100 bpm)
    const stressPeaks = hrValues.filter(hr => hr > 100).length;
    
    // Calcular variabilidad
    const variance = hrValues.reduce((sum, val) => sum + Math.pow(val - avgHR, 2), 0) / hrValues.length;
    const stdDev = Math.sqrt(variance);

    return {
      avg_heart_rate: Math.round(avgHR * 10) / 10,
      max_heart_rate: maxHR,
      min_heart_rate: minHR,
      std_deviation: Math.round(stdDev * 10) / 10,
      stress_peaks: stressPeaks,
      data_points: hrValues.length,
      time_range_hours: biometricData.length > 0 ? 
        (new Date(biometricData[biometricData.length - 1]._time).getTime() - 
         new Date(biometricData[0]._time).getTime()) / (1000 * 60 * 60) : 0
    };
  }

  /**
   * Predicción principal de burnout
   */
  async predictBurnout(userId: string) {
    try {
      // 1️⃣ Obtener datos biométricos recientes (últimas 48 horas)
      const biometricData = await this.getRecentBiometricData(userId, 48);
      
      // 2️⃣ Analizar patrones de estrés
      const stressAnalysis = await this.analyzeStressPatterns(biometricData);

      // 3️⃣ Obtener métricas tradicionales del CMS
      const workMetrics = await this.metricsService.getEmployeeMetrics(userId);
      
      // 4️⃣ Calcular riesgo de burnout
      const burnoutRisk = this.calculateBurnoutRisk(stressAnalysis, workMetrics);
      
      // 5️⃣ Generar alertas inteligentes
      const alert = this.generateIntelligentAlert(burnoutRisk, stressAnalysis);
      
      // 6️⃣ Recomendar intervenciones
      const interventions = this.recommendInterventions(burnoutRisk);

      // 7️⃣ Generar resumen
      const summary = this.generateSummary(burnoutRisk, stressAnalysis);

      return {
        prediction: {
          burnout_probability: burnoutRisk.score,
          risk_level: burnoutRisk.level,
          confidence: burnoutRisk.confidence,
          last_updated: new Date().toISOString()
        },
        biometric_analysis: stressAnalysis,
        work_metrics: workMetrics,
        alert: alert,
        interventions: interventions,
        summary: summary
      };
    } catch (error) {
      this.logger.error(`Error in burnout prediction for user ${userId}:`, error);
      return this.getDefaultPrediction();
    }
  }

  /**
   * Calcula el riesgo de burnout combinando biométrica y métricas laborales
   */
  private calculateBurnoutRisk(stressAnalysis: any, workMetrics: any) {
    let score = 0.2; // Base score (riesgo bajo por defecto)
    const factors = [];
    
    // 🔴 Factores biométricos (peso: 50%)
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

      // Baja variabilidad indica estrés crónico
      if (stressAnalysis.std_deviation < 10) {
        score += 0.10;
        factors.push('Baja variabilidad cardíaca');
      }
    }
    
    // 🟡 Factores de trabajo (peso: 50%)
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

    // Normalizar score
    score = Math.min(score, 1.0);

    // Determinar nivel de riesgo
    const level = score >= 0.7 ? 'high' : score >= 0.4 ? 'medium' : 'low';
    
    return {
      score: Math.round(score * 100) / 100,
      level: level,
      confidence: 0.85,
      contributing_factors: factors
    };
  }

  /**
   * Genera alertas inteligentes basadas en el riesgo
   */
  private generateIntelligentAlert(burnoutRisk: any, stressAnalysis: any) {
    if (burnoutRisk.level === 'high') {
      return {
        type: 'BURNOUT_RISK_HIGH',
        severity: 'CRITICAL',
        title: '🚨 Alto Riesgo de Burnout Detectado',
        message: stressAnalysis 
          ? `Alto riesgo de burnout. FC promedio: ${stressAnalysis.avg_heart_rate} bpm, ${stressAnalysis.stress_peaks} picos de estrés en 48h.`
          : 'Alto riesgo de burnout detectado basado en métricas laborales.',
        recommendations: [
          'Reducción inmediata de carga laboral',
          'Consulta urgente con médico ocupacional',
          'Descanso obligatorio de al menos 2 días'
        ],
        timestamp: new Date().toISOString(),
        requires_action: true
      };
    }
    
    if (burnoutRisk.level === 'medium') {
      return {
        type: 'BURNOUT_RISK_MEDIUM', 
        severity: 'WARNING',
        title: '⚠️ Riesgo Moderado de Burnout',
        message: 'Riesgo moderado detectado. Se requiere monitoreo continuo.',
        recommendations: [
          'Implementar pausas activas cada 2 horas',
          'Monitorear patrones de sueño',
          'Sesiones semanales de mindfulness'
        ],
        timestamp: new Date().toISOString(),
        requires_action: false
      };
    }

    return null; // Sin alerta para riesgo bajo
  }

  /**
   * Recomienda intervenciones basadas en el nivel de riesgo
   */
  private recommendInterventions(burnoutRisk: any) {
    const baseInterventions = [
      {
        id: 'mindfulness',
        name: 'Sesiones de mindfulness',
        frequency: 'Diaria',
        duration: '10-15 minutos'
      },
      {
        id: 'psych_eval',
        name: 'Evaluación psicológica',
        frequency: 'Mensual',
        duration: '45 minutos'
      }
    ];

    if (burnoutRisk.level === 'high') {
      return [
        {
          id: 'workload_reduction',
          name: 'Reducción de carga laboral',
          priority: 'URGENT',
          description: 'Reasignar tareas urgentes, reducir al 60% de capacidad'
        },
        {
          id: 'medical_consult',
          name: 'Consulta médica ocupacional',
          priority: 'URGENT',
          description: 'Evaluación médica completa dentro de 24-48h'
        },
        ...baseInterventions
      ];
    }

    if (burnoutRisk.level === 'medium') {
      return [
        {
          id: 'stress_workshop',
          name: 'Taller de manejo de estrés',
          priority: 'HIGH',
          description: 'Sesión grupal semanal de 2 horas'
        },
        {
          id: 'schedule_optimization',
          name: 'Optimización de horarios',
          priority: 'MEDIUM',
          description: 'Revisar y ajustar horarios de trabajo'
        },
        ...baseInterventions
      ];
    }

    return baseInterventions;
  }

  /**
   * Genera un resumen ejecutivo del análisis
   */
  private generateSummary(burnoutRisk: any, stressAnalysis: any): string {
    const lines = [];
    
    lines.push(`📊 Nivel de Riesgo: ${burnoutRisk.level.toUpperCase()} (${(burnoutRisk.score * 100).toFixed(0)}%)`);
    
    if (stressAnalysis) {
      lines.push(`💓 FC Promedio: ${stressAnalysis.avg_heart_rate} bpm`);
      lines.push(`⚡ Picos de Estrés: ${stressAnalysis.stress_peaks} en ${Math.round(stressAnalysis.time_range_hours)}h`);
    }
    
    if (burnoutRisk.contributing_factors.length > 0) {
      lines.push(`\n🔍 Factores Contribuyentes:`);
      burnoutRisk.contributing_factors.forEach((factor: string) => {
        lines.push(`  • ${factor}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Devuelve predicción por defecto en caso de error
   */
  private getDefaultPrediction() {
    return {
      prediction: {
        burnout_probability: 0.3,
        risk_level: 'unknown',
        confidence: 0.0,
        last_updated: new Date().toISOString(),
        error: 'No se pudo calcular predicción'
      },
      biometric_analysis: null,
      work_metrics: null,
      alert: null,
      interventions: [],
      summary: 'No hay datos suficientes para generar análisis'
    };
  }
}