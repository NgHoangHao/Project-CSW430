import { Request, Response } from "express";
import { BookService } from "../services/bookService";
import fs from "fs";
import { BookDTO } from "../dtos/book/BookDTO";
import { CopyBookDTO } from "../dtos/book/CopyBookDTO";
import { CopyBookCreateDTO } from "../dtos/book/CopyBookCreateDTO";
import { NotFoundException } from "../common/errors/error";

export const createBook = async (
  req: Request<{}, {}, BookDTO>,
  res: Response,
) => {
  try {
    let finalUrl = req.body.url || "";
    if (req.file) {
      finalUrl = req.file;
    }

    if (!finalUrl) {
      return res
        .status(400)
        .json({ message: "Image file or URL is required." });
    }

    let copyBooks: CopyBookDTO[] = [];
    if (req.body.copyBooks) {
      copyBooks =
        typeof req.body.copyBooks === "string"
          ? JSON.parse(req.body.copyBooks)
          : req.body.copyBooks;
    }

    const bookDto: BookDTO = {
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher,
      publishYear: req.body.publishYear,
      page: req.body.page,
      category: req.body.category,
      url: finalUrl,
      copyBooks: copyBooks,
    };

    await BookService.createBookWithCopies(bookDto);

    return res.status(201).json({
      message: "Book created successfully.",
    });
  } catch (error) {
    console.error("Controller Error:", error);
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(
            "Không thể xóa file ảnh rác sau khi lỗi hệ thống:",
            err,
          );
        } else {
          console.log(
            `Đã xóa sạch ảnh rác thành công tại đường dẫn: ${req?.file?.path}`,
          );
        }
      });
    }
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const title = req.query.title as string | undefined;

    const result = await BookService.getBooksPaginated(page, size, title);

    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully.",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Error retrieving the list of books:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getBookDetail = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.query;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required.",
      });
    }

    const bookDetail = await BookService.getBookDetail(bookId as string);

    if (!bookDetail) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book details retrieved successfully.",
      data: bookDetail,
    });
  } catch (error) {
    console.error("Error retrieving book details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getDetailByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.query;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: "Barcode parameter is required.",
      });
    }

    const copyBookDetail = await BookService.getCopyBookDetailByBarcode(
      barcode as string,
    );

    if (!copyBookDetail) {
      return res.status(404).json({
        success: false,
        message: "No book found with the given barcode.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book information retrieved successfully.",
      data: copyBookDetail,
    });
  } catch (error) {
    console.error("Error retrieving copy book details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateBook = async (
  req: Request<{ bookId: string }, {}, BookDTO>,
  res: Response,
): Promise<void> => {
  const uploadedFilePath = req.file?.path;
  try {
    const { bookId } = req.query;
    if (!bookId) {
      res
        .status(400)
        .json({ success: false, message: "Book ID not found." });
      return;
    }
    let finalUrl = req.body.url || "";
    if (req.file) {
      finalUrl = req.file;
    }

    if (!finalUrl) {
      res
        .status(400)
        .json({ success: false, message: "Image file or URL is required." });
      return;
    }

    let copyBooks: CopyBookDTO[] = [];
    if (req.body.copyBooks) {
      copyBooks =
        typeof req.body.copyBooks === "string"
          ? JSON.parse(req.body.copyBooks)
          : req.body.copyBooks;
    }

    const bookDto: BookDTO = {
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher,
      publishYear: req.body.publishYear,
      page: req.body.page,
      category: req.body.category,
      url: finalUrl,
      copyBooks: copyBooks,
    };
    const updatedBook = await BookService.updateBook(bookId as string, bookDto);
    res.status(200).json({
      success: true,
      message: "Book information updated successfully",
      data: updatedBook,
    });
  } catch (error: any) {
    if (uploadedFilePath) {
      fs.unlink(uploadedFilePath, (err) => {
        if (err) {
          console.error(
            "Không thể xóa file ảnh rác sau khi lỗi hệ thống:",
            err,
          );
        } else {
          console.log(`Đã dọn dẹp ảnh rác thành công tại: ${uploadedFilePath}`);
        }
      });
    }

    const isNotFound =
      error instanceof NotFoundException || error.message.includes("not found");
    const statusCode = isNotFound ? 404 : 500;
    const message = isNotFound ? error.message : "Internal Server Error";

    res.status(statusCode).json({
      success: false,
      message: message,
    });
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bookId } = req.query;
    await BookService.deleteBook(bookId as string);
    res.status(200).json({
      success: true,
      message: "Book and associated image file deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "An error occurred while deleting the book",
    });
  }
};

export const addCopyBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const copyBookDto: CopyBookCreateDTO = req.body;
    // if (!copyBookDto.barcode || !copyBookDto.location || !copyBookDto.bookId) {
    //   return res.status(400).json({ message: 'Vui lòng cung cấp đủ barcode, location và bookId.' });
    // }
    const newCopyBook = await BookService.addCopyBook(copyBookDto);
    res.status(201).json({
      message: "Thêm bản sao sách thành công!",
      data: newCopyBook,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCopyBook = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { copyBookId } = req.query;
    if (!copyBookId) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp copyBookId cần xóa." });
    }
    await BookService.deleteCopyBook(copyBookId as string);
    return res.status(200).json({
      message: "Xóa bản sao sách thành công!",
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
