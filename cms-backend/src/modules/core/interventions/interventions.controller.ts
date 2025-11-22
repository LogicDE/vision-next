import { BadRequestException, Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Request, Query, Logger } from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { JwtRedisGuard } from '../../../auth/jwt-redis.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

@Controller('interventions')
@UseGuards(JwtRedisGuard, RolesGuard)
export class InterventionsController {
  private readonly logger = new Logger(InterventionsController.name);
  constructor(private readonly service: InterventionsService) {}

  @Post()
  @Roles('Admin', 'Manager')
  create(@Body() dto: CreateInterventionDto) {
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
    this.logger.debug(`Employee ${employeeId} requested interventions page=${page} limit=${limit}`);
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
  update(@Param('id') id: number, @Body() dto: UpdateInterventionDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Manager')
  remove(@Param('id') id: number, @Request() req: any) {
    return this.service.remove(+id, req.user?.sub);
  }
}
