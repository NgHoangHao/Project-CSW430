import { LoanStatus } from "../../utils/enums";

export interface LoanDetailDTO {
    loanId: string;
    borrowDate: string;
    dueDate: string;
    status: LoanStatus;
    loanDetails: LoanDetails[];
}

export interface LoanDetails {
    loanDetailId: string;
    returnDate: string;
    status: LoanStatus;
    copyBookId: string;
    url: string;
    bookId: string;
    bookName: string;
    barcode: string;
}

export interface LoanDetailsByPage {
    loanId: string;
    borrowDate: string;
    dueDate: string;
    loanDetailId: string;
    returnDate: string;
    status: LoanStatus;
    bookId: string;
    bookName: string;
    copyBookId: string;
    barcode: string;
    url: string;
}