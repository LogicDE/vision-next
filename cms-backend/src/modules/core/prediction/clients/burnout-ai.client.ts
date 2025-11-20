import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface AIAnalysisRequest {
  time_to_recover: number;
  high_stress_prevalence_perc: number;
  median_hrv: number;
  avg_pulse: number;
  sleep_score: number;
  media_hrv: number;
  eda_peaks: number;
  time_to_recover_hrv: number;
  weekly_hours_in_meetings: number;
  time_on_focus_blocks: number;
  absenteesim_days: number;
  high_stress_prevalence: number;
  nps_score: number;
  intervention_acceptance_rate: number;
}

interface AIAnalysisResponse {
  user_id: number;
  generated_at: string;
  prediction: {
    burnout_probability: number;
    burnout_prediction: number;
    burnout_level: string;
    risk_category: string;
  };
  alert: any;
  summary: any;
  interventions: any;
  metrics: any;
}

@Injectable()
export class BurnoutAIClient {
  private readonly logger = new Logger(BurnoutAIClient.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('BURNOUT_AI_URL') || 'http://burnout-microservice:8001';
  }

  /**
   * Transforma datos biométricos + laborales al formato esperado por la IA
   */
  private transformToAIFormat(
    biometricAnalysis: any,
    workMetrics: any,
  ): AIAnalysisRequest {
    // Extraer datos biométricos
    const avgHR = biometricAnalysis?.avg_heart_rate || 72;
    const medianHRV = biometricAnalysis?.median_hrv || biometricAnalysis?.avg_hrv || 45;
    const stressPeaks = biometricAnalysis?.stress_peaks || 0;
    const edaPeaks = biometricAnalysis?.eda_peaks || 0;
    const dataPoints = biometricAnalysis?.data_points || 0;

    // Calcular métricas derivadas
    const timeToRecover = this.calculateRecoveryTime(avgHR, medianHRV);
    const highStressPrevalence = dataPoints > 0 ? (stressPeaks / dataPoints) * 100 : 0;

    return {
      time_to_recover: Math.round(timeToRecover * 100) / 100,
      high_stress_prevalence_perc: Math.round(highStressPrevalence * 100) / 100,
      median_hrv: Math.round(medianHRV * 100) / 100,
      avg_pulse: Math.round(avgHR * 100) / 100,
      sleep_score: workMetrics?.sleep_score || 75,
      media_hrv: Math.round(medianHRV * 100) / 100,
      eda_peaks: edaPeaks,
      time_to_recover_hrv: Math.round(timeToRecover * 100) / 100,
      weekly_hours_in_meetings: workMetrics?.weekly_meetings || 15,
      time_on_focus_blocks: workMetrics?.focus_time || 5,
      absenteesim_days: workMetrics?.absence_days || 0,
      high_stress_prevalence: Math.round(highStressPrevalence) / 100,
      nps_score: workMetrics?.nps_score || 7,
      intervention_acceptance_rate: workMetrics?.acceptance_rate || 0.5,
    };
  }

  /**
   * Calcula tiempo de recuperación basado en HR y HRV
   */
  private calculateRecoveryTime(avgHR: number, hrv: number): number {
    const hrFactor = Math.max(0, (avgHR - 60) / 10);
    const hrvFactor = Math.max(0, (50 - hrv) / 10);
    return 20 + hrFactor * 5 + hrvFactor * 3;
  }

  /**
   * Llama al microservicio de IA para obtener análisis completo
   */
  async analyzeWithAI(
    userId: number,
    biometricAnalysis: any,
    workMetrics: any,
    authToken?: string,
  ): Promise<AIAnalysisResponse | null> {
    try {
      // Transformar datos al formato de la IA (SIN user_id en el body)
      const aiRequest = this.transformToAIFormat(biometricAnalysis, workMetrics);

      this.logger.log(`Enviando análisis a IA para usuario ${userId}`);
      this.logger.debug(`Payload IA: ${JSON.stringify(aiRequest)}`);

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // ✅ CORRECCIÓN: user_id va en la URL, NO en el body
      const response = await firstValueFrom(
        this.httpService.post<AIAnalysisResponse>(
          `${this.aiServiceUrl}/api/burnout/analyze-custom?user_id=${userId}`, // ← userId en query param
          aiRequest, // ← Body sin user_id
          { headers, timeout: 5000 },
        ),
      );

      this.logger.log(`Análisis IA completado para usuario ${userId}: ${response.data.prediction.burnout_level}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error llamando a microservicio IA para usuario ${userId}:`);
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}`);
        this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }

  /**
   * Obtiene solo la predicción de burnout
   */
  async getPrediction(userId: number, authToken?: string): Promise<number | null> {
    try {
      const headers: any = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.aiServiceUrl}/api/burnout/predict/${userId}`,
          { headers, timeout: 3000 },
        ),
      );

      return response.data.burnout_probability;
    } catch (error) {
      this.logger.warn(`No se pudo obtener predicción IA para usuario ${userId}`);
      return null;
    }
  }

  /**
   * Verifica si el microservicio IA está disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/api/burnout/health`, { timeout: 2000 }),
      );
      return response.data.status === 'healthy';
    } catch (error) {
      this.logger.warn('Microservicio de IA no disponible');
      return false;
    }
  }
}