import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Country } from './country.entity';
import { Address } from './address.entity';

@Entity('postal_codes')
export class PostalCode {
  @PrimaryGeneratedColumn({ name: 'id_postal_code' })
  id!: number;

  @ManyToOne(() => Country, (c: Country) => c.postalCodes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_country' })
  country!: Country;

  @Column({ length: 15 })
  code!: string;

  @OneToMany(() => Address, (a: Address) => a.postalCode)
  addresses!: Address[];
}
