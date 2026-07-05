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
});