import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn({ name: 'id_service' })
  id!: number;

  @Column({ name: 'service_name', length: 100 })
  serviceName!: string;

  @Column({ name: 'service_desc', length: 255, nullable: true })
  serviceDesc?: string;

  @OneToMany(() => AuditLog, (log: AuditLog) => log.service)
  auditLogs!: AuditLog[];
}
