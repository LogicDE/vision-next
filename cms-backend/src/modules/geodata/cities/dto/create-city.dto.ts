import { IsString, MaxLength, IsInt } from 'class-validator';

export class CreateCityDto {
  @IsInt()
  idArea!: number;

  @IsString()
  @MaxLength(120)
  name!: string;
}
