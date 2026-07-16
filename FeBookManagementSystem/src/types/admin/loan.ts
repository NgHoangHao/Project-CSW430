export interface LoanDetailsByPageAdmin {
    loanId: string;
    borrowDate: string;
    dueDate: string;
    loanDetailId: string;
    returnDate: string;
    status: 'PENDING' | 'REJECTED' | 'BORROWING' | 'RETURNED' | 'OVERDUE';
    bookId: string;
    bookName: string;
    copyBookId: string;
    barcode: string;
    url: string;
    userName?: string;
    userId?: string;
}