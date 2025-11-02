import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { QuestionI18n } from './question-i18n.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn({ name: 'id_question' })
  id!: number;

  @ManyToOne(() => Group, (g) => g.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group?: Group;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @OneToMany(() => QuestionI18n, (qi18n) => qi18n.question)
  i18nTexts!: QuestionI18n[];
}
