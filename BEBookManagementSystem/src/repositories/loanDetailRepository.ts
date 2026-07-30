import { AppDataSource } from "../config/database";
import { LoanDetail } from "../entities/LoanDetail";
import { LoanStatus } from "../utils/enums";

export const loanDetailRepository = AppDataSource.getRepository(LoanDetail).extend({

    async getLoanDetailsByUserId(
        userId: string,
        page: number,
        size: number,
        status?: LoanStatus
    ) {
        const qb = loanDetailRepository
            .createQueryBuilder("loanDetail")
            .leftJoinAndSelect("loanDetail.loan", "loan")
            .leftJoinAndSelect("loanDetail.copyBook", "copyBook")
            .leftJoinAndSelect("copyBook.book", "book")
            .where("loan.userId = :userId", { userId });
        if (status) {
            qb.andWhere("loanDetail.status = :status", { status });
        }
        const [items, total] = await qb
            .orderBy("loan.borrowDate", "DESC")
            .skip((page - 1) * size)
            .take(size)
            .getManyAndCount();
        return {
            items,
            total
        };
    },
    // async getLoanStatsByUserId(userId: string) {
    //     return await loanDetailRepository.createQueryBuilder('loanDetail')
    //         .innerJoin('loanDetail.loan', 'loan')
    //         .where('loan.userId = :userId', { userId })
    //         .select([
    //             `COALESCE(SUM(CASE WHEN loanDetail.status = '${LoanStatus.BORROWING}' THEN 1 ELSE 0 END), 0) AS totalBorrowing`,
    //             `COALESCE(SUM(CASE WHEN loanDetail.status = '${LoanStatus.OVERDUE}' THEN 1 ELSE 0 END), 0) AS totalOverdue`,
    //             `COALESCE(SUM(CASE WHEN loanDetail.status = '${LoanStatus.RETURNED}' THEN 1 ELSE 0 END), 0) AS totalReturned`
    //         ])
    //         .getRawOne();
    // },

    async getRecentLoanDetailByUserId(userId: string): Promise<LoanDetail | null> {
        return await loanDetailRepository
            .createQueryBuilder('loanDetail')
            .innerJoinAndSelect('loanDetail.loan', 'loan')
            .innerJoinAndSelect('loanDetail.copyBook', 'copyBook')
            .innerJoinAndSelect('copyBook.book', 'book')
            .where('loan.userId = :userId', { userId })
            .andWhere('loan.status = :status', { status: LoanStatus.BORROWING })
            .orderBy('loan.borrowDate', 'DESC')
            .getOne();
    }
});