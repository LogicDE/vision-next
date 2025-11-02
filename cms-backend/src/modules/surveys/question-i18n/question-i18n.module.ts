import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { QuestionI18n } from '../../../entities/question-i18n.entity';
import { Question } from '../../../entities/question.entity';
import { QuestionI18nService } from './question-i18n.service';
import { QuestionI18nController } from './question-i18n.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionI18n, Question]),
    AuthModule,
  ],
  controllers: [QuestionI18nController],
  providers: [QuestionI18nService],
  exports: [QuestionI18nService],
})
export class QuestionI18nModule {}
