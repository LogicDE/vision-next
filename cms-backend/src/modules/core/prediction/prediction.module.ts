// src/modules/prediction/prediction.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../../../auth/auth.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [HttpModule, AuthModule, forwardRef(() => MetricsModule),],
  providers: [PredictionService],
  exports: [PredictionService],
})
export class PredictionModule {}

//boilerplate