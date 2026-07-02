
import { Request, Response } from 'express';
import { getUserProfile } from '../services/userService';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId; 
    const profile = await getUserProfile(userId);
    return res.status(200).json(profile);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(500).json({ message: 'Server error', error });
  }
};