import { AppDataSource } from "../config/database";
import { Role } from "../entities/Role";
import { RoleName } from "../utils/enums";

export const createRoles = async () => {
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = await roleRepository.find();
    if (roles.length === 0) {
        const userRole = roleRepository.create({ roleName: RoleName.USER });
        const librarianRole = roleRepository.create({ roleName: RoleName.LIBRARIAN });
        const adminRole = roleRepository.create({ roleName: RoleName.ADMIN });
        await roleRepository.save([userRole, librarianRole, adminRole]);
    }
};

export const getRoles = async () => {
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = await roleRepository.find();
    return roles;
}

