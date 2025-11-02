import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../../../entities/group.entity';
import { Employee } from '../../../entities/employee.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateGroupDto) {
    const manager = await this.employeeRepo.findOneBy({ id: dto.managerId });
    if (!manager) throw new NotFoundException('Manager no encontrado');

    const group = this.groupRepo.create({
      name: dto.name,
      manager,
    });

    return this.groupRepo.save(group);
  }

  findAll() {
    return this.groupRepo.find({
      relations: ['manager', 'members', 'snapshots', 'surveys', 'questions'],
    });
  }

  async findOne(id: number) {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['manager', 'members', 'snapshots', 'surveys', 'questions'],
    });
    if (!group) throw new NotFoundException('Group no encontrado');
    return group;
  }

  async update(id: number, dto: UpdateGroupDto) {
    const group = await this.findOne(id);

    if (dto.managerId !== undefined) {
      const manager = await this.employeeRepo.findOneBy({ id: dto.managerId });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      group.manager = manager;
    }

    if (dto.name !== undefined) group.name = dto.name;

    return this.groupRepo.save(group);
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    await this.groupRepo.remove(group);
    return { message: 'Group eliminado' };
  }
}
