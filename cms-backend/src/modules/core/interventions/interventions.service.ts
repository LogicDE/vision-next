import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intervention } from '../../../entities/intervention.entity';
import { Group } from '../../../entities/group.entity';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(
    @InjectRepository(Intervention)
    private repo: Repository<Intervention>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateInterventionDto) {
    const group = await this.groupRepo.findOneBy({ id: dto.groupId });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const intervention = this.repo.create({
      group,
      description: dto.description,
      titleMessage: dto.titleMessage,
      bodyMessage: dto.bodyMessage,
    });

    return this.repo.save(intervention);
  }

  findAll() {
    return this.repo.find({ relations: ['group', 'group.manager', 'group.manager.enterprise'] });
  }

  async findOne(id: number) {
    const intervention = await this.repo.findOne({
      where: { id },
      relations: ['group', 'group.manager', 'group.manager.enterprise'],
    });
    if (!intervention) throw new NotFoundException('Intervention no encontrado');
    return intervention;
  }

  async update(id: number, dto: UpdateInterventionDto) {
    const intervention = await this.findOne(id);

    if (dto.groupId !== undefined) {
      const group = await this.groupRepo.findOneBy({ id: dto.groupId });
      if (!group) throw new NotFoundException('Grupo no encontrado');
      intervention.group = group;
    }

    if (dto.description !== undefined) intervention.description = dto.description;
    if (dto.titleMessage !== undefined) intervention.titleMessage = dto.titleMessage;
    if (dto.bodyMessage !== undefined) intervention.bodyMessage = dto.bodyMessage;

    return this.repo.save(intervention);
  }

  async remove(id: number) {
    const intervention = await this.findOne(id);
    await this.repo.remove(intervention);
    return { message: 'Intervention eliminada' };
  }
}
