// src/services/auth.service.ts
import { otpStoreUtils } from '../utils/otpStore';
import { RegisterDTO } from '../dtos/auth/RegisterDTO';   
import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import * as jwt from 'jsonwebtoken';
import { Role } from '../entities/Role';
import { AppDataSource } from '../config/database';
import { mailService } from './mailService';   
import { RoleName, UserStatus } from '../utils/enums';

export const registerService = async (data: RegisterDTO) => {
  const { userName, email, password } = data;
  const userRepository = AppDataSource.getRepository(User);
  const roleRepository = AppDataSource.getRepository(Role);
  const existingUser = await userRepository.findOneBy({ email });
  if (existingUser) throw new Error('Email already registered');
  const userRole = await roleRepository.findOneBy({ roleName: RoleName.USER });
  if (!userRole) throw new Error('Default role not found');
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = userRepository.create({
    userName,
    email,
    password: hashedPassword,
    status: UserStatus.INACTIVE,
    credit:100,
    roles: [userRole],
  });
  await userRepository.save(newUser);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashOtp = await bcrypt.hash(otp, 10);
  otpStoreUtils.set(email, hashOtp, 300);
  await mailService.sendOtp(email, otp);
  return { message: "User created as INACTIVE. OTP sent to your email." };
};

export const verifyService = async (email: string, otp: string) => {
  const hashOtp = otpStoreUtils.get(email);
  if (!hashOtp || !(await bcrypt.compare(otp, hashOtp))) {
    throw new Error('Invalid or expired OTP');
  }
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ email });
  if (user) {
    user.status = UserStatus.ACTIVE;
    await userRepository.save(user);
  }
  otpStoreUtils.delete(email);
  return {  message: 'Account activated successfully' };
};

export const resendOtpService = async (email: string) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ email });
  if (!user) throw new Error('User not found');
  if (user.status === UserStatus.ACTIVE) throw new Error('Account already activated');
  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashOtp = await bcrypt.hash(newOtp, 10);
  otpStoreUtils.set(email, hashOtp, 300);
  await mailService.sendOtp(email, newOtp);
  return { message: "New OTP has been sent to your email" };
};

export const generateTokens = (user: User) => {
  const roleNames = user.roles ? user.roles.map(role => role.roleName) : [];
  const accessToken = jwt.sign(
    { 
      id: user.userId, 
      email: user.email,
      roles: roleNames 
    }, 
    process.env.ACCESS_TOKEN_SECRET!, 
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.userId }, 
    process.env.REFRESH_TOKEN_SECRET!, 
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

export const loginService = async (userName: string, password: string) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { userName },
    relations: {
      roles: true
    } 
  });
  if (!user) {
    return null;
  }
  if(user.status==UserStatus.INACTIVE){
    throw new Error('Please active the account by enter OTP');
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return null; 
  }
  return generateTokens(user);
};

export const refreshAccessTokenService = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { id: string };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { userId: decoded.id },
      relations: { roles: true } 
    });
    if (!user) {
      return null;
    }
    const roleNames = user.roles ? user.roles.map(role => role.roleName) : [];
    const newAccessToken = jwt.sign(
      { id: user.userId, email: user.email, roles: roleNames }, 
      process.env.ACCESS_TOKEN_SECRET!, 
      { expiresIn: '15m' }
    );
    return newAccessToken;
  } catch (error) {
    return null;
  }
};