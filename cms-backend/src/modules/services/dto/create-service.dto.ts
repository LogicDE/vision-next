import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  service_name!: string;

  @IsOptional()
  @IsString()
  service_desc?: string;
}
