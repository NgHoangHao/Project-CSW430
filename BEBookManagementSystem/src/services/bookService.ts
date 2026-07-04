import { AppDataSource } from '../config/database';
import { Book } from '../entities/Book';
import { CopyBook } from '../entities/CopyBook';
import { BookStatus } from '../utils/enums';
import { BookDTO } from '../dtos/book/BookDTO';
import { BookRepository } from '../repositories/bookRepository';
import { BookPage } from '../dtos/book/BookPage';
import { CopyBookDTO } from '../dtos/book/CopyBookDTO';
import { BookDetail } from '../dtos/book/BookDetail';
import { CopyBookRepository } from '../repositories/copyBookRepository';
import { CopyBookDetail } from '../dtos/book/CopyBookDetail';

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

  static async getBookDetail(bookId: string): Promise<BookDetail | null> {
    const book = await BookRepository.findBookDetailById(bookId);
    if (!book) return null;
    const copyBookDTOs: CopyBookDTO[] = book.copyBooks && book.copyBooks.length > 0
      ? book.copyBooks.map((cb) => ({
        barcode: cb.barcode,
        location: cb.location
      }))
      : [];
    const bookDetail: BookDetail = {
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      publishYear: book.publishYear,
      category: book.category,
      url: book.url,
      status: book.status,
      createdAt: book.createdAt,
      totalAvailableCopy: copyBookDTOs.length,
      updatedAt: book.updatedAt,
      availableBooks: copyBookDTOs
    };
    return bookDetail;
  }

  static async getCopyBookDetailByBarcode(barcode: string): Promise<CopyBookDetail | null> {
    const copyBook = await CopyBookRepository.findDetailByBarcode(barcode);
    if (!copyBook || !copyBook.book) {
      return null;
    }
    const detail: CopyBookDetail = {
      title: copyBook.book.title,
      author: copyBook.book.author,
      publisher: copyBook.book.publisher,
      publishYear: copyBook.book.publishYear,
      category: copyBook.book.category,
      url: copyBook.book.url,
      copyBookId: copyBook.copyBookId,
      barcode: copyBook.barcode,
      status: copyBook.status,
      location: copyBook.location
    };
    return detail;
  }
}

