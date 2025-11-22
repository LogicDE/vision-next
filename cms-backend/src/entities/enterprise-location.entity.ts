import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Enterprise } from './enterprise.entity';
import { Address } from './address.entity';
import { Device } from './device.entity';
import { Employee } from './employee.entity';

@Entity('enterprise_locations')
export class EnterpriseLocation {
  @PrimaryGeneratedColumn({ name: 'id_location' })
  id!: number;

  @ManyToOne(() => Enterprise, (e: Enterprise) => e.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_enterprise' })
  enterprise!: Enterprise;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_address' })
  address!: Address;

  @Column({ name: 'location_name', length: 100 })
  locationName!: string;

  @Column({ default: true })
  active!: boolean;

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

  @OneToMany(() => Device, (d: Device) => d.location)
  devices!: Device[];
}
