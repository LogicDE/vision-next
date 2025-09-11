// src/entities/departamento.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Empresa } from './empresa.entity';
import { User } from './user.entity';

@Entity('departamentos')
export class Departamento {
  @PrimaryGeneratedColumn()
  departamento_id!: number;

  @Column()
  empresa_id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 150, nullable: true })
  ubicacion?: string;

  // 🔗 Relaciones
  @ManyToOne(() => Empresa, (empresa) => empresa.departamentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa!: Empresa;

  @OneToMany(() => User, (user) => user.departamento)
  usuarios!: User[];
}
