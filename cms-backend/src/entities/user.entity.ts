import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Empresa } from './empresa.entity';
import { Departamento } from './departamento.entity';
import { Rol } from './rol.entity';

export enum Gender {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  OTRO = 'otro',
}

export enum EstadoCivil {
  SOLTERO = 'soltero',
  CASADO = 'casado',
  UNION_LIBRE = 'union_libre',
  DIVORCIADO = 'divorciado',
  VIUDO = 'viudo',
}

export enum EstadoUsuario {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  SUSPENDIDO = 'suspendido',
}

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  usuario_id!: string;

  @Column()
  empresa_id!: number;

  @Column({ nullable: true })
  departamento_id?: number;

  @Column()
  rol_id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ length: 255 })
  password_hash!: string;

  @Column({ length: 20, nullable: true })
  telefono?: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento?: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  genero?: Gender;

  @Column({ type: 'enum', enum: EstadoCivil, nullable: true })
  estado_civil?: EstadoCivil;

  @Column({ length: 100, nullable: true })
  puesto?: string;

  @Column({ length: 100, nullable: true })
  area?: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  salario?: number;

  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.ACTIVO,
  })
  estado!: EstadoUsuario;

  @Column({ type: 'jsonb', nullable: true })
  preferencias?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  // 🔗 Relaciones
  @ManyToOne(() => Empresa, (empresa) => empresa.usuarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa!: Empresa;

  @ManyToOne(() => Departamento, (departamento) => departamento.usuarios, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departamento_id' })
  departamento?: Departamento;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol;
}
