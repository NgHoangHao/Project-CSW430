import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const mailService = {
  sendOtp: async (to: string, otp: string) => {
    try {
      await transporter.sendMail({
        from: '"My App" <no-reply@myapp.com>',
        to,
        subject: 'Mã xác thực OTP',
        text: `Your OTP is: ${otp}. This OTP will be expired after 5 minutes.`,
      });
      console.log(`OTP sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send OTP');
    }
  }
};