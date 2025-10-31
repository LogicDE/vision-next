import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { GroupSnapshot } from './group-snapshot.entity';

export type MetricEnum = 'heart_rate' | 'mental_state' | 'stress' | 'sleep_quality' | 'activity_level' | 'wellbeing';
export type AggEnum = 'avg' | 'sum' | 'min' | 'max';

@Entity('daily_group_metrics')
export class DailyGroupMetric {
  @PrimaryColumn({ name: 'id_snapshot' })
  snapshotId!: number;

  @PrimaryColumn({ type: 'enum', enum: ['heart_rate','mental_state','stress','sleep_quality','activity_level','wellbeing'], name: 'metric_name' })
  metricName!: MetricEnum;

  @PrimaryColumn({ type: 'enum', enum: ['avg','sum','min','max'], name: 'agg_type' })
  aggType!: AggEnum;

  @Column('double precision')
  value!: number;

  @ManyToOne(() => GroupSnapshot, (gs) => gs.groupMetrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_snapshot' })
  snapshot!: GroupSnapshot;
}
