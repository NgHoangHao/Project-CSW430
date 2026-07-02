// Book.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BookStatus } from '../utils/enums';
import { CopyBook } from './CopyBook';

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  bookId: string;

  @Column({nullable:false})
  title: string;

  @Column({nullable:false})
  author: string;

  @Column({nullable:false})
  publisher: string;

  @Column({ type: 'int',nullable:false })
  publishYear: number;

  @Column({nullable:false})
  category: string;

  @Column({ type: 'enum', enum: BookStatus, default: BookStatus.AVAILABLE })
  status: BookStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Quan hệ 1-N với CopyBook
  @OneToMany(() => CopyBook, (copyBook) => copyBook.book)
  copyBooks: CopyBook[];
}