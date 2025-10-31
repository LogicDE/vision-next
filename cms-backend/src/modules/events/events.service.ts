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
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(dto: CreateEventDto) {
    // Buscar manager solo si managerId está definido
    const manager =
      dto.managerId
        ? (await this.employeeRepo.findOne({ where: { id: dto.managerId } })) ?? undefined
        : undefined;

    const event = this.eventRepo.create({
      ...dto,
      manager,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: new Date(dto.endAt),
    });

    return this.eventRepo.save(event);
  }

  findAll() {
    return this.eventRepo.find({ relations: ['manager'] });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!event) throw new NotFoundException('Event no encontrado');
    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    // Actualizar manager solo si managerId fue proporcionado
    if (dto.managerId !== undefined) {
      const manager =
        dto.managerId
          ? (await this.employeeRepo.findOne({ where: { id: dto.managerId } })) ?? undefined
          : undefined;
      event.manager = manager;
    }

    // Actualizar fechas opcionales correctamente
    if (dto.startAt !== undefined) {
      event.startAt = dto.startAt ? new Date(dto.startAt) : undefined;
    }
    if (dto.endAt !== undefined) {
      event.endAt = new Date(dto.endAt);
    }

    // Asignar resto de campos
    Object.assign(event, {
      titleMessage: dto.titleMessage ?? event.titleMessage,
      bodyMessage: dto.bodyMessage ?? event.bodyMessage,
      coordinatorName: dto.coordinatorName ?? event.coordinatorName,
    });

    return this.eventRepo.save(event);
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    await this.eventRepo.remove(event);
    return { message: 'Event eliminado' };
  }
}
