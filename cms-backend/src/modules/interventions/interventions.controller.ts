import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('interventions')
@UseGuards(JwtRedisGuard, RolesGuard)
export class InterventionsController {
  constructor(private readonly interService: InterventionsService) {}

  @Post()
  @Roles('admin', 'editor')
  create(@Body() dto: CreateInterventionDto) {
    return this.interService.create(dto);
  }

  @Get()
  @Roles('admin', 'editor', 'viewer')
  findAll() {
    return this.interService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  findOne(@Param('id') id: number) {
    return this.interService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin', 'editor')
  update(@Param('id') id: number, @Body() dto: UpdateInterventionDto) {
    return this.interService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: number) {
    return this.interService.remove(+id);
  }
}
