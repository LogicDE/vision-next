import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../auth/auth.module';
import { RolePermission } from '../../../entities/role-permission.entity';
import { Role } from '../../../entities/role.entity';
import { Action } from '../../../entities/action.entity';
import { RolePermissionsService } from './role-permissions.service';
import { RolePermissionsController } from './role-permissions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolePermission, Role, Action]),
    AuthModule,
  ],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
  exports: [RolePermissionsService],
})
export class RolePermissionsModule {}
