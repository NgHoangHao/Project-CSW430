import { AppDataSource } from "../config/database";
import { Loan } from "../entities/Loan";
import { LoanDetail } from "../entities/LoanDetail";

export const LoanRepository = AppDataSource.getRepository(Loan).extend({

    async getLoanByUserId(userId: string) {
        return this.createQueryBuilder('loan')
            .leftJoinAndSelect('loan.user', 'user')
            .where('user.userId = :userId', { userId })
            .orderBy('loan.borrowDate', 'DESC')
            .getMany();
    },
    async getLoanDetailsByLoanId(loanId: string) {
        return this.createQueryBuilder('loan')
            .leftJoinAndSelect('loan.loanDetails', 'loanDetail')
            .leftJoinAndSelect('loanDetail.copyBook', 'copyBook')
            .leftJoinAndSelect('copyBook.book', 'book')
            .leftJoinAndSelect('loan.user', 'user')
            .where('loan.loanId = :loanId', { loanId })
            .getOne();
    },
    async getAllLoanDetailsByPage(page: number, limit: number) {
        return this.manager.getRepository(LoanDetail)
            .createQueryBuilder('loanDetail')
            .leftJoinAndSelect('loanDetail.loan', 'loan')
            .leftJoinAndSelect('loanDetail.copyBook', 'copyBook')
            .leftJoinAndSelect('copyBook.book', 'book')
            .leftJoinAndSelect('loan.user', 'user')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
    }
});