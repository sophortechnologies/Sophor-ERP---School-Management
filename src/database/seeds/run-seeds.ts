import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedRoles } from './role.seed';
import { seedAdmin } from './admin.seed';

// Load environment variables
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

/**
 * Run all database seeds
 */
async function runSeeds() {
  console.log('🌱 Starting database seeding...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'school_erp_dev',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run seeds in order
    await seedRoles(dataSource);
    console.log('');
    await seedAdmin(dataSource);

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();