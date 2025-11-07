import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/auth/entities/user.entity';
import { Role } from '../../modules/auth/entities/role.entity';
import { UserStatus } from '../../common/enums/user-status.enum';

/**
 * Admin User Seeder
 * Creates default admin user
 */
export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  const adminEmail = 'admin@school.com';

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⏭️  Admin user already exists');
    return;
  }

  // Get SUPER_ADMIN role
  const adminRole = await roleRepository.findOne({
    where: { name: 'SUPER_ADMIN' },
  });

  if (!adminRole) {
    console.error('❌ SUPER_ADMIN role not found. Run role seeder first.');
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // Create admin user
  const adminUser = userRepository.create({
    email: adminEmail,
    username: 'admin',
    passwordHash: passwordHash,
    role: adminRole,
    status: UserStatus.ACTIVE,
    isVerified: true,
  });

  await userRepository.save(adminUser);

  console.log('✅ Admin user created');
  console.log('📧 Email: admin@school.com');
  console.log('🔑 Password: Admin@123');
  console.log('⚠️  Please change the password after first login!');
}