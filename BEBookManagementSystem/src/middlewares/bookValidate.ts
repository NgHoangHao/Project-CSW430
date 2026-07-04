import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export const validateAddBook = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        author: Joi.string().required(),
        publisher: Joi.string().required(),
        publishYear: Joi.number().required(),
        category: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
};