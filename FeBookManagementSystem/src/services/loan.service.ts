import api from "../lib/axios"
import { LoanDetailsByPage } from "../types/loan"

export const loanService = {
    getLoanDetailsByPage: async (page: number, limit: number): Promise<{ data: LoanDetailsByPage[]; meta: any }> => {
        const res = await api.get("/loan/get-loan-details-pagination", {
            params: {
                page,
                limit,
            },
        });
        return {
            data: res.data?.data?.data || [],
            meta: res.data?.data?.meta || {}
        };
    },
    returnBookByBarcode: async (barcodes: string[]): Promise<any> => {
        const res = await api.post('/loan/return-book', { barcodes });
        return res.data;
    }
}