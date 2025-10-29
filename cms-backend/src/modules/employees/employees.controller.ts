import { Controller, Post, Body, Get, Query, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Request } from 'express';
import { Employee } from '../../entities/employee.entity';

@Controller('employees')
@UseGuards(JwtRedisGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateEmployeeDto, @Req() req: Request) {
    const actor = req.user as Employee;
    return this.employeesService.create(dto, actor, req.ip);
  }

  @Get()
  @Roles('admin', 'editor')
  findAll(@Query() query: any) {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'editor')
  findOne(@Param('id') id: number) {
    return this.employeesService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: number, @Body() dto: UpdateEmployeeDto, @Req() req: Request) {
    const actor = req.user as Employee;
    return this.employeesService.update(+id, dto, actor, req.ip);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: number, @Req() req: Request) {
    const actor = req.user as Employee;
    return this.employeesService.remove(+id, actor, req.ip);
  }

  @Post('seed')
  async seedEmployee(@Body() dto: CreateEmployeeDto) {
    const actor = new Employee();
    actor.id_employee = 1;
    actor.first_name = 'Seeder';
    actor.last_name = 'System';
    actor.email = 'seeder@system.local';
    dto.id_role = dto.id_role ?? 2;
    dto.id_enterprise = dto.id_enterprise ?? 2;

    return this.employeesService.seedEmployee(dto, actor);
  }
}
