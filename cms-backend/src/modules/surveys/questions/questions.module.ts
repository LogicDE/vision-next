import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { Question } from '../../../entities/question.entity';
import { SurveyVersionQuestion } from '../../../entities/survey-version-question.entity';
import { Group } from '../../../entities/group.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, SurveyVersionQuestion, Group]),
    AuthModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
