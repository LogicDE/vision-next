import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Action } from './action.entity';
import { Service } from './service.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn({ name: 'id_event_log' })
  id_event_log!: number;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'id_actor' })
  actor?: Employee;

  @ManyToOne(() => Action, { nullable: true })
  @JoinColumn({ name: 'id_action' })
  action?: Action;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'id_service' })
  service?: Service;

  @Column({ name: 'object_type', type: 'varchar', length: 100, nullable: true })
  object_type?: string;

  @Column({ name: 'change_set', type: 'jsonb', nullable: false })
  change_set!: any;

  @Column({ name: 'ip_actor', type: 'inet', nullable: true })
  ip_actor?: string;

  @Column({ name: 'occurred_at', type: 'timestamptz', default: () => 'NOW()' })
  occurred_at!: Date;
}
