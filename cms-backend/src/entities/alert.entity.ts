import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Employee } from './employee.entity';
import { DailyEmployeeMetrics } from './daily_empl_metrics.entity';
import { Intervention } from './intervention.entity';

export enum AlertStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id_alert!: number;

  @Column({ type: 'varchar', length: 150 })
  type!: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.PENDING })
  status!: AlertStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Employee, (employee) => employee.alerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_employee' })
  employee!: Employee;

  @ManyToOne(() => DailyEmployeeMetrics, { nullable: true })
  @JoinColumn({ name: 'id_metric' })
  metric?: DailyEmployeeMetrics;

  @OneToMany(() => Intervention, (intervention) => intervention.alert)
  interventions!: Intervention[];

  @Column({ type: 'text', nullable: true })
  note?: string; // Observaciones sobre la atención de la alerta
}
