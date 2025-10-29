import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateEventDto {
  @IsOptional()
  @IsNumber()
  id_manager?: number;

  @IsString()
  @IsNotEmpty()
  title_message!: string;

  @IsString()
  @IsNotEmpty()
  body_message!: string;

  @IsOptional()
  @IsString()
  coordinator_name?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsString()
  @IsNotEmpty()
  end_date!: string;

  @IsString()
  @IsNotEmpty()
  end_time!: string;
}
