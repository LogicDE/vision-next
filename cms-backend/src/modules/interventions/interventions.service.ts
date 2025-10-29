import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intervention } from '../../entities/intervention.entity';
import { Employee } from '../../entities/employee.entity';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';

@Injectable()
export class InterventionsService {
  constructor(
    @InjectRepository(Intervention)
    private readonly interRepo: Repository<Intervention>,

    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateInterventionDto) {
    const intervention = this.interRepo.create({
      type: dto.type,
      title: dto.title,
      description: dto.description,
    });

    if (dto.id_manager) {
      const manager = await this.empRepo.findOne({ where: { id_employee: dto.id_manager } });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      intervention.manager = manager;
    }

    return this.interRepo.save(intervention);
  }

  async findAll() {
    return this.interRepo.find({
      relations: ['manager', 'employee', 'alert'],
      order: { id_intervention: 'ASC' },
    });
  }

  async findOne(id: number) {
    const inter = await this.interRepo.findOne({
      where: { id_intervention: id },
      relations: ['manager', 'employee', 'alert'],
    });
    if (!inter) throw new NotFoundException('Intervención no encontrada');
    return inter;
  }

  async update(id: number, dto: UpdateInterventionDto) {
    const inter = await this.findOne(id);

    if (dto.id_manager !== undefined) {
      if (dto.id_manager === null) {
        inter.manager = undefined;
      } else {
        const manager = await this.empRepo.findOne({ where: { id_employee: dto.id_manager } });
        if (!manager) throw new NotFoundException('Manager no encontrado');
        inter.manager = manager;
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

  async assignToEmployee(employeeId: number, title: string, type = 'Automática', description?: string) {
  const employee = await this.empRepo.findOne({ where: { id_employee: employeeId } });
  if (!employee) throw new NotFoundException('Empleado no encontrado');

  const intervention = this.interRepo.create({
    type,
    title,
    description,
    employee,
  });

  return this.interRepo.save(intervention);
}
}
