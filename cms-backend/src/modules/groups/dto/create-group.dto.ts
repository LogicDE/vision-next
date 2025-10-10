import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  id_manager?: number;
}
