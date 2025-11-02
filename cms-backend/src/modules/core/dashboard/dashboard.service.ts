import { Injectable } from '@nestjs/common';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class DashboardService {
  constructor(private cacheService: CacheService) {}

  async getUserDashboard(userId: string) {
    const data = {
      wellbeingWeekly: Math.random() * 100,
      stressLevel: Math.random() * 100,
      lastUpdated: new Date().toISOString(),
    };

    await this.cacheService.set(`dashboard:${userId}`, data, 600); // 10 min TTL
    return data;
  }
}
