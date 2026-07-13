// LoanDetail.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LoanStatus } from '../utils/enums';
import { Loan } from './Loan';
import { CopyBook } from './CopyBook';

@Entity()
export class LoanDetail {
  @PrimaryGeneratedColumn('uuid')
  loanDetailId: string;

  @Column({ type: 'timestamp', nullable: true })
  returnDate: Date;

  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.BORROWING })
  status: LoanStatus;

  // Quan hệ N-1 với Loan
  @ManyToOne(() => Loan, (loan) => loan.loanDetails,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  // Quan hệ N-1 với CopyBook
  @ManyToOne(() => CopyBook, (copyBook) => copyBook.loanDetails,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'copyBookId' })
  copyBook: CopyBook;
}