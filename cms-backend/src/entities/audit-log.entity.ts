import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Action } from './action.entity';
import { Service } from './service.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ name: 'id_event_log' })
  id!: number;

  @ManyToOne(() => Employee, (e) => e.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_actor' })
  actor?: Employee;

  @ManyToOne(() => Action, (a) => a.auditLogs)
  @JoinColumn({ name: 'id_action' })
  action?: Action;

  @ManyToOne(() => Service, (s) => s.auditLogs)
  @JoinColumn({ name: 'id_service' })
  service?: Service;

  @Column({ name: 'occurred_at', type: 'timestamptz', default: () => 'NOW()' })
  occurredAt!: Date;

  @Column({ name: 'ip_actor', type: 'inet', nullable: true })
  ipActor?: string;

  @Column({ name: 'object_type', length: 100, nullable: true })
  objectType?: string;

  @Column({ name: 'change_set', type: 'jsonb' })
  changeSet!: Record<string, any>;
}
