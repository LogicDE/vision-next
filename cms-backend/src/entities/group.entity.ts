import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Employee } from './employee.entity';
import { GroupsEmployees } from './groups_empl.entity';
import { DailyGroupMetric } from './daily_group_metrics.entity';
import { GroupSurveyScore } from './group_survey_score.entity';
import { Event } from './event.entity';
import { Intervention } from './intervention.entity';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn({ name: 'id_group' })
  id_group!: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'id_manager' })
  manager!: Employee;

  @OneToMany(() => GroupsEmployees, (ge) => ge.group)
  members!: GroupsEmployees[];

  @OneToMany(() => DailyGroupMetric, (dg) => dg.group)
  dailyMetrics!: DailyGroupMetric[];

  @OneToMany(() => GroupSurveyScore, (gs) => gs.group)
  surveys!: GroupSurveyScore[];

}
