import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';
import { Empresa } from './empresa.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn({ name: 'id_employee' })
  id!: number;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ length: 100, unique: true })
  username!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ length: 15, nullable: true })
  telephone?: string;

  @ManyToOne(() => Rol, rol => rol.empleados)
  @JoinColumn({ name: 'id_role' })
  rol!: Rol;

  @ManyToOne(() => Empresa, empresa => empresa.employees)
  @JoinColumn({ name: 'id_enterprise' })
  empresa!: Empresa;

  @ManyToOne(() => Employee, emp => emp.subordinates, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  @OneToMany(() => Employee, emp => emp.manager)
  subordinates!: Employee[];
}
