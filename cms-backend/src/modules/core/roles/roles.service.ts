import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../entities/role.entity';
import { Employee } from '../../../entities/employee.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private repo: Repository<Role>,
  ) {}

  create(dto: CreateRoleDto) {
    const role = this.repo.create(dto);
    return this.repo.save(role);
  }

  findAll() {
    return this.repo.find({
      where: { isDeleted: false },
      relations: ['rolePermissions', 'employees'],
    });
  }

  async findOne(id: number) {
    const role = await this.repo.findOne({
      where: { id, isDeleted: false },
      relations: ['rolePermissions', 'employees'],
    });
    if (!role) throw new NotFoundException('Role no encontrado');
    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    Object.assign(role, dto);
    return this.repo.save(role);
  }

  async remove(id: number, deletedBy?: number) {
    const role = await this.findOne(id);
    role.isDeleted = true;
    if (deletedBy) {
      role.deletedBy = { id: deletedBy } as Employee;
    }
    await this.repo.save(role);
    return { message: 'Role eliminado' };
  }
}
