// repositories/user.repository.ts
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';

export const createUserRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(User).extend({
    async findProfileById(userId: string) {
      return this.findOne({
        where: { userId },
        select: {
          userId: true,
          userName: true,
          email: true,
          status: true,
          credit: true,
        },
      });
    },
  });
};

export const getUserById = async (userId: string) => {
  const userRepository = AppDataSource.getRepository(User);
  return userRepository.findOne({
    where: { userId },
    relations: { roles: true }
  });
}

export const addRoleUser = async (userId: string, roleId: string[]) => {
  const rows = roleId.map((id: string) => ({
    userUserId: userId,
    roleRoleId: id
  }))
  return AppDataSource.createQueryBuilder()
    .insert()
    .into('user_roles_role')
    .values(rows)
    .execute();
}

export const deleteRoleUser = async (userId: string, roleIds: string[]) => {
  return AppDataSource.createQueryBuilder()
    .delete()
    .from('user_roles_role')
    .where('userUserId = :userId', { userId })
    .andWhere('roleRoleId IN (:...roleIds)', { roleIds })
    .execute();
}