import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;

export const connectDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected");
        connection.release();
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(1);
    }
}