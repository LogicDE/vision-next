// src/modules/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CacheModule } from '../../infrastructure/cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

//boilerplate