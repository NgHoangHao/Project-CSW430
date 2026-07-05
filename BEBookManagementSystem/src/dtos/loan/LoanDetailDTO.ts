import { LoanStatus } from "../../utils/enums";

export interface LoanDetails {
    loanDetailId: string;
    returnDate: Date;
    status: LoanStatus;
    loanId: string;
    copyBookId: string;
    url: string;
}