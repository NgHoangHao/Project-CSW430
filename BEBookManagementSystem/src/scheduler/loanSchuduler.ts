import cron from "node-cron";
import { LoanService } from "../services/loanService";

export const startLoanCron = async () => {
    // Chạy ngay khi server khởi động
    console.log("Checking overdue loans on startup...");
    await LoanService.checkOverdueLoans();

    // Chạy mỗi ngày lúc 0h
    cron.schedule(
        "0 0 * * *",
        async () => {
            console.log("Checking overdue loans...");
            await LoanService.checkOverdueLoans();;
        },
        {
            timezone: "Asia/Ho_Chi_Minh",
        }
    );

    console.log("Loan cron started");
};