import { IsString, IsEmail, Length, IsOptional, IsBoolean } from 'class-validator';

export class CreateEnterpriseDto {
  @IsString()
  @Length(1, 150)
  name!: string;

  @IsString()
  @Length(1, 15)
  telephone!: string;

  @IsEmail()
  @Length(1, 150)
  email!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
