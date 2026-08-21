import api from "../lib/axios"
import { Role } from "../types/admin/role";
export const RoleService = {

    async getAllRole(): Promise<Role[]> {
        const response = await api.get('/role/get-all');
        return response.data.data;
    },

}
