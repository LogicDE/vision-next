import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Intervention } from '../../entities/intervention.entity';
import { Employee } from '../../entities/employee.entity';
import { Group } from '../../entities/group.entity';
import { Repository } from 'typeorm';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(
    @InjectRepository(Intervention)
    private readonly interRepo: Repository<Intervention>,

    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,

    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateInterventionDto) {
    const intervention = this.interRepo.create({
      type: dto.type,
      description: dto.description,
      title_message: dto.title_message,
      body_message: dto.body_message,
    });

    if (dto.id_manager) {
      const manager = await this.empRepo.findOne({ where: { id: dto.id_manager } });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      (intervention as any).manager = manager;
    }

    if (dto.id_group) {
      const group = await this.groupRepo.findOne({ where: { id_group: dto.id_group } });
      if (!group) throw new NotFoundException('Grupo no encontrado');
      (intervention as any).group = group;
    }

    return this.interRepo.save(intervention);
  }

  async findAll() {
    return this.interRepo.find({
      relations: ['manager', 'group'],
      order: { id_inter: 'ASC' },
    });
  }

  async findOne(id: number) {
    const inter = await this.interRepo.findOne({
      where: { id_inter: id },
      relations: ['manager', 'group'],
    });
    if (!inter) throw new NotFoundException('Intervención no encontrada');
    return inter;
  }

  async update(id: number, dto: UpdateInterventionDto) {
    const inter = await this.findOne(id);

    if (dto.id_manager !== undefined) {
      if (dto.id_manager === null) {
        (inter as any).manager = null;
      } else {
        const manager = await this.empRepo.findOne({ where: { id: dto.id_manager } });
        if (!manager) throw new NotFoundException('Manager no encontrado');
        (inter as any).manager = manager;
      }
    }

    if (dto.id_group !== undefined) {
      if (dto.id_group === null) {
        (inter as any).group = null;
      } else {
        const group = await this.groupRepo.findOne({ where: { id_group: dto.id_group } });
        if (!group) throw new NotFoundException('Grupo no encontrado');
        (inter as any).group = group;
      }
    }

    Object.assign(inter, dto);
    return this.interRepo.save(inter);
  }

  async remove(id: number) {
    const inter = await this.findOne(id);
    await this.interRepo.remove(inter);
    return { message: 'Intervención eliminada correctamente' };
  }
}
