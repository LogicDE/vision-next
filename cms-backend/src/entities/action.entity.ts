import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'actions' })
export class Action {
  @PrimaryGeneratedColumn({ name: 'id_action' })
  id_action!: number;

  @Column({ name: 'action_name', type: 'varchar', length: 100 })
  action_name!: string;

  @Column({ name: 'action_desc', type: 'varchar', nullable: true })
  action_desc?: string;
}
