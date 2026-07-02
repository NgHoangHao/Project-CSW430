// User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { UserStatus } from '../utils/enums';
import { Role } from './Role';
import { Loan } from './Loan';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({nullable:false})
  userName: string;

  @Column({nullable:false})
  email: string;

  @Column({nullable:false})
  password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE, })
  status: UserStatus;

  @Column({ type: 'int', default: 0 })
  credit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[];
}