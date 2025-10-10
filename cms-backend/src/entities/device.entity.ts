import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Empresa } from './empresa.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn({ name: 'id_device' })
  id!: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.devices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_enterprise' })
  empresa!: Empresa;

  @Column({ name: 'device_type', type: 'varchar', length: 50 })
  deviceType!: string;

  @CreateDateColumn({ name: 'registration_date', type: 'timestamptz' })
  registrationDate!: Date;
}
