import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { GroupEmployee } from './group-employee.entity';
import { GroupSnapshot } from './group-snapshot.entity';
import { GroupSurveyScore } from './group-survey-score.entity';
import { Question } from './question.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn({ name: 'id_group' })
  id!: number;

  @ManyToOne(() => Employee, (e) => e.managedGroups, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_manager' })
  manager!: Employee;

  @Column({ length: 100 })
  name!: string;

  @OneToMany(() => GroupEmployee, (ge) => ge.group)
  members!: GroupEmployee[];

  @OneToMany(() => GroupSnapshot, (gs) => gs.group)
  snapshots!: GroupSnapshot[];

  @OneToMany(() => GroupSurveyScore, (gss) => gss.group)
  surveys!: GroupSurveyScore[];

  @OneToMany(() => Question, (q) => q.group)
  questions!: Question[];
}
