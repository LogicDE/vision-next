import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intervention } from '../../../entities/intervention.entity';
import { Employee } from '../../../entities/employee.entity';
import { Group } from '../../../entities/group.entity';
import { GroupEmployee } from '../../../entities/group-employee.entity';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(
    @InjectRepository(Intervention)
    private repo: Repository<Intervention>,
    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
    @InjectRepository(GroupEmployee)
    private groupEmployeeRepo: Repository<GroupEmployee>,
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
    return this.repo.find({
      where: { isDeleted: false },
      relations: ['group', 'group.manager', 'group.manager.enterprise'],
    });
  }

  async findOne(id: number) {
    const intervention = await this.repo.findOne({
      where: { id, isDeleted: false },
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

  async remove(id: number, deletedBy?: number) {
    const intervention = await this.findOne(id);
    intervention.isDeleted = true;
    if (deletedBy) {
      intervention.deletedBy = { id: deletedBy } as Employee;
    }
    await this.repo.save(intervention);
    return { message: 'Intervention eliminada' };
  }

  async getAssignedForEmployee(employeeId: number, page = 1, limit = 10) {
    const memberships = await this.groupEmployeeRepo.find({
      where: { employeeId },
    });
    const groupIds = memberships.map((m) => m.groupId);
    if (groupIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
      };
    }

    const baseQuery = this.repo
      .createQueryBuilder('intervention')
      .leftJoinAndSelect('intervention.group', 'group')
      .where('intervention.group IN (:...groupIds)', { groupIds })
      .andWhere('intervention.isDeleted = false');

    const total = await baseQuery.clone().getCount();
    const items = await baseQuery
      .orderBy('intervention.titleMessage', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items,
      total,
      page,
      limit,
    };
  }
}
