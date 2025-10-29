import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/auditlog.entity';
import { Employee } from '../../entities/employee.entity';
import { Action } from '../../entities/action.entity';
import { Service } from '../../entities/service.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,

    @InjectRepository(Action)
    private readonly actionRepo: Repository<Action>,

    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async log(
    actor: Employee,
    actionName: string,
    objectType: string,
    changeSet: any,
    serviceName?: string,
    ip?: string,
  ): Promise<AuditLog> {
    const action = actionName ? await this.actionRepo.findOne({ where: { action_name: actionName } }) : null;
    const service = serviceName ? await this.serviceRepo.findOne({ where: { service_name: serviceName } }) : null;

    const auditLog = this.auditRepo.create({
      actor,
      action: action || undefined,
      service: service || undefined,
      object_type: objectType,
      change_set: changeSet,
      ip_actor: ip,
    });

    return this.auditRepo.save(auditLog);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditRepo.find({
      relations: ['actor', 'action', 'service'],
      order: { occurred_at: 'DESC' },
    });
  }

  async findByActor(actorId: number): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { actor: { id_employee: actorId } },
      relations: ['actor', 'action', 'service'],
      order: { occurred_at: 'DESC' },
    });
  }

  async findByAction(actionName: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { action: { action_name: actionName } },
      relations: ['actor', 'action', 'service'],
      order: { occurred_at: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return this.auditRepo
      .createQueryBuilder('audit_log')
      .leftJoinAndSelect('audit_log.actor', 'actor')
      .leftJoinAndSelect('audit_log.action', 'action')
      .leftJoinAndSelect('audit_log.service', 'service')
      .where('audit_log.occurred_at BETWEEN :start AND :end', { start: startDate, end: endDate })
      .orderBy('audit_log.occurred_at', 'DESC')
      .getMany();
  }
}
