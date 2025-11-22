import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsPositive, Max, Min } from 'class-validator';

export class SubmitIndivSurveyDto {
  @IsInt()
  @IsPositive()
  surveyId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(5, { each: true })
  answers!: number[];
}

