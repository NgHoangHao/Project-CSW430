
import { Request, Response } from 'express';
import { assignRoleUser, getAllUsers, getUserProfile, removeRoleUser, updateUserProfile, deleteUserById } from '../services/userService';
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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // lấy từ JWT
    const userDto = req.body;
    const user = await updateUserProfile(userId, userDto);
    return res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      message: error.message,
    });
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

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string; // Lấy userId từ route

    await deleteUserById(userId);

    return res.status(200).json({
      message: "Delete user successfully"
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getUserPage = async (
  req: Request<
    {}, // Params trên URL (/user/:id)
    {}, // Response Body
    {}, // Request Body
    {
      page?: string;
      size?: string;
      userName?: string;
    }
  >,
  res: Response
) => {
  try {
    const { page = "1", size = "10", userName } = req.query;
    const result = await getAllUsers(
      Number(page),
      Number(size),
      userName
    );
    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};