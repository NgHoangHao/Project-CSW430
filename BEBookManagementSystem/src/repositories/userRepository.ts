// repositories/user.repository.ts
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { UserStatus } from '../utils/enums';

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

export const getUserPage = async (page: number, size: number, userName?: string) => {
  const userRepository = AppDataSource.getRepository(User);
  const query = userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.loans", "loan")
    .leftJoinAndSelect("loan.loanDetails", "loanDetail")
    .orderBy("user.createdAt", "DESC");

  if (userName) {
    query.andWhere("user.userName LIKE :userName", {
      userName: `%${userName}%`,
    });
  }

  query.skip((page - 1) * size).take(size);

  const [users, total] = await query.getManyAndCount();

  return { users, total };
}

export const countActiveUsers = async () => {
  const userRepository = AppDataSource.getRepository(User);
  return await userRepository.count({
    where: { status: UserStatus.ACTIVE },
  });
}

export const countBlockedUsers = async () => {
  const userRepository = AppDataSource.getRepository(User);
  return await userRepository.count({
    where: { status: UserStatus.LOCK },
  });
}

export const getAnalysisAdmin = async (): Promise<{ totalBooks: number, borrowing: number, overdue: number, totalUsers: number, monthlyLoans: number, avgDuration: number }> => {
  const result = await AppDataSource.query(`
    SELECT
      (SELECT COUNT(*) FROM book) AS totalBooks,
      
      (SELECT COUNT(*) FROM loan WHERE status = 'BORROWED') AS borrowing,
      
      (SELECT COUNT(*) FROM loan WHERE status = 'BORROWED' AND dueDate < NOW()) AS overdue,
      
      (SELECT COUNT(*) FROM user) AS totalUsers,
      
      (SELECT COUNT(*) FROM loan WHERE createdAt >= DATE_FORMAT(NOW(), '%Y-%m-01')) AS monthlyLoans,
      
      IFNULL(
        (SELECT AVG(DATEDIFF(dueDate, borrowDate)) FROM loan), 0
      ) AS avgDuration
    `);
  const stats = result[0];
  return {
    totalBooks: Number(stats?.totalBooks) || 0,
    borrowing: Number(stats?.borrowing) || 0,
    overdue: Number(stats?.overdue) || 0,
    totalUsers: Number(stats?.totalUsers) || 0,
    monthlyLoans: Number(stats?.monthlyLoans) || 0,
    avgDuration: Number(parseFloat(stats?.avgDuration || 0).toFixed(1)),
  }
}

export const userRepository = AppDataSource.getRepository(User).extend({
  async deductCredit(user: User, amount: number) {
    user.credit = Math.max(0, user.credit - amount);
    return this.save(user);
  },
  async addCreditsToAllUsers(){
    await userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        credit: () => 'CASE WHEN credit + 10 > 100 THEN 100 ELSE credit + 10 END',
      })
      .where('credit < :maxCredit', { maxCredit: 100 })
      .execute();
  }
});
