import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupSnapshotMember } from '../../../entities/group-snapshot-member.entity';

@Injectable()
export class GroupSnapshotMembersService {
  constructor(
    @InjectRepository(GroupSnapshotMember)
    private repo: Repository<GroupSnapshotMember>,
  ) {}

  create(data: Partial<GroupSnapshotMember>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ relations: ['snapshot', 'employee'] });
  }

  async findOne(snapshotId: number, employeeId: number) {
    const entity = await this.repo.findOne({
      where: { snapshotId, employeeId },
      relations: ['snapshot', 'employee'],
    });

    if (!entity) throw new NotFoundException('GroupSnapshotMember no encontrado');
    return entity;
  }

  async remove(snapshotId: number, employeeId: number) {
    const entity = await this.findOne(snapshotId, employeeId);
    await this.repo.remove(entity);
    return { message: 'GroupSnapshotMember eliminado' };
  }
}
