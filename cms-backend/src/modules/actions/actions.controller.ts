import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('actions')
@UseGuards(JwtRedisGuard, RolesGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateActionDto) {
    return this.actionsService.create(dto);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.actionsService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Manager')
  findOne(@Param('id') id: number) {
    return this.actionsService.findOne(+id);
  }

  @Put(':id')
  @Roles('Admin')
  update(@Param('id') id: number, @Body() dto: UpdateActionDto) {
    return this.actionsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(@Param('id') id: number) {
    return this.actionsService.remove(+id);
  }
}
