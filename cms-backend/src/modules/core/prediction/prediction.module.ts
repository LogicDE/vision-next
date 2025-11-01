// src/modules/prediction/prediction.module.ts
import { Module } from '@nestjs/common';
import { PredictionService } from './prediction.service';

@Module({
  providers: [PredictionService],
  exports: [PredictionService],
})
export class PredictionModule {}

//boilerplate