import { Injectable } from '@nestjs/common';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class AlertsService {
  constructor(private cacheService: CacheService) {}

  async generateAlert(userId: string, metric: string, value: number) {
    if (value > 80) {
      const alert = {
        metric,
        value,
        timestamp: new Date().toISOString(),
      };

      const key = `alerts:${userId}`;
      const existingAlerts = (await this.cacheService.get<any[]>(key)) || [];
      existingAlerts.push(alert);
      await this.cacheService.set(key, existingAlerts, 3600); // 1 hora TTL

      return alert;
    }
    return null;
  }

  async getUserAlerts(userId: string) {
    return (await this.cacheService.get<any[]>(`alerts:${userId}`)) || [];
  }
}
