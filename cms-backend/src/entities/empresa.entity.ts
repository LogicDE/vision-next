import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Employee } from './employee.entity';


@Entity('enterprises')
export class Empresa {
@PrimaryGeneratedColumn({ name: 'id_enterprise' })
id!: number;


@Column({ length: 150, unique: true })
name!: string;


@Column({ length: 15 })
telephone!: string;


@Column({ length: 150, unique: true })
email!: string;


@OneToMany(() => Employee, (e) => e.empresa)
empleados!: Employee[];
}