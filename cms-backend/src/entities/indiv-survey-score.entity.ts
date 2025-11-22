import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SurveyVersion } from './survey-version.entity';
import { Employee } from './employee.entity';
import { ResponseAnswer } from './response-answer.entity';

@Entity('indiv_survey_scores')
export class IndivSurveyScore {
  @PrimaryGeneratedColumn({ name: 'id_indiv_survey' })
  id!: number;

  @ManyToOne(() => SurveyVersion, (sv) => sv.individualScores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_survey_version' })
  surveyVersion!: SurveyVersion;

  @ManyToOne(() => Employee, (e) => e.surveyScores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_employee' })
  employee!: Employee;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'indiv_score', type: 'integer', nullable: true })
  indivScore?: number;

  @OneToMany(() => ResponseAnswer, (ra) => ra.indivScore)
  responseAnswers!: ResponseAnswer[];
}
