import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('groups')
@UseGuards(JwtRedisGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly service: GroupsService) {}

  @Post()
  @Roles('Admin', 'Manager')
  create(@Body() dto: CreateGroupDto) {
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
  @Roles('Admin', 'Manager')
  update(@Param('id') id: number, @Body() dto: UpdateGroupDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles('Admin', 'Manager')
  remove(@Param('id') id: number) {
    return this.service.remove(+id);
  }
}
