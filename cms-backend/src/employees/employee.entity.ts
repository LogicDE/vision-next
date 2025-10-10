import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id_employee!: number;

  @Column({ nullable: true })
  id_manager!: number;

  @Column()
  id_enterprise!: number;

  @Column({ nullable: true })
  id_state!: number;

  @Column()
  id_role!: number;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password_hash!: string;

  @Column({ nullable: true })
  telephone!: string;

  @Column({ default: 'active' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

