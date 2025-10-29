import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateInterventionDto {
  @IsOptional()
  @IsNumber()
  id_manager?: number;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  title!: string; // Cambiado de title_message

  @IsString()
  @IsOptional()
  body?: string; // Si quieres un campo extra, o se puede eliminar
}
