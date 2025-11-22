import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Survey } from './survey.entity';
import { Employee } from './employee.entity';
import { IndivSurveyScore } from './indiv-survey-score.entity';
import { SurveyVersionQuestion } from './survey-version-question.entity';

@Entity('surveys_versions')
export class SurveyVersion {
  @PrimaryGeneratedColumn({ name: 'id_survey_version' })
  id!: number;

  @ManyToOne(() => Survey, (s) => s.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_survey' })
  survey!: Survey;

  @Column({ name: 'version_num', type: 'integer' })
  versionNum!: number;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: Employee;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'group_score', type: 'integer', nullable: true })
  groupScore?: number;

  @Column({ name: 'active', type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'start_at', type: 'timestamptz', nullable: true })
  startAt?: Date;

  @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
  endAt?: Date;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: Employee;

  @OneToMany(() => IndivSurveyScore, (iss) => iss.surveyVersion)
  individualScores!: IndivSurveyScore[];

  @OneToMany(() => SurveyVersionQuestion, (svq) => svq.surveyVersion)
  questions!: SurveyVersionQuestion[];
}

