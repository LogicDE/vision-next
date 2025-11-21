import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateInterventionDto {
  @IsNumber()
  groupId!: number;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsString()
  @Length(1, 100)
  titleMessage!: string;

  @IsString()
  @Length(1, 255)
  bodyMessage!: string;
}
