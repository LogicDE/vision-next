import { IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @Length(2, 5)
  isoCode!: string;

  @IsString()
  @Length(1, 100)
  name!: string;
}
