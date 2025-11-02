import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Question } from './question.entity';

@Entity('question_i18n')
export class QuestionI18n {
  @PrimaryColumn({ name: 'id_question' })
  questionId!: number;

  @PrimaryColumn({ length: 10 })
  locale!: string;

  @Column({ length: 255 })
  text!: string;

  @ManyToOne(() => Question, (q) => q.i18nTexts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_question' })
  question!: Question;
}
