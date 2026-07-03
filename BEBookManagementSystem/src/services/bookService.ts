import { AppDataSource } from '../config/database';
import { Book } from '../entities/Book';
import { CopyBook } from '../entities/CopyBook';
import { BookStatus } from '../utils/enums'; 
import { BookDTO } from '../dtos/book/BookDTO'; 
import { BookRepository } from '../repositories/bookRepository';
import { BookPage } from '../dtos/book/BookPage';

export class BookService {
  
  static async createBookWithCopies(bookDto: BookDTO) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const newBook = new Book();
      newBook.title = bookDto.title;
      newBook.author = bookDto.author; 
      newBook.publisher = bookDto.publisher; 
      newBook.publishYear = Number(bookDto.publishYear); 
      newBook.category = bookDto.category; 
      newBook.url = bookDto.url.path; 
      newBook.status = BookStatus.AVAILABLE; 
      const savedBook = await transactionalEntityManager.save(newBook);
      if (bookDto.copyBooks && bookDto.copyBooks.length > 0) {
        const copyBookEntities = bookDto.copyBooks.map((cbDTO) => {
          const newCopyBook = new CopyBook();
          newCopyBook.barcode = cbDTO.barcode; 
          newCopyBook.location = cbDTO.location; 
          newCopyBook.book = savedBook; 
          return newCopyBook;
        });
        await transactionalEntityManager.save(copyBookEntities);
      }
      return savedBook;
    });
  }

  static async getBooksPaginated(page: number, limit: number, title?: string) {
    const [books, total] = await BookRepository.findAndCountBooks(page, limit, title);
    const bookPages: BookPage[] = books.map((book) => ({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      publishYear: book.publishYear,
      category: book.category,
      url: book.url,
      status: book.status,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    }));
    return {
      data: bookPages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}