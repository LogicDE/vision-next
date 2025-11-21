import { IsNumber, IsOptional, IsDateString, IsString, Length } from 'class-validator';

export class CreateGroupSurveyScoreDto {
  @IsNumber()
  groupId!: number;

  @IsString()
  @Length(1, 150)
  name!: string;

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
