import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { QuestionI18n } from './question-i18n.entity';
import { SurveyVersionQuestion } from './survey-version-question.entity';
import { Employee } from './employee.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn({ name: 'id_question' })
  id!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: Employee;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: Employee;

  @OneToMany(() => QuestionI18n, (qi18n) => qi18n.question)
  i18nTexts!: QuestionI18n[];

  @OneToMany(() => SurveyVersionQuestion, (svq) => svq.question)
  surveyVersionQuestions!: SurveyVersionQuestion[];
}
