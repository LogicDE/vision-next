// src/modules/prediction/prediction.module.ts
import { Module } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../../../auth/auth.module';


@Module({
  imports: [HttpModule, AuthModule],
  providers: [PredictionService],
  exports: [PredictionService],
})
export class PredictionModule {}

//boilerplate