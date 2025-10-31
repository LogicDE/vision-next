// ===================
// action.entity.ts
// ===================
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { AuditLog } from './audit-log.entity';

@Entity('actions')
export class Action {
  @PrimaryGeneratedColumn({ name: 'id_action' })
  id!: number;

  @Column({ name: 'action_name', length: 100 })
  actionName!: string;

  @Column({ name: 'action_desc', length: 255, nullable: true })
  actionDesc?: string;

  @OneToMany(() => RolePermission, (rp: RolePermission) => rp.action)
  rolePermissions!: RolePermission[];

  @OneToMany(() => AuditLog, (log: AuditLog) => log.action)
  auditLogs!: AuditLog[];
}
