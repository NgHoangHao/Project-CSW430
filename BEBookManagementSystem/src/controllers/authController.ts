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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.loginService(email, password);
    if (!tokens) {
      return res.status(401).json({ message: "Login failed: Incorrect username or password" });
    }
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error("Login Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(403).json({ message: "No refresh token provided" });
    }
    const newAccessToken = await authService.refreshAccessTokenService(token);
    if (!newAccessToken) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: "Redirect to login" });
    }
    return res.json({ accessToken: newAccessToken });

  } catch (error) {
    console.error("Refresh Token Controller Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    console.error("Logout Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};