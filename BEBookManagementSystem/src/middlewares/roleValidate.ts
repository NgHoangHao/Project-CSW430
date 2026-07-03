import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const addRoleValidate = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        roleName: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}