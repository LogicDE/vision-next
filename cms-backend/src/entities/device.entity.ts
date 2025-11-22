import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EnterpriseLocation } from './enterprise-location.entity';
import { Employee } from './employee.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn({ name: 'id_device' })
  id!: number;

  @ManyToOne(() => EnterpriseLocation, (l: EnterpriseLocation) => l.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_location' })
  location!: EnterpriseLocation;

  @Column({ length: 100, nullable: true })
  name?: string;

  @Column({ name: 'device_type', length: 50 })
  deviceType!: string;

  @Column({ name: 'status', length: 20, default: 'active' })
  status!: string; // 'active' | 'inactive' | 'removed'

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: Employee;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: Employee;
}
