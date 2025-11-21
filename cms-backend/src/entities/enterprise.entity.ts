import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EnterpriseLocation } from './enterprise-location.entity';
import { Employee } from './employee.entity';

@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn({ name: 'id_enterprise' })
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 15 })
  telephone!: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @OneToMany(() => EnterpriseLocation, (l: EnterpriseLocation) => l.enterprise)
  locations!: EnterpriseLocation[];

  @OneToMany(() => Employee, (e: Employee) => e.enterprise)
  employees!: Employee[];
}
