import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Country } from './country.entity';
import { City } from './city.entity';

@Entity('admin_subdivisions')
export class AdminSubdivision {
  @PrimaryGeneratedColumn({ name: 'id_area' })
  id!: number;

  @ManyToOne(() => Country, (c: Country) => c.adminSubdivisions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_country' })
  country!: Country;

  @Column({ name: 'iso_code', length: 32, unique: true })
  isoCode!: string;

  @Column({ length: 100 })
  name!: string;

  @OneToMany(() => City, (c: City) => c.area)
  cities!: City[];
}
