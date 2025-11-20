import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EnterpriseLocation } from './enterprise-location.entity';

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

  @Column({ name: 'registered_at', type: 'timestamptz', default: () => 'NOW()' })
  registeredAt!: Date;
}
