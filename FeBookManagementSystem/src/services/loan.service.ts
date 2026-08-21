import api from "../lib/axios"
import { LoanDetailsByPageAdmin } from "../types/admin/loan";
import { ConfirmLoanRequest, CreateLoanRequest, LoanDetailDTO, LoanHomeResponse, LoanResponse, LoanUser } from "../types/loan"
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
    returnBookByBarcode: async (userId: string, barcodes: string[]): Promise<any> => {
        const res = await api.post('/loan/return-book', { userId, barcodes });
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
    },
    getLoanByUser: async (page: number, size: number, status?: string) => {
        const res = await api.get("/loan/loan-detail", {
            params: {
                page,
                size,
                ...(status?.trim() ? { status } : {}),
            },
        });
        return res;
    },
    getLoanHome: async (): Promise<LoanHomeResponse> => {
        const res = await api.get(`/loan/loan-home`);
        return res.data;
    },
    sendLoanEmailNotice: async (loanId: string, customMessage?: string): Promise<any> => {
        const res = await api.post('/loan/send-email-notice', { loanId, customMessage });
        return res.data;
    },
}