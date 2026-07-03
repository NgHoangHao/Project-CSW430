import { AppDataSource } from '../config/database';
import { CopyBook } from '../entities/CopyBook';

export const CopyBookRepository = AppDataSource.getRepository(CopyBook).extend({

  async findDetailByBarcode(barcode: string) {
    return this.createQueryBuilder('copyBook')
      .innerJoinAndSelect('copyBook.book', 'book')
      .where('copyBook.barcode = :barcode', { barcode })
      .getOne();
  }
});
