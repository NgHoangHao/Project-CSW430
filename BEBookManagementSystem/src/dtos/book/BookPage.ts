import { BookStatus } from "../../utils/enums";

export interface BookPage{
      bookId: string;
      title: string;
      author: string;
      publisher: string;
      publishYear: number;
      category: string;
      url: string;
      status: BookStatus;
      createdAt: Date;
      updatedAt: Date;
}