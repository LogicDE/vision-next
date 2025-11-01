// src/modules/alerts/alerts.module.ts
import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CacheModule } from '../../infrastructure/cache/cache.module';


@Module({
  imports: [CacheModule],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}

//boilerplate