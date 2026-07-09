import api from "../lib/axios"
import { LoginDTO, RegisterDTO } from "../types/auth"

export const authApi = {
    login: async (data: LoginDTO) => {
        const res = await api.post('/auth/login', data)
        return res
    },
    register: async (data: RegisterDTO) => {
        const res = await api.post('/auth/register', data)
        return res
    },
    logout: async () => {
        const res = await api.post('/auth/logout')
        return res
    },
    verifyOTP: async (email: string, otp: string) => {
        const res = await api.post('/auth/verify-otp', { email, otp })
        return res;
    },
    resendOTP: async (email: string) => {
        const res = await api.post('/auth/resend-otp', { email })
        return res;
    },
    
}
