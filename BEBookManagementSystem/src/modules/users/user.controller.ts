import { Request, Response } from "express";
import * as service from "./user.service";

export const createUser = async (
    req: Request,
    res: Response
) => {
    const { name, email } = req.body;

    await service.createUser(name, email);

    res.status(201).json({
        message: "User created successfully"
    });

};

export const getUsers = async (
    req: Request,
    res: Response
) => {
    const users = await service.getUsers();

    res.json(users);
};

export const deleteUser = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);

    await service.deleteUser(id);

    res.json({
        message: "User deleted successfully"
    });
};