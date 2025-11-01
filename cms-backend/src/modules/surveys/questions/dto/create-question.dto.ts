import { IsNumber, IsOptional } from 'class-validator';

export class CreateQuestionDto {
  @IsOptional()
  @IsNumber()
  groupId?: number;
}
