import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn({ name: 'id_event' })
  id!: number;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group!: Group;

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
