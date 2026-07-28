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
    }
});