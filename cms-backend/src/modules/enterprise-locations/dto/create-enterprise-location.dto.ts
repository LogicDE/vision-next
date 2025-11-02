import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateEnterpriseLocationDto {
  @IsNumber()
  idEnterprise!: number;

  @IsNumber()
  idAddress!: number;

  @IsString()
  locationName!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
