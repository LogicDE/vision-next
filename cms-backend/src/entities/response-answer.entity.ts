import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IndivSurveyScore } from './indiv-survey-score.entity';
import { SurveyVersionQuestion } from './survey-version-question.entity';

@Entity('response_answers')
export class ResponseAnswer {
  @PrimaryGeneratedColumn({ name: 'id_response' })
  id!: number;

  @ManyToOne(() => IndivSurveyScore, (iss) => iss.responseAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_indiv_score' })
  indivScore!: IndivSurveyScore;

  @ManyToOne(() => SurveyVersionQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_survey_question' })
  surveyQuestion!: SurveyVersionQuestion;

  @Column({ name: 'answer_value', type: 'integer' })
  answerValue!: number;
}

