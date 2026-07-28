

export interface CreateLoanRequest {
    bookIds: string[];
    dueDate: string;
}

export interface ConfirmLoanRequest {
    loanId: string;
    status: string;
}

export interface LoanUser {
    loanId: string;
    borrowDate: string;
    dueDate: string;
    status: string;
    userId: string;
    userName: string;
}

export interface LoanDetailDTO {
    loanId: string;
    borrowDate: string;
    dueDate: string;
    status: 'PENDING' | 'REJECTED' | 'BORROWING' | 'RETURNED' | 'OVERDUE';
    loanDetails: LoanDetails[];
    userId?: string;
    userName?: string;
}

export interface LoanDetails {
    loanDetailId: string;
    returnDate: string;
    status: 'PENDING' | 'REJECTED' | 'BORROWING' | 'RETURNED' | 'OVERDUE';
    copyBookId: string;
    url: string;
    bookId: string;
    bookName: string;
    barcode: string;
}

export interface LoanDetailResponse {
    borrowDate: Date;
    dueDate: Date;
    author: string;
    url: string;
    title:string;
    status: 'PENDING' | 'REJECTED' | 'BORROWING' | 'RETURNED' | 'OVERDUE';
    borrowedRemain: number;
}

export interface LoanResponse {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    list: LoanDetailResponse[];
}