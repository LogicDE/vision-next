// country.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { State } from './state.entity';
import { Enterprise } from './enterprise.entity';

@Entity({ name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn({ name: 'id_country' })
  id_country!: number;

  @Column({ type: 'varchar', length: 56, unique: true })
  name!: string;

  @OneToMany(() => State, (state) => state.country)
  states!: State[];

  @OneToMany(() => Enterprise, (enterprise) => enterprise.country)
  enterprises!: Enterprise[];
}