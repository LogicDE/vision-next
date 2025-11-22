import { IsArray, IsNotEmpty, IsNumber, ArrayMinSize } from 'class-validator';

export class CreateSurveyVersionDto {
  @IsNotEmpty()
  @IsNumber()
  versionNum!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  questionIds!: number[];
}

