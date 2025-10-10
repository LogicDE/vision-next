import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GroupSurveyScore } from './group_survey_score.entity';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn({ name: 'id_question' })
  id_question!: number;

  @ManyToOne(() => GroupSurveyScore, (s) => s.questions)
  @JoinColumn({ name: 'id_survey' })
  survey!: GroupSurveyScore;

  @Column({ type: 'varchar' })
  question!: string;
}
