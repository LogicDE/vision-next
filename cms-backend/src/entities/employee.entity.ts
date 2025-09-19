    import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
    import { Rol } from './rol.entity';
    import { Empresa } from './empresa.entity';

    @Entity('employees')
    export class Employee {
    @PrimaryGeneratedColumn({ name: 'id_employee' })
    id!: number;

    @Column({ name: 'first_name' })
    firstName!: string;

    @Column({ name: 'last_name' })
    lastName!: string;

    @Column({ length: 150, unique: true })
    email!: string;

    @Column({ length: 100, unique: true })
    username!: string;

    @Column({ name: 'password_hash' })
    passwordHash!: string;

    @Column({ length: 15, nullable: true })
    telephone?: string;

    @ManyToOne(() => Rol, (rol) => rol.empleados)
    @JoinColumn({ name: 'id_role' })
    rol!: Rol;

    @ManyToOne(() => Empresa, (empresa) => empresa.empleados)
    @JoinColumn({ name: 'id_enterprise' })
    empresa!: Empresa;
    }
