import { IsString, MaxLength, IsInt } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MaxLength(10)
  streetNumber!: string;

  @IsString()
  @MaxLength(100)
  streetName!: string;

  @IsInt()
  idPostalCode!: number;

  @IsInt()
  idNeighborhood!: number;
}
