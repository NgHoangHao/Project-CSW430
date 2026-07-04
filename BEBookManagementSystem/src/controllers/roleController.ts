import { Request, Response } from "express";
import { CreateRoleDTO } from "../dtos/role/roleDTO";
import { roleService } from "../services/roleService";

export const createRolesController = async (req: Request<{}, {}, CreateRoleDTO>, res: Response) => {
    try {
        const result = await roleService.createRolesService(req.body);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'Role already exists') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllRolesController = async (req: Request, res: Response) => {
    try {
        const result = await roleService.getAllRolesService();
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'Roles not found') {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}