import { IsNumber, IsString, Length } from 'class-validator';

export class CreateQuestionI18nDto {
  @IsNumber()
  questionId!: number;

  @IsString()
  @Length(2, 10)
  locale!: string;

  @IsString()
  @Length(1, 255)
  text!: string;
}
