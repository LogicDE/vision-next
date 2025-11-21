import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../../entities/event.entity';
import { Group } from '../../../entities/group.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateEventDto) {
    const group = await this.groupRepo.findOne({ where: { id: dto.groupId } });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const event = this.eventRepo.create({
      ...dto,
      group,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: new Date(dto.endAt),
    });

    return this.eventRepo.save(event);
  }

  findAll() {
    return this.eventRepo.find({
      relations: ['group', 'group.manager', 'group.manager.enterprise'],
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['group', 'group.manager', 'group.manager.enterprise'],
    });

    if (!event) throw new NotFoundException('Event no encontrado');
    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);

    if (dto.groupId !== undefined) {
      const group = await this.groupRepo.findOne({ where: { id: dto.groupId } });
      if (!group) throw new NotFoundException('Grupo no encontrado');
      event.group = group;
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
