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
    actionName: string,        // Ej: 'CREATE', 'UPDATE', 'DELETE'
    objectType: string,        // Ej: 'Employee'
    changeSet: any,
    serviceName?: string,      // Ej: 'EmployeesService'
    ip?: string,
  ): Promise<AuditLog> {
    // Buscar acción y servicio por nombre
    const action = await this.actionRepo.findOne({ 
      where: { action_name: actionName } 
    });
    
    const service = serviceName
      ? await this.serviceRepo.findOne({ 
          where: { service_name: serviceName } 
        })
      : null;

    // Construir el objeto values dinámicamente (sin nulls)
    const values: any = {
      object_type: objectType,
      change_set: changeSet,
      occurred_at: new Date(),
    };

    // Solo agregar las relaciones si existen (evita nulls)
    if (actor?.id) {
      values.actor = { id: actor.id };
    }

    if (action?.id_action) {
      values.action = { id_action: action.id_action };
    }

    if (service?.id_service) {
      values.service = { id_service: service.id_service };
    }

    if (ip) {
      values.ip_actor = ip;
    }

    // Insertar usando QueryBuilder
    const insertResult = await this.auditRepo
      .createQueryBuilder()
      .insert()
      .into(AuditLog)
      .values(values)
      .execute();

    // Obtener el log creado con sus relaciones
    const logId = insertResult.identifiers[0].id_event_log;
    const savedLog = await this.auditRepo.findOne({
      where: { id_event_log: logId },
      relations: ['actor', 'action', 'service'],
    });

    return savedLog!;
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditRepo.find({
      relations: ['actor', 'action', 'service'],
      order: { occurred_at: 'DESC' },
    });
  }

  async findByActor(actorId: number): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { actor: { id: actorId } },
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
      .where('audit_log.occurred_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('audit_log.occurred_at', 'DESC')
      .getMany();
  }
}