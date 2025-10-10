import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { State } from './state.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn({ name: 'id_country' })
  id!: number;

  @Column({ length: 56, unique: true })
  name!: string;

  // Relación con states
  @OneToMany(() => State, (state) => state.country)
  states!: State[];
}
