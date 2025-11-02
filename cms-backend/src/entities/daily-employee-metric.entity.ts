import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { GroupSnapshot } from './group-snapshot.entity';
import { AggEnum, MetricEnum } from './daily-group-metric.entity';

@Entity('daily_employee_metrics')
export class DailyEmployeeMetric {
  @PrimaryColumn({ name: 'id_employee' })
  employeeId!: number;

  @PrimaryColumn({ name: 'id_snapshot' })
  snapshotId!: number;

  @PrimaryColumn({ type: 'enum', enum: ['heart_rate','mental_state','stress','sleep_quality','activity_level','wellbeing'], name: 'metric_name' })
  metricName!: MetricEnum;

  @PrimaryColumn({ type: 'enum', enum: ['avg','sum','min','max'], name: 'agg_type' })
  aggType!: AggEnum;

  @Column('double precision')
  value!: number;

  @ManyToOne(() => Employee, (e) => e.snapshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_employee' })
  employee!: Employee;

  @ManyToOne(() => GroupSnapshot, (gs) => gs.employeeMetrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_snapshot' })
  snapshot!: GroupSnapshot;
}
export { MetricEnum, AggEnum };

