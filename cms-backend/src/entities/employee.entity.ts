// employee.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';
import { Enterprise } from './enterprise.entity';
import { GroupEmployee } from './groups_empl.entity';
import { DailyEmployeeMetrics } from './daily_empl_metrics.entity';
import { AuditLog } from './auditlog.entity';
import { Intervention } from './intervention.entity';
import { Alert } from './alert.entity';
import { IndivSurveyScore } from './indiv_survey_score.entity';

@Entity({ name: 'employees' })
export class Employee {
  @PrimaryGeneratedColumn({ name: 'id_employee' })
  id_employee!: number;

  @Column({ name: 'first_name' })
  first_name!: string;

  @Column({ name: 'last_name' })
  last_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ name: 'password_hash' })
  password_hash!: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telephone?: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string;

  @ManyToOne(() => Rol, (rol) => rol.employees, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_role' })
  rol!: Rol;

  @ManyToOne(() => Enterprise, (enterprise) => enterprise.employees, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_enterprise' })
  enterprise!: Enterprise;

  @ManyToOne(() => Employee, (employee) => employee.managedInterventions)
  @JoinColumn({ name: 'id_manager' })
  manager?: Employee;

  @OneToMany(() => Intervention, (intervention) => intervention.employee)
  interventions!: Intervention[];

  @OneToMany(() => Intervention, (intervention) => intervention.manager)
  managedInterventions!: Intervention[];

  @OneToMany(() => Alert, (alert) => alert.employee)
  alerts!: Alert[];

  @OneToMany(() => IndivSurveyScore, (score) => score.user)
  indivSurveyScores!: IndivSurveyScore[];

  // 🔹 Relación con grupos
  @OneToMany(() => GroupEmployee, (ge) => ge.employee)
  groups!: GroupEmployee[];

  // 🔹 Relación con métricas
  @OneToMany(() => DailyEmployeeMetrics, (metric) => metric.employee)
  metrics!: DailyEmployeeMetrics[];

  // 🔹 Relación con auditoría
  @OneToMany(() => AuditLog, (log) => log.actor)
  auditLogs!: AuditLog[];
}
