import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { PredictionService } from '../prediction/prediction.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private readonly LOCAL_ALERT_TTL = 3600;
  private readonly SMART_ALERT_TTL = 600;

  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
    private readonly predictionService: PredictionService,
  ) {}

  async getCombinedAlerts(userId: string, burnoutProbability: number, metrics: any) {
    try {
      const [localAlerts, biometricAlerts, smartAlert] = await Promise.all([
        this.getLocalAlerts(userId),
        this.getBiometricAlerts(userId),
        this.getSmartAlerts(userId, burnoutProbability, metrics)
      ]);

      return [...localAlerts, ...biometricAlerts, ...(smartAlert ? [smartAlert] : [])];
    } catch (error) {
      this.logger.error(`Error combinando alertas para ${userId}:`, error);
      return [];
    }
  }

// ✅ CORRECCIÓN en alerts.service.ts
private async getBiometricAlerts(userId: string) {
  const alerts: any[] = [];
  
  try {
    const recentData = await this.predictionService.getRecentBiometricData(userId, 1);
    
    if (!recentData || recentData.length === 0) {
      return alerts;
    }

    // ✅ DESPUÉS DE pivot(), los campos son columnas directas
    // Extraer valores de HR
    const hrValues = recentData
      .map(point => point.hr_bpm)  // ← Acceso directo, no point._field
      .filter((val): val is number => val != null && typeof val === 'number');

    if (hrValues.length > 0) {
      const currentHR = hrValues[hrValues.length - 1];
      const avgHR = hrValues.reduce((sum, val) => sum + val, 0) / hrValues.length;
      
      if (currentHR > 120) {
        alerts.push({
          type: 'HIGH_HEART_RATE',
          severity: 'HIGH',
          message: `Frecuencia cardíaca muy elevada: ${Math.round(currentHR)} bpm`,
          timestamp: new Date().toISOString(),
          value: Math.round(currentHR),
          threshold: 120
        });
      } else if (avgHR > 100) {
        alerts.push({
          type: 'ELEVATED_HEART_RATE',
          severity: 'MEDIUM',
          message: `FC promedio elevada: ${Math.round(avgHR)} bpm`,
          timestamp: new Date().toISOString(),
          value: Math.round(avgHR),
          threshold: 100
        });
      }
    }

    // ✅ Análisis de HRV
    const hrvValues = recentData
      .map(point => point.hrv_rmssd_ms)  // ← Acceso directo
      .filter((val): val is number => val != null && typeof val === 'number');

    if (hrvValues.length > 0) {
      const avgHRV = hrvValues.reduce((sum, val) => sum + val, 0) / hrvValues.length;
      
      if (avgHRV < 20) {
        alerts.push({
          type: 'LOW_HRV',
          severity: 'MEDIUM',
          message: `HRV bajo: ${Math.round(avgHRV)} ms (estrés detectado)`,
          timestamp: new Date().toISOString(),
          value: Math.round(avgHRV),
          threshold: 20
        });
      }
    }

  } catch (error) {
    this.logger.error(`Error en alertas biométricas para ${userId}:`, error);
  }

  return alerts;
}

  async generateLocalAlert(userId: string, metric: string, value: number) {
    if (value <= 80) return null;

    const alert = { 
      type: 'WORKLOAD_ALERT',
      metric, 
      value, 
      severity: value > 90 ? 'HIGH' : 'MEDIUM',
      message: `Alerta en métrica ${metric}: ${value}`,
      timestamp: new Date().toISOString() 
    };
    
    const key = `alerts:${userId}`;
    const existingAlerts = (await this.cacheService.get<any[]>(key)) || [];
    existingAlerts.push(alert);

    await this.cacheService.set(key, existingAlerts, this.LOCAL_ALERT_TTL);
    return alert;
  }

  async getLocalAlerts(userId: string) {
    return (await this.cacheService.get<any[]>(`alerts:${userId}`)) || [];
  }

  async getSmartAlerts(userId: string, prediction: number, metrics: any) {
    const cacheKey = `smart_alerts:${userId}`;
    
    try {
      const cached = await this.cacheService.get<any>(cacheKey);
      if (cached) return cached;

      // Simular llamada a microservicio de IA (puedes implementar la real después)
      const mockAlert = prediction > 0.7 ? {
        type: 'AI_BURNOUT_RISK',
        severity: 'HIGH',
        message: `Algoritmo IA detecta riesgo alto de burnout (${Math.round(prediction * 100)}%)`,
        timestamp: new Date().toISOString(),
        confidence: 0.85
      } : null;

      if (mockAlert) {
        await this.cacheService.set(cacheKey, mockAlert, this.SMART_ALERT_TTL);
      }

      return mockAlert;
    } catch (error: unknown) {
  if (error instanceof Error) {
    this.logger.error(`Error en alertas biométricas para ${userId}:`, error.message);
  } else {
    this.logger.error(`Error desconocido en alertas biométricas para ${userId}:`, String(error));
  }
}
  }
}