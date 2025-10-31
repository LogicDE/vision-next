import { IsString, IsNumber, Length } from 'class-validator';

export class CreateGroupDto {
  @IsNumber()
  managerId!: number;

  @IsString()
  @Length(1, 100)
  name!: string;
}
