import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { SurveyVersion } from './survey-version.entity';
import { Employee } from './employee.entity';

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn({ name: 'id_survey' })
  id!: number;

  @ManyToOne(() => Group, (g) => g.surveys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group!: Group;

  @Column({ name: 'name', length: 150 })
  name!: string;

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

  @OneToMany(() => SurveyVersion, (sv) => sv.survey)
  versions!: SurveyVersion[];
}

