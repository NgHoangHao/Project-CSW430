import cron from "node-cron";
import { addCreditForAllUser } from "../services/userService";
export const startUserCron = async () => {


    // Chạy mỗi ngày lúc 0h
    cron.schedule(
        "0 0 * * *",
        async () => {
            console.log("Checking overdue loans...");
            await addCreditForAllUser();
        },
        {
            timezone: "Asia/Ho_Chi_Minh",
        }
    );

    console.log("User cron started");
};