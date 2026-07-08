
import multer from "multer";

export interface BookUpdate {
    title: string;
    author: string;
    publisher: string;
    publishYear: number;
    page: number;
    category: string;
    url: Express.Multer.File;
}