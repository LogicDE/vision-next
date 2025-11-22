import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { EnterpriseLocation } from './enterprise-location.entity';
import { Employee } from './employee.entity';

@Entity('enterprises')
export class Enterprise {
  @PrimaryGeneratedColumn({ name: 'id_enterprise' })
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 15, nullable: true })
  telephone?: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ type: 'boolean', default: true })
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

  @OneToMany(() => EnterpriseLocation, (l: EnterpriseLocation) => l.enterprise)
  locations!: EnterpriseLocation[];

  @OneToMany(() => Employee, (e: Employee) => e.enterprise)
  employees!: Employee[];
}
