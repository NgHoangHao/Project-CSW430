// Loan.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { LoanStatus } from '../utils/enums';
import { User } from './User';
import { LoanDetail } from './LoanDetail';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  loanId: string;

  @Column({ type: 'timestamp',nullable:false })
  borrowDate: Date;

  @Column({ type: 'timestamp',nullable:false })
  dueDate: Date;

  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.BORROWING })
  status: LoanStatus;

  @CreateDateColumn()
  createdAt: Date;

  // Quan hệ N-1 với User
  @ManyToOne(() => User, (user) => user.loans,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Quan hệ 1-N với LoanDetail
  @OneToMany(() => LoanDetail, (loanDetail) => loanDetail.loan)
  loanDetails: LoanDetail[];
}