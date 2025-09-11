// src/entities/empresa.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Departamento } from './departamento.entity';
import { User } from './user.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  empresa_id!: number;

  @Column({ length: 150, unique: true })
  nombre!: string;

  @Column({ length: 100, nullable: true })
  sector?: string;

  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column({ length: 150, unique: true })
  correo_contacto!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // 🔗 Relaciones
  @OneToMany(() => Departamento, (departamento) => departamento.empresa)
  departamentos!: Departamento[];

  @OneToMany(() => User, (user) => user.empresa)
  usuarios!: User[];
}
