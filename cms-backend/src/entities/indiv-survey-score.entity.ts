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

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'integer', nullable: true })
  indivScore?: number;
}
