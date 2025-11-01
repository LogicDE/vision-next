import { IsNumber } from 'class-validator';

export class CreateGroupEmployeeDto {
  @IsNumber()
  groupId!: number;

  @IsNumber()
  employeeId!: number;
}
