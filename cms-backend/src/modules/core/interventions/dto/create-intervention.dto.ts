import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateInterventionDto {
  @IsOptional()
  @IsNumber()
  managerId?: number;

  @IsString()
  @Length(1, 100)
  type!: string;

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
