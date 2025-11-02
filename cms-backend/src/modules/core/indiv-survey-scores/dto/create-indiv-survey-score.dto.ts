import { IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateIndivSurveyScoreDto {
  @IsNumber()
  surveyId!: number;

  @IsNumber()
  employeeId!: number;

  @IsOptional()
  @IsDateString()
  submittedAt?: string;

  @IsOptional()
  @IsNumber()
  indivScore?: number;
}
