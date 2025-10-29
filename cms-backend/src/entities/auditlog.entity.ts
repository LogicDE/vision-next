import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Action } from './action.entity';
import { Service } from './service.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn({ name: 'id_event_log' })
  id_event_log!: number;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'id_actor' })
  actor?: Employee; // Quién realizó la acción

  @ManyToOne(() => Action, { nullable: true })
  @JoinColumn({ name: 'id_action' })
  action?: Action; // Qué acción se realizó

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'id_service' })
  service?: Service; // En qué servicio/módulo ocurrió

  @Column({ name: 'object_type', type: 'varchar', length: 100, nullable: true })
  object_type?: string; // Tipo de entidad afectada: Employee, Group, Metric, etc.

  @Column({ name: 'change_set', type: 'jsonb', nullable: false })
  change_set!: any; // Cambios realizados en la acción

  @Column({ name: 'ip_actor', type: 'inet', nullable: true })
  ip_actor?: string; // IP de quien ejecutó

  @CreateDateColumn({ name: 'occurred_at' })
  occurred_at!: Date; // Fecha/hora del evento
}
