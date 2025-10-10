import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { Employee } from './employee.entity';

@Entity({ name: 'groups_employees' })
export class GroupsEmployees {
  @PrimaryColumn({ name: 'id_group' })
  id_group!: number;

  @PrimaryColumn({ name: 'id_employee' })
  id_employee!: number;

  @ManyToOne(() => Group, (g) => g.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_group' })
  group!: Group;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_employee' })
  employee!: Employee;
}
