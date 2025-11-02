import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { GroupSurveyScore } from '../../../entities/group-survey-score.entity';
import { Group } from '../../../entities/group.entity';
import { GroupSurveyScoresService } from './group-survey-scores.service';
import { GroupSurveyScoresController } from './group-survey-scores.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupSurveyScore, Group]),
    AuthModule,
  ],
  controllers: [GroupSurveyScoresController],
  providers: [GroupSurveyScoresService],
  exports: [GroupSurveyScoresService],
})
export class GroupSurveyScoresModule {}
