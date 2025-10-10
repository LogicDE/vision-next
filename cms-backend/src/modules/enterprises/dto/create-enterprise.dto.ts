import { IsEmail, IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateEnterpriseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @Matches(/^\d{9,15}$/, { message: 'El teléfono debe tener entre 9 y 15 dígitos' })
  telephone!: string;

  @IsEmail()
  email!: string;

  @IsInt()
  id_state!: number;
}
