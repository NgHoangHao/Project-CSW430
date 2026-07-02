import { Request, Response } from "express";
import { createRolesService } from "../services/roleService";
import { CreateRoleDTO } from "../dtos/role/roleDTO";

export const createRolesController = async (req: Request<{}, {}, CreateRoleDTO>, res: Response) => {
    try {
        const result = await createRolesService(req.body);
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'Role already exists') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}