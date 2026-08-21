import { Request, Response } from "express";
import { LoanService } from "../services/loanService";
import { BadRequestException, NotFoundException } from "../common/errors/error";
import { LoanRequest } from "../dtos/loan/LoanRequest";
import { LoanStatus } from "../utils/enums";

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
    confirmLoan: async (req: Request, res: Response) => {
        try {
            const { loanId, status } = req.body;
            let result;
            if (status === LoanStatus.BORROWING) {
                result = await LoanService.confirmLoan(loanId);
            } else if (status === LoanStatus.REJECTED) {
                result = await LoanService.rejectLoan(loanId);
            } else {
                return res.status(400).json({ message: 'Invalid loan status' });
            }
            return res.status(200).json({ message: 'Loan confirmed successfully', data: result });
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

            const { userId, barcodes } = req.body;
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
            return res.status(200).json({ message: 'Get loan by user id successfully', data: result });
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
            return res.status(200).json({ message: 'Get loan detail by loan id successfully', data: result });
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

    getAllLoanDetails: async (req: Request, res: Response) => {
        try {
            const result = await LoanService.getAllLoanDetails();
            return res.status(200).json({
                message: 'Get all loan details successfully',
                data: result,
                success: true
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    },
    getLoanByStatus: async (req: Request, res: Response) => {
        try {
            const status = req.params.status as LoanStatus;
            const result = await LoanService.getLoanByStatus(status);
            return res.status(200).json({
                message: 'Get loan by status successfully',
                success: true,
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                message: error.message,
                success: false,
                data: null
            });
        }
    },
    getLoanDetails: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const page = Number(req.query.page) || 1;
            const size = Number(req.query.size) || 10;
            const status = req.query.status as LoanStatus | undefined;
            const result = await LoanService.getLoanDetails(
                userId,
                page,
                size,
                status
            );
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },
    getHomeData: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            if (!userId) {
                res.status(400).json({ message: 'userId is required' });
                return;
            }
            const response = await LoanService.getLoanHomeData(userId);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error in getHomeData:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    sendLoanEmailNotice: async (req: Request, res: Response) => {
        try {
            const { loanId, customMessage } = req.body;
            if (!loanId) {
                return res.status(400).json({ success: false, message: 'loanId is required' });
            }
            const result = await LoanService.sendLoanEmailNotice(loanId, customMessage);
            return res.status(200).json({
                success: true,
                message: `Email notification sent successfully to ${result.userEmail}`,
                data: result
            });
        } catch (error: any) {
            if (error instanceof NotFoundException) {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error instanceof BadRequestException) {
                return res.status(400).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: error.message || 'Failed to send email notice' });
        }
    }
}