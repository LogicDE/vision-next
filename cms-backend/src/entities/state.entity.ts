import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Country } from './country.entity';
import { Empresa } from './empresa.entity';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn({ name: 'id_state' })
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => Country, (country) => country.states, { eager: true })
  @JoinColumn({ name: 'id_country' })
  country!: Country;

  @OneToMany(() => Empresa, (empresa) => empresa.state)
  enterprises!: Empresa[];
}
