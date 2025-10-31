import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { GroupSnapshotMember } from './group-snapshot-member.entity';
import { DailyGroupMetric } from './daily-group-metric.entity';
import { DailyEmployeeMetric } from './daily-employee-metric.entity';

@Entity('group_snapshots')
export class GroupSnapshot {
  @PrimaryGeneratedColumn({ name: 'id_snapshot' })
  id!: number;

  @ManyToOne(() => Group, (g) => g.snapshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group!: Group;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  snapshotAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  windowStart?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  windowEnd?: Date;

  @Column({ length: 50, nullable: true })
  jobVersion?: string;

  @Column({ length: 128, nullable: true })
  cohortHash?: string;

  @OneToMany(() => GroupSnapshotMember, (gsm) => gsm.snapshot)
  members!: GroupSnapshotMember[];

  @OneToMany(() => DailyGroupMetric, (dgm) => dgm.snapshot)
  groupMetrics!: DailyGroupMetric[];

  @OneToMany(() => DailyEmployeeMetric, (dem) => dem.snapshot)
  employeeMetrics!: DailyEmployeeMetric[];
}
