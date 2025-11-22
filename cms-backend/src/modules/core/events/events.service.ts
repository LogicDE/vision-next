import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../../entities/event.entity';
import { Employee } from '../../../entities/employee.entity';
import { Group } from '../../../entities/group.entity';
import { GroupEmployee } from '../../../entities/group-employee.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(GroupEmployee)
    private readonly groupEmployeeRepo: Repository<GroupEmployee>,
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
      where: { isDeleted: false },
      relations: ['group', 'group.manager', 'group.manager.enterprise'],
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id, isDeleted: false },
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

  async remove(id: number, deletedBy?: number) {
    const event = await this.findOne(id);
    event.isDeleted = true;
    if (deletedBy) {
      event.deletedBy = { id: deletedBy } as Employee;
    }
    await this.eventRepo.save(event);
    return { message: 'Event eliminado' };
  }

  async getAssignedForEmployee(employeeId: number, page = 1, limit = 10) {
    this.logger.debug(`Fetching events for employee ${employeeId} page=${page} limit=${limit}`);
    const memberships = await this.groupEmployeeRepo.find({
      where: { employeeId },
    });
    const groupIds = memberships.map((m) => m.groupId);
    this.logger.debug(`Employee ${employeeId} belongs to groups ${JSON.stringify(groupIds)}`);
    if (groupIds.length === 0) {
      this.logger.debug(`Employee ${employeeId} has no groups, returning empty`);
      return {
        items: [],
        total: 0,
        page,
        limit,
      };
    }

    const baseQuery = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.group', 'group')
      .where('event.group IN (:...groupIds)', { groupIds })
      .andWhere('event.isDeleted = false');

    const total = await baseQuery.clone().getCount();
    const items = await baseQuery
      .orderBy('event.startAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    this.logger.debug(
      `Employee ${employeeId} events loaded count=${items.length} total=${total}`
    );

    return {
      items,
      total,
      page,
      limit,
    };
  }
}
