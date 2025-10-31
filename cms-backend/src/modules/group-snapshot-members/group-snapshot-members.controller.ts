import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { GroupSnapshotMembersService } from './group-snapshot-members.service';
import { JwtRedisGuard } from '../../auth/jwt-redis.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@Controller('group-snapshot-members')
@UseGuards(JwtRedisGuard, RolesGuard)
export class GroupSnapshotMembersController {
  constructor(private readonly service: GroupSnapshotMembersService) {}

  @Post()
  @Roles('Admin', 'Manager')
  create(@Body() data: Partial<any>) {
    return this.service.create(data);
  }

  @Get()
  @Roles('Admin', 'Manager')
  findAll() {
    return this.service.findAll();
  }

  @Get(':snapshotId/:employeeId')
  @Roles('Admin', 'Manager')
  findOne(
    @Param('snapshotId') snapshotId: number,
    @Param('employeeId') employeeId: number,
  ) {
    return this.service.findOne(+snapshotId, +employeeId);
  }

  @Delete(':snapshotId/:employeeId')
  @Roles('Admin', 'Manager')
  remove(
    @Param('snapshotId') snapshotId: number,
    @Param('employeeId') employeeId: number,
  ) {
    return this.service.remove(+snapshotId, +employeeId);
  }
}
