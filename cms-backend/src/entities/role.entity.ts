// ===================
// role.entity.ts
// ===================
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { Employee } from './employee.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ name: 'id_role' })
  id!: number;

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @OneToMany(() => RolePermission, (rp: RolePermission) => rp.role)
  rolePermissions!: RolePermission[];

  @OneToMany(() => Employee, (e: Employee) => e.role)
  employees!: Employee[];
}
