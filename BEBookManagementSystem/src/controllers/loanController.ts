import { Request, Response } from "express";
import { LoanService } from "../services/loanService";
import { BadRequestException, NotFoundException } from "../common/errors/error";
import { LoanRequest } from "../dtos/loan/LoanRequest";

export const LoanController = {
    createLoan: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const loanRequest: LoanRequest = req.body;
            const result = await LoanService.createNewLoan(userId, loanRequest);
            return res.status(201).json({ message: 'Loan created successfully', data: result });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                return res.status(404).json({ message: error.message });
            }
            if (error instanceof BadRequestException) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: error.message });
        }
    },
    returnBookByBarcode: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { barcodes } = req.body;
            const result = await LoanService.returnBookByBarcode(userId, barcodes);
            return res.status(200).json({ message: 'Return book successfully', data: result });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                return res.status(404).json({ message: error.message });
            }
            if (error instanceof BadRequestException) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: error.message });
        }
    },
    getAllLoanByUserId: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const result = await LoanService.getLoanByUserId(userId);
            return res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: error.message });
        }
    },
    getLoanDetailByLoanId: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const loanId = req.params.loanId as string;
            const result = await LoanService.getLoanDetailByLoanId(userId, loanId);
            return res.status(200).json(result);
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                return res.status(404).json({ message: error.message });
            }
            if (error instanceof BadRequestException) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: error.message });
        }
    },

    getAllLoanDetailsByPage: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await LoanService.getAllLoanDetailsByPage(page, limit);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}