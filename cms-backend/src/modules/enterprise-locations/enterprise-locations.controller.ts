import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { EnterpriseLocationsService } from './enterprise-locations.service';
import { CreateEnterpriseLocationDto } from './dto/create-enterprise-location.dto';
import { UpdateEnterpriseLocationDto } from './dto/update-enterprise-location.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('enterprise-locations')
@UseGuards(JwtRedisGuard, RolesGuard)
export class EnterpriseLocationsController {
  constructor(private readonly service: EnterpriseLocationsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateEnterpriseLocationDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Manager')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @Roles('Admin')
  update(@Param('id') id: number, @Body() dto: UpdateEnterpriseLocationDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number, @Request() req: any) {
    return this.service.remove(+id, req.user?.sub);
  }
}
