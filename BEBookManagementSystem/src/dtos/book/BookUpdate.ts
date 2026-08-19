
import multer from "multer";

export interface CopyBookUpdateDTO {
    copyBookId?: string;
    barcode: string;
    location: string;
}
export interface BookUpdate {
    title: string;
    author: string;
    publisher: string;
    publishYear: number;
    page: number;
    category: string;
    url: Express.Multer.File | string;
    copyBooks?: CopyBookUpdateDTO[];
}