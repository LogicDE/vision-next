// enterprise.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { State } from './state.entity';
import { Country } from './country.entity';
import { Employee } from './employee.entity';
import { Device } from './device.entity';
import { Group } from './group.entity';

@Entity({ name: 'enterprises' })
export class Enterprise {
  @PrimaryGeneratedColumn({ name: 'id_enterprise' })
  id_enterprise!: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 15 })
  telephone!: string;

  @Column({ type: 'varchar', length: 150 })
  email!: string;

  @ManyToOne(() => State, (state) => state.enterprises, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_state' })
  state!: State;

  @ManyToOne(() => Country, (country) => country.enterprises, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_country' })
  country!: Country;

  @OneToMany(() => Employee, (employee) => employee.enterprise)
  employees!: Employee[];

  @OneToMany(() => Device, (device) => device.empresa)
  devices!: Device[];

  @OneToMany(() => Group, (group) => group.empresa)
  groups!: Group[];
}