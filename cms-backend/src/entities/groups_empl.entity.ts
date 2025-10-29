// groups_empl.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { Employee } from './employee.entity';

@Entity({ name: 'groups_employees' })
export class GroupEmployee {
  @PrimaryGeneratedColumn({ name: 'id_group_employee' })
  id_group_employee!: number;

  @ManyToOne(() => Group, (group) => group.groupEmployees, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_group' })
  group!: Group;

  @ManyToOne(() => Employee, (employee) => employee.groups, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_employee' })
  employee!: Employee;
}