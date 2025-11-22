import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Enterprise } from './enterprise.entity';
import { Role } from './role.entity';
import { Group } from './group.entity';
import { GroupEmployee } from './group-employee.entity';
import { GroupSnapshotMember } from './group-snapshot-member.entity';
import { IndivSurveyScore } from './indiv-survey-score.entity';
import { AuditLog } from './audit-log.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn({ name: 'id_employee' })
  id!: number;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  @ManyToOne(() => Enterprise, (e) => e.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_enterprise' })
  enterprise!: Enterprise;

  @ManyToOne(() => Role, (r) => r.employees, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_role' })
  role!: Role;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ length: 100, unique: true })
  username!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ length: 15, nullable: true })
  telephone?: string;

  @Column({ length: 20, default: 'active' })
  status!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: Employee;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: Employee;

  @OneToMany(() => Group, (g) => g.manager)
  managedGroups!: Group[];

  @OneToMany(() => GroupEmployee, (ge) => ge.employee)
  groupMemberships!: GroupEmployee[];

  @OneToMany(() => GroupSnapshotMember, (gsm) => gsm.employee)
  snapshots!: GroupSnapshotMember[];

  @OneToMany(() => IndivSurveyScore, (iss) => iss.employee)
  surveyScores!: IndivSurveyScore[];

  @OneToMany(() => AuditLog, (log) => log.actor)
  auditLogs!: AuditLog[];
}
