import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { Employee } from '../../entities/employee.entity';
import { Group } from '../../entities/group.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,

    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateEventDto) {
    const event = this.eventRepo.create({
      title_message: dto.title_message,
      body_message: dto.body_message,
      coordinator_name: dto.coordinator_name,
      start_date: dto.start_date,
      start_time: dto.start_time,
      end_date: dto.end_date,
      end_time: dto.end_time,
    });

    if (dto.id_manager) {
      const manager = await this.empRepo.findOne({ where: { id: dto.id_manager } });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      (event as any).manager = manager;
    }

    if (dto.id_group) {
      const group = await this.groupRepo.findOne({ where: { id_group: dto.id_group } });
      if (!group) throw new NotFoundException('Grupo no encontrado');
      (event as any).group = group;
    }

    return this.eventRepo.save(event);
  }

  async findAll() {
    return this.eventRepo.find({
      relations: ['manager', 'group'],
      order: { id_event: 'ASC' },
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id_event: id },
      relations: ['manager', 'group'],
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    if (dto.id_manager !== undefined) {
      if (dto.id_manager === null) {
        (event as any).manager = null;
      } else {
        const manager = await this.empRepo.findOne({ where: { id: dto.id_manager } });
        if (!manager) throw new NotFoundException('Manager no encontrado');
        (event as any).manager = manager;
      }
    }

    if (dto.id_group !== undefined) {
      if (dto.id_group === null) {
        (event as any).group = null;
      } else {
        const group = await this.groupRepo.findOne({ where: { id_group: dto.id_group } });
        if (!group) throw new NotFoundException('Grupo no encontrado');
        (event as any).group = group;
      }
    }

    Object.assign(event, dto);

    return this.eventRepo.save(event);
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    await this.eventRepo.remove(event);
    return { message: 'Evento eliminado correctamente' };
  }
}
