import { BookStatus, CopyBookStatus } from "../../utils/enums";
import { CopyBookDTO } from "./CopyBookDTO";

export interface CopyBookDetail {
    title: string;
    author: string;
    publisher: string;
    publishYear: number;
    category: string;
    url: string;
    copyBookId: string;
    barcode: string;
    status: CopyBookStatus;
    location: string;
}