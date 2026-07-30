import api from "../lib/axios"
import { BookAnalysis } from "../types/admin/analysis";
import { ApiResponse } from "../types/response/ApiResponse";
import { UpdateUserDTO } from "../types/user"
export const userService = {
    forgotPass: async (email: string, newPass: string, confirmPass: string) => {
        const res = await api.post('/user/forget-pass', { email, newPass, confirmPass });
        return res;
    },
    verifyForgetPass: async (email: string, clientOtp: string) => {
        const res = await api.post('/user/verify-forget', { email, clientOtp });
        return res;
    },
    updateProfile: async (data: UpdateUserDTO) => {
        const res = await api.put('/user/profile', data)
        return res;
    },
    getUserByPage: async (page: number, size: number, userName?: string) => {
        const res = await api.get("/user/get-all", {
            params: {
                page,
                size,
                ...(userName?.trim() ? { userName } : {}),
            },
        });
        return res;
    },
    deleteUser: async (userId: string) => {
        const res = await api.delete(`/user/${userId}`);
        return res;
    },
    assignRole: async (userId: string, roleIds: string[]) => {
        const res = await api.post('/user/assign-role', { userId, roleIds });
        return res;
    },
    deleteRole: async (userId: string, roleIds: string[]) => {
        const res = await api.post('/user/delete-role', { userId, roleIds });
        return res;
    },
    getAnalysisByAdmin: async () : Promise<ApiResponse<BookAnalysis>> => {
        const res = await api.get('/user/admin-analysis');
        return res.data;
    }
}