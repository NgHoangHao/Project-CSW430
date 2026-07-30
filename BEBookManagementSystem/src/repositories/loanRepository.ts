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
    },
    async getLoanStatsByUserId(userId: string) {
        return await this.manager
            .getRepository(Loan)
            .createQueryBuilder("loan")
            .leftJoin("loan.loanDetails", "loanDetail")
            .where("loan.userId = :userId", { userId })
            .select([
                "COALESCE(SUM(CASE WHEN loanDetail.status = :borrowing THEN 1 ELSE 0 END), 0) AS totalBorrowing",
                "COALESCE(SUM(CASE WHEN loanDetail.status = :overdue THEN 1 ELSE 0 END), 0) AS totalOverdue",
                "COALESCE(SUM(CASE WHEN loanDetail.status = :returned THEN 1 ELSE 0 END), 0) AS totalReturned",
            ])
            .setParameters({
                borrowing: LoanStatus.BORROWING,
                overdue: LoanStatus.OVERDUE,
                returned: LoanStatus.RETURNED,
            })
            .getRawOne();
    }
});