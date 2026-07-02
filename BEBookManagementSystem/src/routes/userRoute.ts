import { Router } from 'express';
import { getProfile } from '../controllers/userController';
import { authorize } from '../middlewares/authorize';

const userRouters = Router();

userRouters.get('/profile', authorize(['USER', 'LIBRARIAN', 'ADMIN']), getProfile);

export default userRouters;