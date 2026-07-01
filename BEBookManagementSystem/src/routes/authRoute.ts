// src/routes/auth.routes.ts
import { Router } from 'express';
import { register } from '../controllers/authController';
import { verifyOtp } from'../controllers/authController' ;
import { resendOtp } from'../controllers/authController' ;
import { validateRegister } from '../middlewares/userValidate';

const router = Router();

router.post('/register', validateRegister, register);

router.post('/verify-otp', verifyOtp);

router.post('/resend-otp', resendOtp);

export default router;