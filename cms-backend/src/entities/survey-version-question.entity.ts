import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SurveyVersion } from './survey-version.entity';
import { Question } from './question.entity';

@Entity('survey_versions_questions')
export class SurveyVersionQuestion {
  @PrimaryGeneratedColumn({ name: 'id_survey_question' })
  id!: number;

  @ManyToOne(() => SurveyVersion, (sv) => sv.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_survey_version' })
  surveyVersion!: SurveyVersion;

  @ManyToOne(() => Question, (q) => q.surveyVersionQuestions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_question' })
  question!: Question;
}

