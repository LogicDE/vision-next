import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDeviceDto {
  @IsNumber()
  idLocation!: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  deviceType!: string;
}
