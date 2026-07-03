import { Request, Response } from 'express';
import { BookService } from '../services/bookService';
import { BookDTO, } from '../dtos/book/BookDTO';
import { CopyBookDTO } from '../dtos/book/CopyBookDTO';

export const createBook = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Thiếu file ảnh (url)" });
    }
    let copyBooks: CopyBookDTO[] = [];
    if (req.body.copyBooks) {
      copyBooks = typeof req.body.copyBooks === 'string'
        ? JSON.parse(req.body.copyBooks)
        : req.body.copyBooks;
    }
    const bookDto: BookDTO = {
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher,
      publishYear: req.body.publishYear,
      category: req.body.category,
      url: req.file,
      copyBooks: copyBooks
    };
    await BookService.createBookWithCopies(bookDto);
    return res.status(201).json({
      message: "Add new book successfully!"
    });
  } catch (error) {
    console.error("Lỗi Controller:", error);
    return res.status(500).json({ message: " Server Internal Error" });
  }
}

export const getBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const title = req.query.title as string | undefined;
    const result = await BookService.getBooksPaginated(page, size, title);
    return res.status(200).json({
      success: true,
      message: 'Successfully retrieved the list.',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    console.error('Error retrieving the list of books:', error);
    return res.status(500).json({ message: 'Server Internal Error' });
  }
}
