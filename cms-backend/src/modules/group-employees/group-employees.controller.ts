import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { GroupEmployeesService } from './group-employees.service';
import { CreateGroupEmployeeDto } from './dto/create-group-employee.dto';
import { UpdateGroupEmployeeDto } from './dto/update-group-employee.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('group-employees')
@UseGuards(JwtRedisGuard, RolesGuard)
export class GroupEmployeesController {
  constructor(private readonly service: GroupEmployeesService) {}

  @Post()
  @Roles('Admin', 'Manager')
  create(@Body() dto: CreateGroupEmployeeDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.service.findAll();
  }

  @Get(':groupId/:employeeId')
  @Roles('Admin', 'Manager')
  findOne(
    @Param('groupId') groupId: number,
    @Param('employeeId') employeeId: number,
  ) {
    return this.service.findOne(+groupId, +employeeId);
  }

  @Put(':groupId/:employeeId')
  @Roles('Admin')
  update(
    @Param('groupId') groupId: number,
    @Param('employeeId') employeeId: number,
    @Body() dto: UpdateGroupEmployeeDto,
  ) {
    return this.service.update(+groupId, +employeeId, dto);
  }

  @Delete(':groupId/:employeeId')
  @Roles('Admin')
  remove(
    @Param('groupId') groupId: number,
    @Param('employeeId') employeeId: number,
  ) {
    return this.service.remove(+groupId, +employeeId);
  }
}
