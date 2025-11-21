import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { IndivSurveyScore } from './indiv-survey-score.entity';

@Entity('group_survey_scores')
export class GroupSurveyScore {
  @PrimaryGeneratedColumn({ name: 'id_survey' })
  id!: number;

  @ManyToOne(() => Group, (g) => g.surveys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group!: Group;

@Column({ name: 'name', length: 150 })
name!: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
  endAt?: Date;

  @Column({ name: 'group_score', type: 'integer' })
  groupScore!: number;

  @OneToMany(() => IndivSurveyScore, (iss) => iss.survey)
  individualScores!: IndivSurveyScore[];
}
