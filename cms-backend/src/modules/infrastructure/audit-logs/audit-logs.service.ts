import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  create(dto: CreateAuditLogDto) {
    const auditLog = this.auditLogRepo.create({
      ...dto,
      actor: dto.idActor ? { id: dto.idActor } : undefined,
      action: dto.idAction ? { id: dto.idAction } : undefined,
      service: dto.idService ? { id: dto.idService } : undefined,
    });
    return this.auditLogRepo.save(auditLog);
  }

  findAll() {
    return this.auditLogRepo.find({ relations: ['actor', 'action', 'service'] });
  }

  async findOne(id: number) {
    const log = await this.auditLogRepo.findOne({
      where: { id },
      relations: ['actor', 'action', 'service'],
    });
    if (!log) throw new NotFoundException('AuditLog no encontrado');
    return log;
  }

  async update(id: number, dto: UpdateAuditLogDto) {
    await this.auditLogRepo.update(id, {
      ...dto,
      actor: dto.idActor ? { id: dto.idActor } : undefined,
      action: dto.idAction ? { id: dto.idAction } : undefined,
      service: dto.idService ? { id: dto.idService } : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.auditLogRepo.delete(id);
    return { message: 'AuditLog eliminado' };
  }
}
