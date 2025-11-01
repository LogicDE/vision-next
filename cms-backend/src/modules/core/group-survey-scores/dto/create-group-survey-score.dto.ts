import { IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateGroupSurveyScoreDto {
  @IsNumber()
  groupId!: number;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsNumber()
  groupScore?: number;
}
