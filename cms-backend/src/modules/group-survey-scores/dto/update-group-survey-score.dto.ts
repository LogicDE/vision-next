import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupSurveyScoreDto } from './create-group-survey-score.dto';

export class UpdateGroupSurveyScoreDto extends PartialType(CreateGroupSurveyScoreDto) {}
