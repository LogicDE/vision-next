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

  @Column({ type: 'timestamptz', nullable: true })
  startAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endAt?: Date;

  @Column({ type: 'integer', nullable: true })
  groupScore?: number;

  @OneToMany(() => IndivSurveyScore, (iss) => iss.survey)
  individualScores!: IndivSurveyScore[];
}
