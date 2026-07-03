import { BookStatus } from "../../utils/enums";
import { CopyBookDTO } from "./CopyBookDTO";

export interface BookDetail{
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
      totalAvailableCopy:number;
      availableBooks: CopyBookDTO[];

}