import { IsNumber } from 'class-validator';

export class CreateRolePermissionDto {
  @IsNumber()
  roleId!: number;

  @IsNumber()
  actionId!: number;
}
