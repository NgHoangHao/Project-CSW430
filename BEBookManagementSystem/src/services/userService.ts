// services/user.service.ts
import { DataSource } from 'typeorm';
import { User } from '../entities/User'; 
import { UserProfileDto } from '../dtos/user/UserProfileDTO';
import { AppDataSource } from '../config/database';
import { otpStoreUtils } from '../utils/otpStore';
import { UserStatus } from '../utils/enums';
import bcrypt from 'bcrypt';
import { ResetPasswordDto } from '../dtos/auth/ResetPasswordDTO';

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

export const verifyForgotPasswordOtp = async (email: string, clientOtp: string): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });
  if (!user) throw new Error('Người dùng không tồn tại.');
  const savedHashOtp = otpStoreUtils.get(email);
  if (!savedHashOtp) {
    throw new Error('Invalid or expired OTP');
  }
  const isOtpValid = await bcrypt.compare(clientOtp, savedHashOtp);
  if (!isOtpValid) {
    throw new Error('OTP not correct.');
  }
  user.status = UserStatus.FORGOTPASS;
  await userRepository.save(user);
  otpStoreUtils.delete(email);
};

export const changePasswordAfterForgot = async ( dto: ResetPasswordDto): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);
  if (dto.newPass !== dto.confirmPass) {
    throw new Error('Password not match.');
  }

  const user = await userRepository.findOne({ where: { email: dto.email } });
  if (!user) throw new Error('User not found.');
  if (user.status !== UserStatus.FORGOTPASS) {
    throw new Error('Request not valid. Please do verify OTP step.');
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(dto.newPass, salt);
  user.status = UserStatus.ACTIVE;
  await userRepository.save(user);
};