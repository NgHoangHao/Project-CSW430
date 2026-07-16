export interface LoanDetailsByPage {
    loanId: string;
    borrowDate: string;
    dueDate: string;
    loanDetailId: string;
    returnDate: string;
    status: 'BORROWING' | 'RETURNED' | 'OVERDUE';
    bookId: string;
    bookName: string;
    copyBookId: string;
    barcode: string;
    url: string;
    userName?: string;
    userId?: string;
}