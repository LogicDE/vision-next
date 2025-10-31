import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateEmployeeDto {
  @IsNumber()
  idEnterprise!: number;

  @IsNumber()
  idRole!: number;

  @IsOptional()
  @IsNumber()
  idManager?: number;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  username!: string;

  @IsString()
  passwordHash!: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
