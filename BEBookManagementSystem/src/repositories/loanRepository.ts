import { AppDataSource } from "../config/database";
import { Loan } from "../entities/Loan";
import { LoanDetail } from "../entities/LoanDetail";
import { LoanStatus } from "../utils/enums";

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
    async getAllLoanDetails() {
        return this.manager.getRepository(LoanDetail)
            .createQueryBuilder('loanDetail')
            .leftJoinAndSelect('loanDetail.loan', 'loan')
            .leftJoinAndSelect('loanDetail.copyBook', 'copyBook')
            .leftJoinAndSelect('copyBook.book', 'book')
            .leftJoinAndSelect('loan.user', 'user')
            .getMany();
    },
    async getLoanByStatus(status: LoanStatus) {
        return this.manager.getRepository(Loan)
            .createQueryBuilder('loan')
            .leftJoinAndSelect('loan.loanDetails', 'loanDetail')
            .leftJoinAndSelect('loanDetail.copyBook', 'copyBook')
            .leftJoinAndSelect('copyBook.book', 'book')
            .leftJoinAndSelect('loan.user', 'user')
            .where('loan.status = :status', { status })
            .getMany();
    }
});