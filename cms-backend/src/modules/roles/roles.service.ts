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

    const r = this.rolRepo.create(dto);
    return this.rolRepo.save(r);
  }

  findAll() {
    return this.rolRepo.find({ relations: ['empleados'] });
  }

  async findOne(id: number) {
    const r = await this.rolRepo.findOne({ where: { id }, relations: ['empleados'] });
    if (!r) throw new NotFoundException('Rol no encontrado');
    return r;
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id); 
    await this.rolRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.rolRepo.delete(id);
    return { message: 'Rol eliminado' };
  }
}
