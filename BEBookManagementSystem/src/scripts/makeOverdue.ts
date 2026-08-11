import { AppDataSource } from '../config/database';
import { Loan } from '../entities/Loan';
import { LoanDetail } from '../entities/LoanDetail';
import { LoanStatus } from '../utils/enums';

export const makeLoansOverdue = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected.');

    const loanRepo = AppDataSource.getRepository(Loan);
    const loanDetailRepo = AppDataSource.getRepository(LoanDetail);

    // Find active loans (exclude RETURNED and REJECTED)
    const loans = await loanRepo.find({ relations: { loanDetails: true } });
    const activeLoans = loans.filter(l => l.status !== LoanStatus.RETURNED && l.status !== LoanStatus.REJECTED);

    if (activeLoans.length === 0) {
      console.log('⚠️ No active (BORROWING / PENDING) loans found in database.');
      process.exit(0);
    }

    const pastDueDate = new Date('2026-08-01'); // Past due date

    for (const loan of activeLoans) {
      loan.dueDate = pastDueDate;
      loan.status = LoanStatus.OVERDUE;
      await loanRepo.save(loan);

      if (loan.loanDetails && loan.loanDetails.length > 0) {
        for (const detail of loan.loanDetails) {
          if (detail.status !== LoanStatus.RETURNED && detail.status !== LoanStatus.REJECTED) {
            detail.status = LoanStatus.OVERDUE;
            await loanDetailRepo.save(detail);
          }
        }
      }
    }

    console.log(`🎉 Successfully updated ${activeLoans.length} active loan(s) to OVERDUE status with past due date (${pastDueDate.toISOString().slice(0, 10)})!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating loans:', error);
    process.exit(1);
  }
};

makeLoansOverdue();
