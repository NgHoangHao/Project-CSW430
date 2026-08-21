import { AppDataSource } from '../config/database';
import { Loan } from '../entities/Loan';
import { User } from '../entities/User';
import { LoanStatus } from '../utils/enums';
import { mailService } from '../services/mailService';

export const testSendOverdueMail = async (targetEmail?: string) => {
  try {
    if (targetEmail) {
      console.log(`🚀 Triggering test overdue email to: ${targetEmail}...`);
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ email: targetEmail });
      const recipientName = user?.userName || 'Bạn đọc';

      await mailService.sendOverdueNotice(
        targetEmail,
        recipientName,
        'Lập trình TypeScript Nâng Cao',
        new Date().toLocaleDateString('vi-VN'),
        'BK-998823'
      );
      console.log(`✅ Test overdue email sent successfully to ${recipientName} (${targetEmail})!`);
      return;
    }

    console.log('🔍 Scanning database for overdue loans...');
    const loanRepo = AppDataSource.getRepository(Loan);
    const today = new Date();

    const overdueLoans = await loanRepo.find({
      relations: {
        user: true,
        loanDetails: {
          copyBook: {
            book: true,
          },
        },
      },
    });

    const expiredLoans = overdueLoans.filter(
      (loan) => new Date(loan.dueDate) < today && loan.status === LoanStatus.BORROWING
    );

    if (expiredLoans.length === 0) {
      console.log('ℹ️ No overdue loans found in DB (dueDate < today with status BORROWING).');
      console.log('💡 Tip: You can test sending directly by specifying an email parameter:');
      console.log('   npm run test:overdue-mail -- your_email@gmail.com');
      return;
    }

    console.log(`📌 Found ${expiredLoans.length} overdue loan(s). Sending email notifications...`);

    for (const loan of expiredLoans) {
      const userEmail = loan.user?.email;
      const userName = loan.user?.userName || 'Bạn đọc';
      const dueDateFormatted = new Date(loan.dueDate).toLocaleDateString('vi-VN');

      if (!userEmail) continue;

      for (const detail of loan.loanDetails) {
        const bookTitle = detail.copyBook?.book?.title || 'Sách thư viện';
        const barcode = detail.copyBook?.barcode || 'N/A';

        console.log(`✉️ Sending overdue email to ${userEmail} for book "${bookTitle}"...`);
        await mailService.sendOverdueNotice(
          userEmail,
          userName,
          bookTitle,
          dueDateFormatted,
          barcode
        );
      }
    }

    console.log('🎉 Overdue email scan and notification process completed!');
  } catch (error) {
    console.error('❌ Error during overdue email test:', error);
  }
};

// Standalone runner
if (require.main === module) {
  const targetEmailArg = process.argv[2];
  AppDataSource.initialize()
    .then(async () => {
      await testSendOverdueMail(targetEmailArg);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      process.exit(1);
    });
}
