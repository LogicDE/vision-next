import { IsString, MaxLength, IsInt } from 'class-validator';

export class CreateAdminSubdivisionDto {
  @IsInt()
  idCountry!: number;

  @IsString()
  @MaxLength(32)
  isoCode!: string;

  @IsString()
  @MaxLength(100)
  name!: string;
}
