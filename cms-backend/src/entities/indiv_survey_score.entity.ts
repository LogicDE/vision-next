import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GroupSurveyScore } from './group_survey_score.entity';
import { Employee } from './employee.entity';

@Entity({ name: 'indiv_survey_scores' })
export class IndivSurveyScore {
  @PrimaryColumn({ name: 'id_survey' })
  id_survey!: number;

  @PrimaryColumn({ name: 'id_user' })
  id_user!: number;

  @Column({ name: 'indiv_score', type: 'int', nullable: true })
  indiv_score?: number;

  @ManyToOne(() => GroupSurveyScore, (s) => s.individualScores)
  @JoinColumn({ name: 'id_survey' })
  survey!: GroupSurveyScore;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'id_user' })
  user!: Employee;
}
