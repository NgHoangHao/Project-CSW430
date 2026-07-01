
import { AppDataSource } from "./config/database";



import app from "./app";

const PORT = process.env.PORT || 3000;
AppDataSource.initialize()
    .then(() => {
        console.log("Database đã kết nối thành công và tự động tạo bảng!");
    })
    .catch((error) => console.log("Lỗi kết nối:", error));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});