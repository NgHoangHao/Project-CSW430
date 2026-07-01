interface OtpData {
  hashOtp: string;
  expiresAt: number;
}

// Dùng Map để lưu: key là email, value là data OTP
const otpStore = new Map<string, OtpData>();

export const otpStoreUtils = {
  set: (email: string, hashOtp: string, ttlSeconds: number) => {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    otpStore.set(email, { hashOtp, expiresAt });
  },

  get: (email: string) => {
    const data = otpStore.get(email);
    if (!data) return null;
    if (Date.now() > data.expiresAt) {
      otpStore.delete(email);
      return null;
    }
    return data.hashOtp;
  },

  delete: (email: string) => {
    otpStore.delete(email);
  }
};