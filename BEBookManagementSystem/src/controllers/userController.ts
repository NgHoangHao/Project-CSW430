
import { Request, Response } from 'express';
import { assignRoleUser, getUserProfile, removeRoleUser } from '../services/userService';
import { changePasswordAfterForgot, verifyForgotPasswordOtp } from '../services/userService';
import { NotFoundException } from '../common/errors/error';
import { AssignRoleUserDto, DeleteRoleUserDto } from '../dtos/user/user';

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

export const assignRoleUserController = async (req: Request<{}, {}, AssignRoleUserDto>, res: Response): Promise<void> => {
  try {
    const { userId, roleIds }: AssignRoleUserDto = req.body;
    await assignRoleUser(userId, roleIds);
    res.status(200).json({
      success: true,
      message: 'Role assigned successfully.'
    });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      const statusCode = error.message == 'User not found' || 'Role not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error.'
    });
  }
}

export const deleteRoleUserController = async (req: Request<{}, {}, DeleteRoleUserDto>, res: Response): Promise<void> => {
  try {
    const { userId, roleIds }: DeleteRoleUserDto = req.body;
    await removeRoleUser(userId, roleIds);
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully.'
    });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      const statusCode = error.message == 'User not found' || 'Role not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error.'
    });
  }
}