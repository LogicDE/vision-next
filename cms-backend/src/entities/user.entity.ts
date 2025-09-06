import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum Gender {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  OTRO = 'otro',
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
  nombre!: string;

  @Column()
  apellido!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ type: 'numeric', nullable: true })
  salario?: number;

  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO })
  estado!: EstadoUsuario;
}
