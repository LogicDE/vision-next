import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intervention } from '../../../entities/intervention.entity';
import { Employee } from '../../../entities/employee.entity';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(
    @InjectRepository(Intervention)
    private repo: Repository<Intervention>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateInterventionDto) {
    let manager;
    if (dto.managerId) {
      manager = await this.employeeRepo.findOneBy({ id: dto.managerId });
      if (!manager) throw new NotFoundException('Manager no encontrado');
    }

    const intervention = this.repo.create({
      manager,
      type: dto.type,
      description: dto.description,
      titleMessage: dto.titleMessage,
      bodyMessage: dto.bodyMessage,
    });

    return this.repo.save(intervention);
  }

  findAll() {
    return this.repo.find({ relations: ['manager'] });
  }

  async findOne(id: number) {
    const intervention = await this.repo.findOne({
      where: { id },
      relations: ['manager'],
    });
    if (!intervention) throw new NotFoundException('Intervention no encontrado');
    return intervention;
  }

  async update(id: number, dto: UpdateInterventionDto) {
    const intervention = await this.findOne(id);

    if (dto.managerId !== undefined) {
      const manager = await this.employeeRepo.findOneBy({ id: dto.managerId });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      intervention.manager = manager;
    }

    if (dto.type !== undefined) intervention.type = dto.type;
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
