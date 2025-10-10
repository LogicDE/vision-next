import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn({ name: 'id_role' })
  id!: number;

  @Column({ length: 48, unique: true, name: 'name' })
  name!: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  @OneToMany(() => Employee, (employee) => employee.rol)
  empleados!: Employee[];
}
