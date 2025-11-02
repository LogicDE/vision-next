import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupEmployeeDto } from './create-group-employee.dto';

export class UpdateGroupEmployeeDto extends PartialType(CreateGroupEmployeeDto) {}

//Irrelevante proximamente se eliminara