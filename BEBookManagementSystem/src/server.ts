
import { AppDataSource } from "./config/database";
import app from "./app";
import { seedAdminAccount } from "./scripts/seedAdmin";

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

AppDataSource.initialize()
    .then(async () => {
        console.log("Database đã kết nối thành công và tự động tạo bảng!");
        await seedAdminAccount();
    })
    .catch((error) => console.log("Lỗi kết nối:", error));
app.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
});