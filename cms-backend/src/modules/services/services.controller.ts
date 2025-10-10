import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('services')
@UseGuards(JwtRedisGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'manager')
  findOne(@Param('id') id: number) {
    return this.servicesService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: number, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: number) {
    return this.servicesService.remove(+id);
  }
}
