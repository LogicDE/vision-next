import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { Employee } from './employee.entity';

@Entity('groups_employees')
export class GroupEmployee {
  @PrimaryColumn({ name: 'id_group' })
  groupId!: number;

  @PrimaryColumn({ name: 'id_employee' })
  employeeId!: number;

  @ManyToOne(() => Group, (g) => g.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group!: Group;

  @ManyToOne(() => Employee, (e) => e.groupMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_employee' })
  employee!: Employee;
}
