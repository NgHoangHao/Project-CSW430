// CopyBook.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CopyBookStatus } from '../utils/enums';
import { Book } from './Book';
import { LoanDetail } from './LoanDetail';

@Entity()
export class CopyBook {
  @PrimaryGeneratedColumn('uuid')
  copyBookId: string;

  @Column({ unique: true,nullable:false })
  barcode: string;

  @Column({ type: 'enum', enum: CopyBookStatus, default: CopyBookStatus.AVAILABLE,nullable:false },)
  status: CopyBookStatus;

  @Column({nullable:false})
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  // Quan hệ N-1 với Book
  @ManyToOne(() => Book, (book) => book.copyBooks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  // Quan hệ 1-N với LoanDetail
  @OneToMany(() => LoanDetail, (loanDetail) => loanDetail.copyBook)
  loanDetails: LoanDetail[];
}