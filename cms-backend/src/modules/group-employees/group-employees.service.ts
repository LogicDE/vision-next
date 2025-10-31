import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEmployee } from '../../entities/group-employee.entity';
import { CreateGroupEmployeeDto } from './dto/create-group-employee.dto';
import { UpdateGroupEmployeeDto } from './dto/update-group-employee.dto';

@Injectable()
export class GroupEmployeesService {
  constructor(
    @InjectRepository(GroupEmployee)
    private readonly geRepo: Repository<GroupEmployee>,
  ) {}

  create(dto: CreateGroupEmployeeDto) {
    const relation = this.geRepo.create(dto);
    return this.geRepo.save(relation);
  }

  findAll() {
    return this.geRepo.find({ relations: ['group', 'employee'] });
  }

  async findOne(groupId: number, employeeId: number) {
    const relation = await this.geRepo.findOne({
      where: { groupId, employeeId },
      relations: ['group', 'employee'],
    });

    if (!relation) throw new NotFoundException('Relación Group-Employee no encontrada');

    return relation;
  }

  async update(groupId: number, employeeId: number, dto: UpdateGroupEmployeeDto) {
    const relation = await this.findOne(groupId, employeeId);
    Object.assign(relation, dto);
    return this.geRepo.save(relation);
  }

  async remove(groupId: number, employeeId: number) {
    const relation = await this.findOne(groupId, employeeId);
    await this.geRepo.remove(relation);
    return { message: 'Relación eliminada' };
  }
}
