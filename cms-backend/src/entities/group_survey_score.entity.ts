import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Group } from './group.entity';
import { Question } from './question.entity';
import { IndivSurveyScore } from './indiv_survey_score.entity';

@Entity({ name: 'group_survey_scores' })
export class GroupSurveyScore {
  @PrimaryGeneratedColumn({ name: 'id_survey' })
  id_survey!: number;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'id_group' })
  group!: Group;

  @Column({ type: 'date', nullable: true })
  start_date?: string;

  @Column({ type: 'time', nullable: true })
  start_time?: string;

  @Column({ type: 'date' })
  end_date!: string;

  @Column({ type: 'time' })
  end_time!: string;

  @Column({ name: 'group_score', type: 'int', nullable: true })
  group_score?: number;

  @OneToMany(() => Question, (q) => q.survey)
  questions!: Question[];

  @OneToMany(() => IndivSurveyScore, (i) => i.survey)
  individualScores!: IndivSurveyScore[];
}
