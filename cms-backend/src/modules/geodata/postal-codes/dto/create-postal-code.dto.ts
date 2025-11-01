import { IsNumber, IsString, Length } from 'class-validator';

export class CreatePostalCodeDto {
  @IsNumber()
  countryId!: number;

  @IsString()
  @Length(1, 15)
  code!: string;
}
