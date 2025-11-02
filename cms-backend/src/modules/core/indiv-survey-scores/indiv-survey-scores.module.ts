import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { IndivSurveyScore } from '../../../entities/indiv-survey-score.entity';
import { GroupSurveyScore } from '../../../entities/group-survey-score.entity';
import { Employee } from '../../../entities/employee.entity';
import { IndivSurveyScoresService } from './indiv-survey-scores.service';
import { IndivSurveyScoresController } from './indiv-survey-scores.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndivSurveyScore, GroupSurveyScore, Employee]),
    AuthModule,
  ],
  controllers: [IndivSurveyScoresController],
  providers: [IndivSurveyScoresService],
  exports: [IndivSurveyScoresService],
})
export class IndivSurveyScoresModule {}
