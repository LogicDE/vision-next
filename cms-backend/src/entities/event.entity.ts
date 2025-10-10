import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { Group } from './group.entity';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn({ name: 'id_event' })
  id_event!: number;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  @ManyToOne(() => Group, (g) => g.events, { nullable: true })
  @JoinColumn({ name: 'id_group' })
  group?: Group;  // <-- aquí agregamos la propiedad que faltaba

  @Column({ name: 'title_message', type: 'varchar' })
  title_message!: string;

  @Column({ name: 'body_message', type: 'varchar' })
  body_message!: string;

  @Column({ name: 'coordinator_name', type: 'varchar', nullable: true })
  coordinator_name?: string;

  @Column({ type: 'date', nullable: true })
  start_date?: string;

  @Column({ type: 'time', nullable: true })
  start_time?: string;

  @Column({ type: 'date' })
  end_date!: string;

  @Column({ type: 'time' })
  end_time!: string;
}
