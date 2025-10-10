import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateInterventionDto {
  @IsOptional()
  @IsNumber()
  id_manager?: number;

  @IsOptional()
  @IsNumber()
  id_group?: number;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  title_message!: string;

  @IsString()
  @IsNotEmpty()
  body_message!: string;
}
