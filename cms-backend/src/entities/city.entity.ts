import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AdminSubdivision } from './admin-subdivision.entity';
import { Neighborhood } from './neighborhood.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn({ name: 'id_city' })
  id!: number;

  @ManyToOne(() => AdminSubdivision, (a: AdminSubdivision) => a.cities, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_area' })
  area!: AdminSubdivision;

  @Column({ length: 120 })
  name!: string;

  @OneToMany(() => Neighborhood, (n: Neighborhood) => n.city)
  neighborhoods!: Neighborhood[];
}
