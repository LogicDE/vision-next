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

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  occurredAt!: Date;

  @Column({ type: 'inet', nullable: true })
  ipActor?: string;

  @Column({ length: 100, nullable: true })
  objectType?: string;

  @Column({ type: 'jsonb' })
  changeSet!: Record<string, any>;
}
