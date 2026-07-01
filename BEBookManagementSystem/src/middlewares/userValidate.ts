import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.any().equal(Joi.ref('password')).required()
      .messages({ 'any.only': 'Passwords do not match' })
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};