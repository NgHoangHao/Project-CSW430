import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { RoleName, UserStatus } from '../utils/enums';
import bcrypt from 'bcrypt';

export const seedAdminAccount = async () => {
  try {
    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);

    // 1. Ensure Roles exist
    let adminRole = await roleRepo.findOneBy({ roleName: RoleName.ADMIN });
    if (!adminRole) {
      adminRole = roleRepo.create({ roleName: RoleName.ADMIN });
      await roleRepo.save(adminRole);
    }

    let librarianRole = await roleRepo.findOneBy({ roleName: RoleName.LIBRARIAN });
    if (!librarianRole) {
      librarianRole = roleRepo.create({ roleName: RoleName.LIBRARIAN });
      await roleRepo.save(librarianRole);
    }

    let userRole = await roleRepo.findOneBy({ roleName: RoleName.USER });
    if (!userRole) {
      userRole = roleRepo.create({ roleName: RoleName.USER });
      await roleRepo.save(userRole);
    }

    // 2. Ensure Admin User exists
    const adminEmail = 'admin@gmail.com';
    let adminUser = await userRepo.findOne({
      where: { email: adminEmail },
      relations: { roles: true },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = userRepo.create({
        userName: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        credit: 999,
        roles: [adminRole, librarianRole, userRole],
      });
      await userRepo.save(adminUser);
      console.log('✅ Created default Admin account: admin@gmail.com / admin123');
    } else {
      console.log('ℹ️ Admin account admin@gmail.com already exists.');
    }
  } catch (err) {
    console.error('❌ Error seeding Admin account:', err);
  }
};

// Standalone execution script
if (require.main === module) {
  AppDataSource.initialize()
    .then(async () => {
      console.log('Database connected. Seeding admin account...');
      await seedAdminAccount();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      process.exit(1);
    });
}
