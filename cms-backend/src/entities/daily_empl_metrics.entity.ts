import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

export type MetricEnum = 'heart_rate' | 'mental_state' | 'stress' | 'sleep_quality' | 'activity_level' | 'wellbeing';
export type AggEnum = 'avg' | 'sum' | 'min' | 'max';

@Entity({ name: 'daily_employee_metrics' })
export class DailyEmployeeMetric {
  @PrimaryColumn({ name: 'id_user' })
  id_user!: number;

  @PrimaryColumn({ name: 'date', type: 'date' })
  date!: string;

  @PrimaryColumn({ name: 'metric_name', type: 'varchar' })
  metric_name!: MetricEnum;

  @PrimaryColumn({ name: 'agg_type', type: 'varchar' })
  agg_type!: AggEnum;

  @Column({ type: 'double precision' })
  value!: number;

  @Column({ type: 'timestamptz', nullable: true })
  window_start?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  window_end?: Date;

  @Column({ name: 'job_version', type: 'varchar', length: 50, nullable: true })
  job_version?: string;

  @Column({ name: 'computed_at', type: 'timestamptz', default: () => 'NOW()' })
  computed_at!: Date;

  @Column({ name: 'group_snapshot', type: 'int', nullable: true })
  group_snapshot?: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'id_user' })
  user!: Employee;
}
