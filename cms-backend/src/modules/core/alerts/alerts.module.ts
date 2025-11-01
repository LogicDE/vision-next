// src/modules/alerts/alerts.module.ts
import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CacheModule } from '../../infrastructure/cache/cache.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../../../auth/auth.module';


@Module({
  imports: [CacheModule, HttpModule, AuthModule],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}

//boilerplate