import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { IndivSurveyScore } from '../../../entities/indiv-survey-score.entity';
import { ResponseAnswer } from '../../../entities/response-answer.entity';
import { SurveyVersionQuestion } from '../../../entities/survey-version-question.entity';
import { SurveyVersion } from '../../../entities/survey-version.entity';
import { Employee } from '../../../entities/employee.entity';
import { IndivSurveyScoresService } from './indiv-survey-scores.service';
import { IndivSurveyScoresController } from './indiv-survey-scores.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndivSurveyScore, ResponseAnswer, SurveyVersionQuestion, SurveyVersion, Employee]),
    AuthModule,
  ],
  controllers: [IndivSurveyScoresController],
  providers: [IndivSurveyScoresService],
  exports: [IndivSurveyScoresService],
})
export class IndivSurveyScoresModule {}
