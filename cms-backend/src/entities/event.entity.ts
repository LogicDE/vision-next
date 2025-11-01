import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn({ name: 'id_event' })
  id!: number;

  @ManyToOne(() => Employee, (e) => e.managedEvents, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  @Column({ name: 'title_message', length: 100 })
  titleMessage!: string;

  @Column({ name: 'body_message', length: 255 })
  bodyMessage!: string;

  @Column({ name: 'coordinator_name', length: 200, nullable: true })
  coordinatorName?: string;

  @Column({ name: 'start_at', type: 'timestamptz', nullable: true })
  startAt?: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt!: Date;
}
