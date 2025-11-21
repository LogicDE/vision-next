import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity('interventions')
export class Intervention {
  @PrimaryGeneratedColumn({ name: 'id_inter' })
  id!: number;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group!: Group;

  @Column({ length: 255, nullable: true })
  description?: string;

  @Column({ name: 'title_message', length: 100 })
  titleMessage!: string;

  @Column({ name: 'body_message', length: 255 })
  bodyMessage!: string;
}
