import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Enterprise } from './enterprise.entity';
import { Address } from './address.entity';
import { Device } from './device.entity';

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

  @OneToMany(() => Device, (d: Device) => d.location)
  devices!: Device[];
}
