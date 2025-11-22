// src/modules/prediction/prediction.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../../../auth/auth.module';
import { MetricsModule } from '../metrics/metrics.module';
import { BurnoutAIClient } from './clients/burnout-ai.client';


@Module({
  imports: [HttpModule, AuthModule, forwardRef(() => MetricsModule),],
  providers: [PredictionService, BurnoutAIClient],
  exports: [PredictionService],
})
export class PredictionModule {}

//boilerplate