import { IsNumber, IsString, Length } from 'class-validator';

export class CreateNeighborhoodDto {
  @IsNumber()
  cityId!: number;

  @IsString()
  @Length(1, 150)
  name!: string;
}
