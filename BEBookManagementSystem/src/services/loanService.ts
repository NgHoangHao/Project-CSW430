import { In } from "typeorm";
import { BadRequestException, NotFoundException } from "../common/errors/error";
import { AppDataSource } from "../config/database";
import { LoanDTO } from "../dtos/loan/LoanDTO";
import { LoanRequest } from "../dtos/loan/LoanRequest";
import { CopyBook } from "../entities/CopyBook";
import { Loan } from "../entities/Loan";
import { LoanDetail } from "../entities/LoanDetail";
import { LoanRepository } from "../repositories/loanRepository";
import { getUserById } from "../repositories/userRepository"
import { BookStatus, CopyBookStatus, LoanStatus, RoleName } from "../utils/enums";
import { Book } from "../entities/Book";
import { LoanDetailDTO } from "../dtos/loan/LoanDetailDTO";
import { loanDetailRepository } from "../repositories/loanDetailRepository";
import { LoanDetailResponse, LoanHomeResponse, LoanResponse } from "../dtos/loan/LoanResponse";
import { userRepository } from "../repositories/userRepository";

export const LoanService = {

    createNewLoan: async (userId: string, loanRequest: LoanRequest) => {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const user = await getUserById(userId);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            const newLoan = new Loan();
            newLoan.user = user;
            newLoan.borrowDate = new Date();
            newLoan.dueDate = new Date(loanRequest.dueDate);
            newLoan.status = LoanStatus.PENDING;
            const savedLoan = await transactionalEntityManager.save(newLoan);
            for (const copyBookId of loanRequest.bookIds) {
                const copyBook = await transactionalEntityManager.findOne(CopyBook, {
                    where: { copyBookId },
                    lock: { mode: 'pessimistic_write' },
                    relations: { book: true }
                });
                if (!copyBook) {
                    throw new NotFoundException('Copy book not found: ' + copyBookId);
                }
                if (copyBook.status === CopyBookStatus.BORROWED) {
                    throw new BadRequestException('Copy book is already borrowed: ' + copyBook.barcode);
                }
                const newLoanDetail = new LoanDetail();
                newLoanDetail.copyBook = copyBook;
                newLoanDetail.loan = savedLoan;
                newLoanDetail.status = LoanStatus.PENDING;
                await transactionalEntityManager.save(newLoanDetail);
                copyBook.status = CopyBookStatus.BORROWED;
                await transactionalEntityManager.save(copyBook);
                if (!copyBook.book) {
                    throw new NotFoundException('Associated book not found for this copy book');
                }
                const bookId = copyBook.book.bookId;

                const countAvailableCopy = await transactionalEntityManager.count(CopyBook, {
                    where: { book: { bookId: bookId }, status: CopyBookStatus.AVAILABLE }
                });
                if (countAvailableCopy === 0) {
                    const book = await transactionalEntityManager.findOne(Book, {
                        where: { bookId: bookId },
                        lock: { mode: 'pessimistic_write' }
                    });
                    if (book) {
                        book.status = BookStatus.OUT_OF_STOCK;
                        await transactionalEntityManager.save(book);
                    }
                }
            }
            const fullLoanData = await transactionalEntityManager.findOne(Loan, {
                where: { loanId: savedLoan.loanId },
                relations: { user: false, loanDetails: { copyBook: { book: false } } }
            });
            return fullLoanData;
        })
    },

    confirmLoan: async (loanId: string) => {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const loan = await transactionalEntityManager.findOne(Loan, {
                where: { loanId },
                relations: { user: false, loanDetails: { copyBook: { book: false } } }
            });
            if (!loan) {
                throw new NotFoundException('Loan not found');
            }
            if (loan.status !== LoanStatus.PENDING) {
                throw new BadRequestException('Loan is not in pending status');
            }
            loan.status = LoanStatus.BORROWING;
            if (loan.loanDetails && loan.loanDetails.length > 0) {
                for (const detail of loan.loanDetails) {
                    detail.status = LoanStatus.BORROWING;
                    await transactionalEntityManager.save(detail);
                }
            }
            await transactionalEntityManager.save(loan);
            return loan;
        })
    },
    rejectLoan: async (loanId: string) => {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const loan = await transactionalEntityManager.findOne(Loan, {
                where: { loanId },
                relations: {
                    loanDetails: {
                        copyBook: {
                            book: true
                        }
                    }
                }
            });

            if (!loan) {
                throw new NotFoundException('Loan not found');
            }

            if (loan.status !== LoanStatus.PENDING) {
                throw new BadRequestException('Loan is not in pending status');
            }
            if (loan.loanDetails && loan.loanDetails.length > 0) {
                for (const detail of loan.loanDetails) {
                    const copyBook = detail.copyBook;
                    if (copyBook) {
                        copyBook.status = CopyBookStatus.AVAILABLE;
                        await transactionalEntityManager.save(copyBook);
                        const book = copyBook.book;
                        if (book && book.status === BookStatus.OUT_OF_STOCK) {
                            book.status = BookStatus.AVAILABLE;
                            await transactionalEntityManager.save(book);
                        }
                    }
                    detail.status = LoanStatus.REJECTED;
                    await transactionalEntityManager.save(detail);
                }
            }

            loan.status = LoanStatus.REJECTED;
            await transactionalEntityManager.save(loan);

            return loan;
        })
    },

    returnBookByBarcode: async (userId: string, barcodes: string[]) => {
        const user = await getUserById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (!barcodes || barcodes.length === 0) {
            throw new BadRequestException('No barcodes provided');
        }
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const copyBooks = await transactionalEntityManager.find(CopyBook, {
                where: { barcode: In(barcodes) },
                relations: { book: true }
            })
            if (copyBooks.length !== barcodes.length) {
                const foundBarcodes = copyBooks.map(cb => cb.barcode);
                const missingBarcodes = barcodes.filter(b => !foundBarcodes.includes(b));
                throw new NotFoundException(`Copy books not found: ${missingBarcodes.join(', ')}`)
            }
            const copyBookIds = copyBooks.map(cb => cb.copyBookId);
            const loanDetails = await transactionalEntityManager.find(LoanDetail, {
                where: {
                    copyBook: { copyBookId: In(copyBookIds) },
                    status: LoanStatus.BORROWING,
                    loan: { user: { userId } }
                },
                relations: { loan: true, copyBook: true }
            });
            if (loanDetails.length !== copyBooks.length) {
                const foundBookIds = loanDetails.map(ld => ld.copyBook.copyBookId);
                const missingBarcodes = copyBooks.filter(cb => !foundBookIds.includes(cb.copyBookId)).map(cb => cb.barcode);
                throw new NotFoundException(`One or more books were not borrowed by this user or are not in borrowing status: ${missingBarcodes.join(', ')}`);
            }
            const today = new Date();
            const affectedLoanIds = new Set<string>();
            const affectedBookIds = new Set<string>();
            for (const detail of loanDetails) {
                const dueDate = new Date(detail.loan.dueDate);
                if (today.getTime() > dueDate.getTime()) {
                    detail.status = LoanStatus.OVERDUE;
                } else {
                    detail.status = LoanStatus.RETURNED;
                }
                detail.returnDate = today;
                affectedLoanIds.add(detail.loan.loanId);
                const linkedCopyBook = copyBooks.find(cb => cb.copyBookId === detail.copyBook.copyBookId)
                if (linkedCopyBook) {
                    linkedCopyBook.status = CopyBookStatus.AVAILABLE;
                    await transactionalEntityManager.save(linkedCopyBook)
                    const bookId = linkedCopyBook.book.bookId || (linkedCopyBook as any).bookId;
                    if (bookId) {
                        affectedBookIds.add(bookId);
                    }
                }
            }
            await transactionalEntityManager.save(loanDetails)
            for (const loanId of affectedLoanIds) {
                const remainingBorrowingBooks = await transactionalEntityManager.count(LoanDetail, {
                    where: {
                        loan: { loanId },
                        status: LoanStatus.BORROWING
                    }
                })
                if (remainingBorrowingBooks === 0) {
                    const hasOverdueBook = await transactionalEntityManager.count(LoanDetail, {
                        where: {
                            loan: { loanId },
                            status: LoanStatus.OVERDUE
                        }
                    })
                    const finalStatus = hasOverdueBook > 0 ? LoanStatus.OVERDUE : LoanStatus.RETURNED;
                    await transactionalEntityManager.update(Loan, { loanId }, { status: finalStatus });
                }
            }
            for (const bookId of affectedBookIds) {
                const book = await transactionalEntityManager.findOne(Book, {
                    where: { bookId }
                })
                if (book && book.status === BookStatus.OUT_OF_STOCK) {
                    book.status = BookStatus.AVAILABLE;
                    await transactionalEntityManager.save(book);
                }
            }
        });
    },

    getLoanByUserId: async (userId: string): Promise<LoanDTO[]> => {
        const user = await getUserById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const listLoan = await LoanRepository.getLoanByUserId(userId);
        const responseLoan: LoanDTO[] = listLoan.map((loan) => ({
            loanId: loan.loanId,
            borrowDate: loan.borrowDate,
            dueDate: loan.dueDate,
            status: loan.status,
            createdAt: loan.createdAt,
            userId: loan.user.userId,
            userName: loan.user.userName
        }))
        return responseLoan;
    },

    getLoanDetailByLoanId: async (userId: string, loanId: string): Promise<LoanDetailDTO | null> => {
        const user = await getUserById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const loan = await LoanRepository.getLoanDetailsByLoanId(loanId);

        if (!loan) {
            throw new NotFoundException('Loan not found');
        }

        // Allow if user is ADMIN/LIBRARIAN, OR if the user is the owner of the loan
        const isAdminOrLibrarian = user.roles.some((r: any) => r.roleName === RoleName.ADMIN || r.roleName === RoleName.LIBRARIAN);
        const isOwner = loan.user.userId === userId;
        if (!isAdminOrLibrarian && !isOwner) {
            throw new BadRequestException('You do not have permission to view this loan');
        }
        const responseLoanDetails: LoanDetailDTO = {
            loanId: loan.loanId,
            borrowDate: loan.borrowDate.toISOString().slice(0, 10),
            dueDate: loan.dueDate.toISOString().slice(0, 10),
            status: loan.status,
            userId: loan.user.userId,
            userName: loan.user.userName,
            loanDetails: loan.loanDetails.map((ld) => {
                return {
                    loanDetailId: ld.loanDetailId,
                    copyBookId: ld.copyBook.copyBookId,
                    url: ld.copyBook.book.url,
                    bookId: ld.copyBook.book.bookId,
                    bookName: ld.copyBook.book.title,
                    barcode: ld.copyBook.barcode,
                    returnDate: ld.returnDate ? ld.returnDate.toISOString().slice(0, 10) : '',
                    status: ld.status,
                }
            })
        }
        return responseLoanDetails;
    },

    getAllLoanDetails: async () => {
        const loanDetails = await LoanRepository.getAllLoanDetails();
        const data = loanDetails.map((ld) => ({
            loanId: ld.loan?.loanId || '',
            borrowDate: ld.loan?.borrowDate ? new Date(ld.loan.borrowDate).toISOString().slice(0, 10) : '',
            dueDate: ld.loan?.dueDate ? new Date(ld.loan.dueDate).toISOString().slice(0, 10) : '',
            loanDetailId: ld.loanDetailId,
            returnDate: ld.returnDate ? new Date(ld.returnDate).toISOString().slice(0, 10) : '',
            status: ld.status,
            bookId: ld.copyBook?.book?.bookId || '',
            bookName: ld.copyBook?.book?.title || '',
            copyBookId: ld.copyBook?.copyBookId || '',
            barcode: ld.copyBook?.barcode || '',
            url: ld.copyBook?.book?.url || '',
            userName: ld.loan?.user?.userName || '',
            userId: ld.loan?.user?.userId || '',
        }));
        return data;
    },
    getLoanByStatus: async (status: LoanStatus) => {
        const listLoan = await LoanRepository.getLoanByStatus(status);
        const responseLoan: LoanDetailDTO[] = listLoan.map((loan) => ({
            loanId: loan.loanId,
            borrowDate: loan.borrowDate.toISOString().slice(0, 10),
            dueDate: loan.dueDate.toISOString().slice(0, 10),
            status: loan.status,
            userId: loan.user?.userId,
            userName: loan.user?.userName,
            loanDetails: loan.loanDetails.map((ld) => {
                return {
                    loanDetailId: ld.loanDetailId,
                    copyBookId: ld.copyBook.copyBookId,
                    url: ld.copyBook.book.url,
                    bookId: ld.copyBook.book.bookId,
                    bookName: ld.copyBook.book.title,
                    barcode: ld.copyBook.barcode,
                    returnDate: ld.returnDate ? ld.returnDate.toISOString().slice(0, 10) : '',
                    status: ld.status,
                }
            })
        }))
        return responseLoan;
    },

    getLoanDetails: async (userId: string, page = 1, size = 10, status?: LoanStatus): Promise<LoanResponse> => {
        const { items: loanDetails, total } =
            await loanDetailRepository.getLoanDetailsByUserId(
                userId,
                page,
                size,
                status
            );
        const now = new Date();

        const list: LoanDetailResponse[] = loanDetails.map(item => {
            const dueDate = new Date(item.loan.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const borrowedRemain =
                Math.floor(
                    (dueDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
            return {
                borrowDate: item.loan.borrowDate,
                dueDate: item.loan.dueDate,
                author: item.copyBook.book.author,
                url: item.copyBook.book.url,
                title: item.copyBook.book.title,
                status: item.status,
                borrowedRemain
            };
        });
        const response: LoanResponse = {
            page,
            size,
            total,
            totalPages: Math.ceil(total / size),
            list
        };
        return response;
    },
    async getLoanHomeData(userId: string): Promise<LoanHomeResponse> {
        const stats = await LoanRepository.getLoanStatsByUserId(userId);
        const recentLoanDetail = await loanDetailRepository.getRecentLoanDetailByUserId(userId);
        let progress = 0;
        let recentLoanResponse = null;

        if (recentLoanDetail) {
            const borrowDate = recentLoanDetail.loan.borrowDate;
            const dueDate = recentLoanDetail.loan.dueDate;

            const endDate = recentLoanDetail.returnDate ? recentLoanDetail.returnDate : new Date();
            const msPerDay = 1000 * 60 * 60 * 24;

            const totalDay = (dueDate.getTime() - borrowDate.getTime()) / msPerDay;
            const borrowedDays = (endDate.getTime() - borrowDate.getTime()) / msPerDay;
            if (totalDay > 0) {
                progress = Math.round((borrowedDays / totalDay) * 100);
                progress = Math.max(0, Math.min(progress, 100));
            }
            const borrowedRemain = Math.round(totalDay - borrowedDays);
            recentLoanResponse = {
                borrowDate: borrowDate,
                dueDate: dueDate,
                title: recentLoanDetail.copyBook.book.title,
                author: recentLoanDetail.copyBook.book.author,
                url: recentLoanDetail.copyBook.book.url,
                status: recentLoanDetail.status,
                borrowedRemain: borrowedRemain
            } as LoanDetailResponse;
        }
        return {
            totalBorrowing: Number(stats?.totalBorrowing) || 0,
            totalOverdue: Number(stats?.totalOverdue) || 0,
            totalReturned: Number(stats?.totalReturned) || 0,
            progress: progress,
            recentLoan: recentLoanResponse
        };
    },
    checkOverdueLoans: async () => {
        const loans = await LoanRepository.getLoansToCheckOverdue();
        for (const loan of loans) {
            let hasOverdue = false;
            for (const detail of loan.loanDetails) {
                if (detail.status === LoanStatus.BORROWING) {
                    detail.status = LoanStatus.OVERDUE;
                    await loanDetailRepository.updateLoanDetail(detail);
                    hasOverdue = true;
                }
            }
            if (!hasOverdue) continue;
            loan.status = LoanStatus.OVERDUE;
            await LoanRepository.updateLoanStatus(loan);
            await userRepository.deductCredit(loan.user, 10);
            console.log(`Loan ${loan.loanId} -> OVERDUE`);
        }
    }
}