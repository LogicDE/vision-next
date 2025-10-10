import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity({ name: 'interventions' })
export class Intervention {
  @PrimaryGeneratedColumn({ name: 'id_inter' })
  id_inter!: number;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ name: 'title_message', type: 'varchar' })
  title_message!: string;

  @Column({ name: 'body_message', type: 'varchar' })
  body_message!: string;
}
