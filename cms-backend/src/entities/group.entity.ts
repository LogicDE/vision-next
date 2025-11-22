import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { GroupEmployee } from './group-employee.entity';
import { GroupSnapshot } from './group-snapshot.entity';
import { Survey } from './survey.entity';
import { Event } from './event.entity';
import { Intervention } from './intervention.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn({ name: 'id_group' })
  id!: number;

  @ManyToOne(() => Employee, (e) => e.managedGroups, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_manager' })
  manager!: Employee;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: Employee;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: Employee;

  @OneToMany(() => GroupEmployee, (ge) => ge.group)
  members!: GroupEmployee[];

  @OneToMany(() => GroupSnapshot, (gs) => gs.group)
  snapshots!: GroupSnapshot[];

  @OneToMany(() => Survey, (s) => s.group)
  surveys!: Survey[];


  @OneToMany(() => Event, (event) => event.group)
  events!: Event[];

  @OneToMany(() => Intervention, (intervention) => intervention.group)
  interventions!: Intervention[];
}
