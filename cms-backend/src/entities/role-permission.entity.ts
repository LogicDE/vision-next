import { Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Action } from './action.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ name: 'id_role' })
  roleId!: number;

  @PrimaryColumn({ name: 'id_action' })
  actionId!: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_role' })
  role!: Role;

  @ManyToOne(() => Action, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_action' })
  action!: Action;
}
