// Role.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { RoleName } from './enums';
import { User } from './User';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  roleId: string;

  @Column({ type: 'enum', enum: RoleName })
  roleName: RoleName;

  // Quan hệ N-N với User
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}