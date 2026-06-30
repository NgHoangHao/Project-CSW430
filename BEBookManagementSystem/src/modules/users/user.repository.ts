import pool from "../../config/database";
import { CreateUserDto } from "./user.interface";

export const createUser = async (data: CreateUserDto) => {
    const [result] = await pool.execute(
        `
        INSERT INTO users(name, email)
        VALUES (?, ?)
        `,
        [data.name, data.email]
    );

    return result;
};

export const getUsers = async () => {
    const [rows] = await pool.execute(
        `
        SELECT *
        FROM users
        ORDER BY id DESC
        `
    );

    return rows;
};

export const deleteUser = async (id: number) => {
    const [result] = await pool.execute(
        `
        DELETE FROM users
        WHERE id = ?
        `,
        [id]
    );

    return result;
};