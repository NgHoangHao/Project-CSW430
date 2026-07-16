

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
