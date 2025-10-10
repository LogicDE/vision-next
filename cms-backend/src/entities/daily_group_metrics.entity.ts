import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { MetricEnum, AggEnum } from './daily_empl_metrics.entity';

@Entity({ name: 'daily_group_metrics' })
export class DailyGroupMetric {
  @PrimaryColumn({ name: 'id_group' })
  id_group!: number;

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

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'id_group' })
  group!: Group;
}
