import api from "../lib/axios"
import { LoanDetailsByPageAdmin } from "../types/admin/loan";
import { ConfirmLoanRequest, CreateLoanRequest, LoanDetailDTO, LoanUser } from "../types/loan"
import { ApiResponse } from "../types/response/ApiResponse";

export const loanService = {
    createLoan: async (loanRequest: CreateLoanRequest): Promise<any> => {
        const res = await api.post('/loan/create-loan', loanRequest);
        return res.data;
    },
    confirmLoan: async (loanRequest: ConfirmLoanRequest): Promise<any> => {
        const res = await api.post(`/loan/confirm-loan/`, loanRequest);
        return res.data;
    },
    getLoanDetails: async (): Promise<ApiResponse<LoanDetailsByPageAdmin[]>> => {
        const res = await api.get("/loan/get-all-loan-details");
        return res.data;
    },
    returnBookByBarcode: async (barcodes: string[]): Promise<any> => {
        const res = await api.post('/loan/return-book', { barcodes });
        return res.data;
    },
    getMyLoans: async (): Promise<ApiResponse<LoanUser[]>> => {
        const res = await api.get('/loan/get-loan');
        return res.data;
    },
    getLoanDetail: async (loanId: string): Promise<ApiResponse<LoanDetailDTO>> => {
        const res = await api.get(`/loan/get-loan-detail/${loanId}`);
        return res.data;
    },
    getLoanByStatus: async (status: string): Promise<ApiResponse<LoanDetailDTO[]>> => {
        const res = await api.get(`/loan/get-loan-by-status/${status}`);
        return res.data;
    }
}