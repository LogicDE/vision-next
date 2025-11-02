import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(100)
  serviceName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  serviceDesc?: string;
}
