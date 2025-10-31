import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('role-permissions')
@UseGuards(JwtRedisGuard, RolesGuard)
export class RolePermissionsController {
  constructor(private readonly service: RolePermissionsService) {}

  @Post()
  @Roles('Admin')
  create(@Body() dto: CreateRolePermissionDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('Admin')
  findAll() {
    return this.service.findAll();
  }

  @Get(':roleId/:actionId')
  @Roles('Admin')
  findOne(
    @Param('roleId') roleId: number,
    @Param('actionId') actionId: number,
  ) {
    return this.service.findOne(+roleId, +actionId);
  }

  @Put(':roleId/:actionId')
  @Roles('Admin')
  update(
    @Param('roleId') roleId: number,
    @Param('actionId') actionId: number,
    @Body() dto: UpdateRolePermissionDto,
  ) {
    return this.service.update(+roleId, +actionId, dto);
  }

  @Delete(':roleId/:actionId')
  @Roles('Admin')
  remove(
    @Param('roleId') roleId: number,
    @Param('actionId') actionId: number,
  ) {
    return this.service.remove(+roleId, +actionId);
  }
}
