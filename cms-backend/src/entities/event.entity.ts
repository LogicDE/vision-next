import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn({ name: 'id_event' })
  id!: number;

  @ManyToOne(() => Employee, (e) => e.managedEvents, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  @Column({ length: 100 })
  titleMessage!: string;

  @Column({ length: 255 })
  bodyMessage!: string;

  @Column({ length: 200, nullable: true })
  coordinatorName?: string;

  @Column({ type: 'timestamptz', nullable: true })
  startAt?: Date;

  @Column({ type: 'timestamptz' })
  endAt!: Date;
}
