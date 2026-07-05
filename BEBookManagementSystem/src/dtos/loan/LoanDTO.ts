import { LoanStatus } from "../../utils/enums";

export interface LoanDTO {
    loanId: string;
    borrowDate: Date;
    dueDate: Date;
    status: LoanStatus;
    createdAt: Date;
    userId: string;
    userName: string;
}