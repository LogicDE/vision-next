// src/entities/rol.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  rol_id!: number;

  @Column({ length: 50, unique: true })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  // 🔗 Relación con usuarios
  @OneToMany(() => User, (user) => user.rol)
  usuarios!: User[];
}
