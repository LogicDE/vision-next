import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol } from '../../entities/rol.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,
  ) {}

  async create(dto: CreateRoleDto) {
    const existing = await this.rolRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new BadRequestException('El rol ya existe');

    const role = this.rolRepo.create(dto);
    return this.rolRepo.save(role);
  }

  findAll() {
    return this.rolRepo.find({ relations: ['employees'] }); // corregido
  }

  async findOne(id: number) {
    const role = await this.rolRepo.findOne({ where: { id_role: id }, relations: ['employees'] }); // corregido
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    Object.assign(role, dto); // más seguro que update()
    return this.rolRepo.save(role);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    await this.rolRepo.remove(role);
    return { message: 'Rol eliminado' };
  }
}
