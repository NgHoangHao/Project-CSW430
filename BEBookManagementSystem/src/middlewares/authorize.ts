import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  }
}

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
      req.user = decoded;
      const hasRole = decoded.roles.some((role: string) => allowedRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden: You don't have permission" });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }
  };
};
