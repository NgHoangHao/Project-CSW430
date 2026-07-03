// repositories/user.repository.ts
import { DataSource } from 'typeorm';
import { User } from '../entities/User'; 

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