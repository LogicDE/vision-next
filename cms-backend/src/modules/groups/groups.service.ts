import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../../entities/group.entity';
import { Employee } from '../../entities/employee.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateGroupDto) {
    const group = this.groupRepo.create({ name: dto.name });

    if (dto.id_manager) {
      const manager = await this.empRepo.findOne({ where: { id: dto.id_manager } });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      (group as any).manager = manager;
    }

    return this.groupRepo.save(group);
  }

  async findAll() {
    return this.groupRepo.find({
      relations: ['manager', 'members', 'dailyMetrics', 'surveys'],
      order: { id_group: 'ASC' },
    });
  }

  async findOne(id: number) {
    const group = await this.groupRepo.findOne({
      where: { id_group: id },
      relations: ['manager', 'members', 'dailyMetrics', 'surveys'],
    });
    if (!group) throw new NotFoundException('Grupo no encontrado');
    return group;
  }

  async update(id: number, dto: UpdateGroupDto) {
    const group = await this.findOne(id);

    if (dto.id_manager !== undefined) {
      if (dto.id_manager === null) {
        (group as any).manager = null;
      } else {
        const manager = await this.empRepo.findOne({ where: { id: dto.id_manager } });
        if (!manager) throw new NotFoundException('Manager no encontrado');
        (group as any).manager = manager;
      }
    }

    if (dto.name) group.name = dto.name;

    return this.groupRepo.save(group);
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    await this.groupRepo.remove(group);
    return { message: 'Grupo eliminado correctamente' };
  }
}
