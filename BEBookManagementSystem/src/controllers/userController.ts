
import { Request, Response } from 'express';
import { getUserProfile } from '../services/userService';
import { changePasswordAfterForgot, verifyForgotPasswordOtp } from '../services/userService';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await getUserProfile(userId);
    return res.status(200).json(profile);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const verifyOtpHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, clientOtp } = req.body;
    if (!email || !clientOtp) {
      res.status(400).json({ message: 'Email and OTP are required.' });
      return;
    }
    await verifyForgotPasswordOtp(email, clientOtp);

    res.status(200).json({
      success: true,
      message: 'Verify OTP successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'An error occurred during OTP authentication.'
    });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPass, confirmPass } = req.body;
    await changePasswordAfterForgot({ email, newPass, confirmPass });
    res.status(200).json({
      success: true,
      message: 'Password reset successful.'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'An error occurred during the password reset process.'
    });
  }
};