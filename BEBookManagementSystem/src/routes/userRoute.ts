import { Router } from 'express';
import { getProfile,resetPasswordHandler,verifyOtpHandler } from '../controllers/userController';
import { validateForgetPassword, validateRegister } from '../middlewares/userValidate';
import { authorize } from '../middlewares/authorize';

const userRouters = Router();

userRouters.get('/profile',authorize(['USER','LIBRARIAN', 'ADMIN']), getProfile);

userRouters.post('/verify-forget',verifyOtpHandler );

userRouters.post('/forget-pass',validateForgetPassword,resetPasswordHandler);

export default userRouters;