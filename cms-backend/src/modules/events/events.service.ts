import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { Employee } from '../../entities/employee.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,
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
      const manager = await this.empRepo.findOne({ where: { id_employee: dto.id_manager } });
      if (!manager) throw new NotFoundException('Manager no encontrado');
      event.manager = manager;
    }

    return this.eventRepo.save(event);
  }

  async findAll() {
    return this.eventRepo.find({
      relations: ['manager'],
      order: { id_event: 'ASC' },
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id_event: id },
      relations: ['manager'],
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    if (dto.id_manager !== undefined) {
      if (dto.id_manager === null) {
        event.manager = undefined;
      } else {
        const manager = await this.empRepo.findOne({ where: { id_employee: dto.id_manager } });
        if (!manager) throw new NotFoundException('Manager no encontrado');
        event.manager = manager;
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
