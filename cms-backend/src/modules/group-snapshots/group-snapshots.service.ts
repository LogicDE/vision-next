import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupSnapshot } from '../../entities/group-snapshot.entity';
import { Group } from '../../entities/group.entity';
import { CreateGroupSnapshotDto } from './dto/create-group-snapshot.dto';
import { UpdateGroupSnapshotDto } from './dto/update-group-snapshot.dto';

@Injectable()
export class GroupSnapshotsService {
  constructor(
    @InjectRepository(GroupSnapshot)
    private readonly repo: Repository<GroupSnapshot>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateGroupSnapshotDto) {
    const group = await this.groupRepo.findOneBy({ id: dto.groupId });
    if (!group) throw new NotFoundException('Group no encontrado');

    const snapshot = this.repo.create({
      group,
      windowStart: dto.windowStart ? new Date(dto.windowStart) : undefined,
      windowEnd: dto.windowEnd ? new Date(dto.windowEnd) : undefined,
      jobVersion: dto.jobVersion,
      cohortHash: dto.cohortHash,
    });

    return this.repo.save(snapshot);
  }

  findAll() {
    return this.repo.find({
      relations: ['group', 'members', 'groupMetrics', 'employeeMetrics'],
    });
  }

  async findOne(id: number) {
    const snapshot = await this.repo.findOne({
      where: { id },
      relations: ['group', 'members', 'groupMetrics', 'employeeMetrics'],
    });
    if (!snapshot) throw new NotFoundException('GroupSnapshot no encontrado');
    return snapshot;
  }

  async update(id: number, dto: UpdateGroupSnapshotDto) {
    const snapshot = await this.findOne(id);

    if (dto.groupId !== undefined) {
      const group = await this.groupRepo.findOneBy({ id: dto.groupId });
      if (!group) throw new NotFoundException('Group no encontrado');
      snapshot.group = group;
    }

    if (dto.windowStart !== undefined) snapshot.windowStart = new Date(dto.windowStart);
    if (dto.windowEnd !== undefined) snapshot.windowEnd = new Date(dto.windowEnd);
    if (dto.jobVersion !== undefined) snapshot.jobVersion = dto.jobVersion;
    if (dto.cohortHash !== undefined) snapshot.cohortHash = dto.cohortHash;

    return this.repo.save(snapshot);
  }

  async remove(id: number) {
    const snapshot = await this.findOne(id);
    await this.repo.remove(snapshot);
    return { message: 'GroupSnapshot eliminado' };
  }
}
