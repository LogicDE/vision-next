import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 56)
  name!: string;
}
