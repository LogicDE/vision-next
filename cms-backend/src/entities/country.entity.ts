import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AdminSubdivision } from './admin-subdivision.entity';
import { PostalCode } from './postal-code.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn({ name: 'id_country' })
  id!: number;

  @Column({ name: 'iso_code', length: 5, unique: true })
  isoCode!: string;

  @Column({ length: 100 })
  name!: string;

  @OneToMany(() => AdminSubdivision, (a: AdminSubdivision) => a.country)
  adminSubdivisions!: AdminSubdivision[];

  @OneToMany(() => PostalCode, (p: PostalCode) => p.country)
  postalCodes!: PostalCode[];
}
