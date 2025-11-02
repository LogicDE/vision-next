import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { City } from './city.entity';
import { Address } from './address.entity';

@Entity('neighborhoods')
export class Neighborhood {
  @PrimaryGeneratedColumn({ name: 'id_neighborhood' })
  id!: number;

  @ManyToOne(() => City, (c: City) => c.neighborhoods, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_city' })
  city!: City;

  @Column({ length: 150 })
  name!: string;

  @OneToMany(() => Address, (a: Address) => a.neighborhood)
  addresses!: Address[];
}
