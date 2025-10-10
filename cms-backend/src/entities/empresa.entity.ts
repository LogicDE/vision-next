import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { State } from './state.entity';
import { Employee } from './employee.entity';
import { Device } from './device.entity';

@Entity('enterprises')
export class Empresa {
  @PrimaryGeneratedColumn({ name: 'id_enterprise' })
  id!: number;

  @Column({ unique: true, length: 150 })
  name!: string;

  @Column({ length: 15 })
  telephone!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @ManyToOne(() => State, (state) => state.enterprises, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_state' })
  state!: State;

  @OneToMany(() => Employee, (employee) => employee.empresa)
  employees!: Employee[];

  @OneToMany(() => Device, (device) => device.empresa)
  devices!: Device[];
}
