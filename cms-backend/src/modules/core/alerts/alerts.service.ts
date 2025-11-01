import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private readonly LOCAL_ALERT_TTL = 3600; // 1 hora
  private readonly SMART_ALERT_TTL = 600; // 10 min

  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
  ) {}

  // ----------------------------
  // 1️⃣ Generar alerta local y cachearla en Redis
  // ----------------------------
  async generateLocalAlert(userId: string, metric: string, value: number) {
    if (value <= 80) return null;

    const alert = { metric, value, timestamp: new Date().toISOString() };
    const key = `alerts:${userId}`;

    const existingAlerts = (await this.cacheService.get<any[]>(key)) || [];
    existingAlerts.push(alert);

    await this.cacheService.set(key, existingAlerts, this.LOCAL_ALERT_TTL);
    this.logger.log(`Alerta local generada para ${userId}: ${metric}=${value}`);

    return alert;
  }

  // ----------------------------
  // 2️⃣ Obtener alertas locales desde Redis
  // ----------------------------
  async getLocalAlerts(userId: string) {
    return (await this.cacheService.get<any[]>(`alerts:${userId}`)) || [];
  }

  // ----------------------------
  // 3️⃣ Obtener alertas inteligentes vía microservicio y cachearlas
  // ----------------------------
  async getSmartAlerts(userId: string, prediction: number, metrics: any) {
    const cacheKey = `smart_alerts:${userId}`;

    // Revisar cache primero
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const url = `http://burnout-microservice:8001/api/burnout/alerts/${userId}`;
      const response = await firstValueFrom(this.httpService.get(url));
      const alert = response.data.alert || null;

      if (alert) {
        await this.cacheService.set(cacheKey, alert, this.SMART_ALERT_TTL);
        this.logger.log(`Alerta inteligente cacheada para ${userId}`);
      }

      return alert;
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`Error obteniendo alertas inteligentes para ${userId}: ${err.message}`);
      } else {
        this.logger.error(
          `Error desconocido obteniendo alertas inteligentes para ${userId}: ${JSON.stringify(err)}`,
        );
      }
      return null;
    }
  }

  // ----------------------------
  // 4️⃣ Método híbrido: combinar alertas locales + IA
  // ----------------------------
  async getCombinedAlerts(userId: string, prediction: number, metrics: any) {
    const localAlerts = await this.getLocalAlerts(userId);
    const smartAlert = await this.getSmartAlerts(userId, prediction, metrics);

    const combined = [...localAlerts];
    if (smartAlert) combined.push(smartAlert);

    return combined;
  }
}
