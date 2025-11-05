import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GroupSurveyScore } from './group-survey-score.entity';
import { Employee } from './employee.entity';

@Entity('indiv_survey_scores')
export class IndivSurveyScore {
  @PrimaryGeneratedColumn({ name: 'id_response' })
  id!: number;

  @ManyToOne(() => GroupSurveyScore, (gss) => gss.individualScores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_survey' })
  survey!: GroupSurveyScore;

  @ManyToOne(() => Employee, (e) => e.surveyScores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_employee' })
  employee!: Employee;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'indiv_score', type: 'integer', nullable: true })
  indivScore?: number;
}
