import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateActionDto {
  @IsString()
  @MaxLength(100)
  actionName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  actionDesc?: string;
}
