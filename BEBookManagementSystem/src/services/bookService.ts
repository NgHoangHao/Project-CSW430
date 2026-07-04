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
import fs from 'fs/promises';
import path from 'path';
import { BookUpdate } from '../dtos/book/BookUpdate';
import { CopyBookCreateDTO } from '../dtos/book/CopyBookCreateDTO';

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

  static async updateBook(bookId: string, bookDto: Partial<BookUpdate>) {
    const bookRepo = AppDataSource.getRepository(Book);
    const book = await bookRepo.findOneBy({ bookId: bookId });
    if (!book) {
      throw new Error('Book not found');
    }
    if (bookDto.title) book.title = bookDto.title;
    if (bookDto.author) book.author = bookDto.author;
    if (bookDto.publisher) book.publisher = bookDto.publisher;
    if (bookDto.publishYear) book.publishYear = Number(bookDto.publishYear);
    if (bookDto.category) book.category = bookDto.category;
    if (bookDto.url && bookDto.url.path) {
      if (book.url) {
        try {
          const oldFileName = path.basename(book.url);
          const oldFilePath = path.join(process.cwd(), 'images', oldFileName);
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.warn(`Can not remove old image: ${book.url}. Error:`, error);
        }
      }
      book.url = bookDto.url.path;
    }
    return await bookRepo.save(book);
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

  static async deleteBook(bookId: string) {
    const bookRepo = AppDataSource.getRepository(Book);
    const book = await bookRepo.findOneBy({ bookId: bookId });
    if (!book) {
      throw new Error('Không tìm thấy sách với ID cung cấp');
    }
    if (book.url) {
      try {
        const fileName = path.basename(book.url);
        const filePath = path.join(process.cwd(), 'images', fileName);

        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Không thể xóa file ảnh vật lý: ${book.url}. Lỗi:`, error);
      }
    }
    await bookRepo.remove(book);
    return true;
  }

  static async addCopyBook(data: CopyBookCreateDTO): Promise<CopyBook> {
    const bookRepo = AppDataSource.getRepository(Book);
    const copyBookRepo = AppDataSource.getRepository(CopyBook);
    const book = await bookRepo.findOne({
      where: { bookId: data.bookId }
    });

    if (!book) {
      throw new Error('Không tìm thấy sách với ID đã cung cấp.');
    }

    const existingBarcode = await copyBookRepo.findOne({
      where: { barcode: data.barcode }
    });

    if (existingBarcode) {
      throw new Error('Barcode này đã tồn tại trong hệ thống.');
    }
    const newCopyBook = copyBookRepo.create({
      barcode: data.barcode,
      location: data.location,
      book: book,
    });

    return await copyBookRepo.save(newCopyBook);
  }

  static async deleteCopyBook(copyBookId: string): Promise<void> {
    const copyBookRepo = AppDataSource.getRepository(CopyBook);
    const copyBook = await copyBookRepo.findOne({
      where: { copyBookId }
    });

    if (!copyBook) {
      throw new Error('Không tìm thấy bản sao sách (CopyBook) này.');
    }

    await copyBookRepo.remove(copyBook);
  }
}



