import { LoanStatus } from "../../utils/enums";

export interface LoanDetailResponse {
    borrowDate: Date;
    dueDate: Date;
    title:string;
    author: string;
    url: string;
    status: LoanStatus;
    borrowedRemain: number;
}

export interface LoanHomeResponse{
    totalBorrowing:number;
    totalOverdue:number;
    totalReturned:number;
    progress:number;
    recentLoan:LoanDetailResponse|null;
}

export interface LoanResponse {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    list: LoanDetailResponse[];
}