import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'services' })
export class Service {
  @PrimaryGeneratedColumn({ name: 'id_service' })
  id_service!: number;

  @Column({ name: 'service_name', type: 'varchar', length: 100 })
  service_name!: string;

  @Column({ name: 'service_desc', type: 'varchar', nullable: true })
  service_desc?: string;
}
