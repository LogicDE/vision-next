import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { Survey } from '../../../entities/survey.entity';
import { SurveyVersion } from '../../../entities/survey-version.entity';
import { Question } from '../../../entities/question.entity';
import { SurveyVersionQuestion } from '../../../entities/survey-version-question.entity';
import { Group } from '../../../entities/group.entity';
import { SurveyVersionsService } from './survey-versions.service';
import { SurveyVersionsController } from './survey-versions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, SurveyVersion, Question, SurveyVersionQuestion, Group]),
    AuthModule,
  ],
  controllers: [SurveyVersionsController],
  providers: [SurveyVersionsService],
  exports: [SurveyVersionsService],
})
export class SurveyVersionsModule {}

