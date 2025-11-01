import { PartialType } from '@nestjs/mapped-types';
import { CreateIndivSurveyScoreDto } from './create-indiv-survey-score.dto';

export class UpdateIndivSurveyScoreDto extends PartialType(CreateIndivSurveyScoreDto) {}
