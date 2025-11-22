import { IsNumber, IsArray, ArrayMinSize, Min, Max } from 'class-validator';

export class SubmitSurveyDto {
  @IsNumber()
  surveyVersionId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(5, { each: true })
  answers!: number[]; // Array of answer values (1-5) in the same order as questions
}

