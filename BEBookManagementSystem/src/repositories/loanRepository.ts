import { AppDataSource } from "../config/database";
import { Loan } from "../entities/Loan";

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
    }
});