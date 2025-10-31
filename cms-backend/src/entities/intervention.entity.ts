import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('interventions')
export class Intervention {
  @PrimaryGeneratedColumn({ name: 'id_inter' })
  id!: number;

  @ManyToOne(() => Employee, (e) => e.managedInterventions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  @Column({ length: 100 })
  type!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ length: 100 })
  titleMessage!: string;

  @Column({ length: 255 })
  bodyMessage!: string;
}
