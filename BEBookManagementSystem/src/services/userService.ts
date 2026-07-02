// services/user.service.ts
import { User } from '../entities/User'; // [cite: 1, 3]
import { UserProfileDto } from '../dtos/user/userProfileDTO';
import { AppDataSource } from '../config/database';

export const getUserProfile = async ( userId: string): Promise<UserProfileDto> => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { userId },
    select: {
      userId: true,
      userName: true,
      email: true,
      status: true,
      credit: true,
    },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }
  return new UserProfileDto({
    userId: user.userId,
    userName: user.userName,
    email: user.email,
    status: user.status,
    credit: user.credit,
  });
};