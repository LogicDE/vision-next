import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateEmployeeDto {
  @IsString() @IsNotEmpty()
  first_name!: string;

  @IsString() @IsNotEmpty()
  last_name!: string;

  @IsEmail()
  email!: string;

  @IsString() @IsNotEmpty()
  username?: string;

  @IsString() @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsNumber()
  id_role!: number;

  @IsNumber()
  id_enterprise!: number;

  @IsOptional()
  @IsNumber()
  manager_id?: number;
}
