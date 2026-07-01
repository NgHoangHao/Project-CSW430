// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { RegisterDTO } from '../dtos/auth/RegisterDTO';

export const register = async (req: Request<{}, {}, RegisterDTO>, res: Response) => {
  try {
    const result = await authService.registerService(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    const result = await authService.verifyService(email, otp);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Invalid or expired OTP') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const result = await authService.resendOtpService(email);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'User not found' || error.message === 'Account already activated') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};