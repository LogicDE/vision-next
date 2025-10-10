import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateStateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  id_country!: number;
}
