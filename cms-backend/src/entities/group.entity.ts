import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Enterprise } from './enterprise.entity';
import { Employee } from './employee.entity';
import { GroupEmployee } from './groups_empl.entity';
import { DailyGroupMetrics } from './daily_group_metrics.entity';
import { GroupSurveyScore } from './group_survey_score.entity';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn({ name: 'id_group' })
  id_group!: number;

  @Column({ name: 'name' })
  name!: string; // Cambiado de 'nombre' a 'name' para consistencia con DTO

  @Column({ nullable: true })
  descripcion?: string;

  // Relación con empresa
  @ManyToOne(() => Enterprise, (enterprise) => enterprise.groups, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_enterprise' })
  empresa!: Enterprise;

  // Manager opcional
  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  // Relación con empleados
  @OneToMany(() => GroupEmployee, (ge) => ge.group)
  groupEmployees!: GroupEmployee[];

  // Relación con métricas de grupo
  @OneToMany(() => DailyGroupMetrics, (metric) => metric.group)
  metrics!: DailyGroupMetrics[];

  // Relación con encuestas
  @OneToMany(() => GroupSurveyScore, (survey) => survey.group)
  surveys!: GroupSurveyScore[];
}
