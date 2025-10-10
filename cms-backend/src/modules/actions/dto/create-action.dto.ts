import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateActionDto {
  @IsString()
  @IsNotEmpty()
  action_name!: string;

  @IsOptional()
  @IsString()
  action_desc?: string;
}
