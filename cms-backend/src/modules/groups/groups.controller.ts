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
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles('admin', 'editor')
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Get()
  @Roles('admin', 'editor', 'viewer')
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  findOne(@Param('id') id: number) {
    return this.groupsService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin', 'editor')
  update(@Param('id') id: number, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: number) {
    return this.groupsService.remove(+id);
  }
}
