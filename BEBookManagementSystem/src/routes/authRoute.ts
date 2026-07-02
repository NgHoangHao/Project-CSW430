// src/routes/auth.routes.ts
import { Router } from 'express';
import { login, logout, refreshToken, register } from '../controllers/authController';
import { verifyOtp } from'../controllers/authController' ;
import { resendOtp } from'../controllers/authController' ;
import { validateRegister } from '../middlewares/userValidate';

const authRouters = Router();

authRouters.post('/register', validateRegister, register);

authRouters.post('/verify-otp', verifyOtp);

authRouters.post('/resend-otp', resendOtp);

authRouters.post('/login',login);

authRouters.post('/refresh',refreshToken);

authRouters.post('/logout',logout);

export default authRouters;