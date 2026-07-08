import { CopyBookDTO } from "./CopyBookDTO";
import multer from "multer";

export interface BookDTO {
    title: string;
    author: string;
    publisher: string;
    publishYear: number;
    page: number;
    category: string;
    url: Express.Multer.File;
    copyBooks: CopyBookDTO[];
}