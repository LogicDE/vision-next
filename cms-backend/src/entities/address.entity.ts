import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PostalCode } from './postal-code.entity';
import { Neighborhood } from './neighborhood.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn({ name: 'id_address' })
  id!: number;

  @Column({ name: 'street_number', length: 10 })
  streetNumber!: string;

  @Column({ name: 'street_name', length: 100 })
  streetName!: string;

  @ManyToOne(() => PostalCode, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_postal_code' })
  postalCode!: PostalCode;

  @ManyToOne(() => Neighborhood, (n: Neighborhood) => n.addresses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_neighborhood' })
  neighborhood!: Neighborhood;
}
