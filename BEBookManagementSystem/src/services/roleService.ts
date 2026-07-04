import { AppDataSource } from "../config/database";
import { CreateRoleDTO } from "../dtos/role/roleDTO";
import { Role } from "../entities/Role";
import { getRoles } from "../repositories/roleRepository";
export const roleService = {
    createRolesService: async (data: CreateRoleDTO) => {
        const roleRepository = AppDataSource.getRepository(Role);
        const existingRole = await roleRepository.findOneBy({ roleName: data.roleName });
        if (existingRole) throw new Error('Role already exists');
        const newRole = roleRepository.create(data);
        return await roleRepository.save(newRole);
    },

    getAllRolesService: async () => {
        const roles = getRoles();
        return roles;
    }
}