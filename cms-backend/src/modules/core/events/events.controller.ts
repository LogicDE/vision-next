import { BadRequestException, Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('events')
@UseGuards(JwtRedisGuard, RolesGuard)
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  @Roles('Admin', 'Manager')
  create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.service.findAll();
  }

  @Get('me')
  @Roles('Admin', 'Manager', 'Employee')
  getAssigned(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const employeeId = req.user?.sub;
    if (!employeeId) {
      throw new BadRequestException('Empleado no identificado');
    }
    return this.service.getAssignedForEmployee(employeeId, Number(page), Number(limit));
  }

  @Get(':id')
  @Roles('Admin', 'Manager')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Roles('Admin', 'Manager')
  update(@Param('id') id: number, @Body() dto: UpdateEventDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number, @Request() req: any) {
    return this.service.remove(+id, req.user?.sub);
  }
}
