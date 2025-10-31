import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { GroupSnapshot } from './group-snapshot.entity';
import { Employee } from './employee.entity';

@Entity('group_snapshots_members')
export class GroupSnapshotMember {
  @PrimaryColumn({ name: 'id_snapshot' })
  snapshotId!: number;

  @PrimaryColumn({ name: 'id_employee' })
  employeeId!: number;

  @ManyToOne(() => GroupSnapshot, (gs) => gs.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_snapshot' })
  snapshot!: GroupSnapshot;

  @ManyToOne(() => Employee, (e) => e.snapshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_employee' })
  employee!: Employee;
}
