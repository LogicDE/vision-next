// daily_empl_metrics.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity({ name: 'daily_employee_metrics' })
export class DailyEmployeeMetrics {
  @PrimaryGeneratedColumn({ name: 'id_metric' })
  id_metric!: number;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'varchar', length: 50 })
  metric_name!: 'heart_rate' | 'mental_state' | 'stress' | 'sleep_quality' | 'activity_level' | 'wellbeing';

  @Column({ type: 'varchar', length: 10 })
  agg_type!: 'avg' | 'sum' | 'min' | 'max';

  @Column({ type: 'double precision' })
  value!: number;

  @Column({ type: 'timestamptz', nullable: true })
  window_start?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  window_end?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  job_version?: string;

  @Column({ type: 'int', nullable: true })
  group_snapshot?: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  computed_at!: Date;

  @ManyToOne(() => Employee, (employee) => employee.metrics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_user' })
  employee!: Employee;
}