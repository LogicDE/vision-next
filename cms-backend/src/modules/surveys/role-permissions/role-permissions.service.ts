import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../../../entities/role-permission.entity';
import { Role } from '../../../entities/role.entity';
import { Action } from '../../../entities/action.entity';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private repo: Repository<RolePermission>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Action)
    private actionRepo: Repository<Action>,
  ) {}

  async create(dto: CreateRolePermissionDto) {
    const role = await this.roleRepo.findOneBy({ id: dto.roleId });
    if (!role) throw new NotFoundException('Role no encontrado');

    const action = await this.actionRepo.findOneBy({ id: dto.actionId });
    if (!action) throw new NotFoundException('Action no encontrada');

    const permission = this.repo.create({ role, action });
    return this.repo.save(permission);
  }

  findAll() {
    return this.repo.find({ relations: ['role', 'action'] });
  }

  async findOne(roleId: number, actionId: number) {
    const permission = await this.repo.findOne({
      where: { roleId, actionId },
      relations: ['role', 'action'],
    });
    if (!permission) throw new NotFoundException('RolePermission no encontrada');
    return permission;
  }

  async update(roleId: number, actionId: number, dto: UpdateRolePermissionDto) {
    const permission = await this.findOne(roleId, actionId);

    if (dto.roleId !== undefined) {
      const role = await this.roleRepo.findOneBy({ id: dto.roleId });
      if (!role) throw new NotFoundException('Role no encontrado');
      permission.role = role;
      permission.roleId = dto.roleId;
    }

    if (dto.actionId !== undefined) {
      const action = await this.actionRepo.findOneBy({ id: dto.actionId });
      if (!action) throw new NotFoundException('Action no encontrada');
      permission.action = action;
      permission.actionId = dto.actionId;
    }

    return this.repo.save(permission);
  }

  async remove(roleId: number, actionId: number) {
    const permission = await this.findOne(roleId, actionId);
    await this.repo.remove(permission);
    return { message: 'RolePermission eliminada' };
  }
}
