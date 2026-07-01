import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { Book } from "../entities/Book";
import { CopyBook } from "../entities/CopyBook";
import { Loan } from "../entities/Loan";
import { LoanDetail } from "../entities/LoanDetail";
import dotenv from 'dotenv'

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [User, Role, Book, CopyBook, Loan, LoanDetail],
});
