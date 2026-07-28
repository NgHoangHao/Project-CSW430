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

export interface LoanResponse {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    list: LoanDetailResponse[];
}