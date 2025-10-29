// device.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Enterprise } from './enterprise.entity';

@Entity({ name: 'devices' })
export class Device {
  @PrimaryGeneratedColumn({ name: 'id_device' })
  id_device!: number;

  @Column({ name: 'device_type', type: 'varchar', length: 50 })
  deviceType!: string;

  @CreateDateColumn({ name: 'registration_date', type: 'timestamptz' })
  registrationDate!: Date;

  @ManyToOne(() => Enterprise, (enterprise) => enterprise.devices, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'id_enterprise' })
  empresa!: Enterprise;
}