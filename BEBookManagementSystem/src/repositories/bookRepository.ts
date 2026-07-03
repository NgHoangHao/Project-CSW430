import { AppDataSource } from '../config/database'; // Đường dẫn tới cấu hình Database của bạn
import { Book } from '../entities/Book';

export const BookRepository = AppDataSource.getRepository(Book).extend({
  async findAndCountBooks(page: number, limit: number, title?: string) {
    const queryBuilder = this.createQueryBuilder('book');
    if (title) {
      queryBuilder.where('LOWER(book.title) LIKE LOWER(:title)', { 
        title: `%${title.trim()}%` 
      });
    }
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('book.createdAt', 'DESC');
    return queryBuilder.getManyAndCount();
  }
});