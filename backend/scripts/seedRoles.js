/**
 * ============================================
 * Role-Based User Seeding Script
 * ============================================
 * Creates test users for each role: Student, Teacher, Admin, SuperAdmin
 */

require('dotenv').config();
const { User } = require('../models');

async function seedRoleUsers() {
  try {
    console.log('🌱 Seeding role-based test users...');
    console.log('');

    // Check for existing users to avoid duplicates
    const existingStudent = await User.findOne({ where: { email: 'student@flashmind.com' } });
    const existingTeacher = await User.findOne({ where: { email: 'teacher@flashmind.com' } });
    const existingAdmin = await User.findOne({ where: { email: 'admin@flashmind.com' } });
    const existingSuperAdmin = await User.findOne({ where: { email: 'superadmin@flashmind.com' } });

    // Create Student account
    if (!existingStudent) {
      await User.create({
        username: 'student',
        email: 'student@flashmind.com',
        password: 'student123',
        fullName: 'Test Student',
        role: 'student',
        level: 3,
        experiencePoints: 250,
        coins: 500,
        currentStreak: 5,
        longestStreak: 10
      });
      console.log('✅ Created: student@flashmind.com / student123 (Role: STUDENT)');
    } else {
      console.log('⚠️  Already exists: student@flashmind.com');
    }

    // Create Teacher account
    if (!existingTeacher) {
      await User.create({
        username: 'teacher',
        email: 'teacher@flashmind.com',
        password: 'teacher123',
        fullName: 'Test Teacher',
        role: 'teacher',
        level: 8,
        experiencePoints: 1200,
        coins: 2000,
        currentStreak: 15,
        longestStreak: 25
      });
      console.log('✅ Created: teacher@flashmind.com / teacher123 (Role: TEACHER)');
    } else {
      console.log('⚠️  Already exists: teacher@flashmind.com');
    }

    // Create Admin account
    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        email: 'admin@flashmind.com',
        password: 'admin123',
        fullName: 'Test Admin',
        role: 'admin',
        level: 15,
        experiencePoints: 5000,
        coins: 10000,
        currentStreak: 30,
        longestStreak: 50
      });
      console.log('✅ Created: admin@flashmind.com / admin123 (Role: ADMIN)');
    } else {
      console.log('⚠️  Already exists: admin@flashmind.com');
    }

    // Create Super Admin account
    if (!existingSuperAdmin) {
      await User.create({
        username: 'superadmin',
        email: 'superadmin@flashmind.com',
        password: 'superadmin123',
        fullName: 'Test Super Admin',
        role: 'super_admin',
        level: 20,
        experiencePoints: 10000,
        coins: 50000,
        currentStreak: 60,
        longestStreak: 100
      });
      console.log('✅ Created: superadmin@flashmind.com / superadmin123 (Role: SUPER_ADMIN)');
    } else {
      console.log('⚠️  Already exists: superadmin@flashmind.com');
    }

    console.log('');
    console.log('🎉 Role-based user seeding complete!');
    console.log('');
    console.log('📝 Test Credentials by Role:');
    console.log('');
    console.log('   STUDENT:');
    console.log('   └─ Email: student@flashmind.com');
    console.log('   └─ Password: student123');
    console.log('');
    console.log('   TEACHER:');
    console.log('   └─ Email: teacher@flashmind.com');
    console.log('   └─ Password: teacher123');
    console.log('');
    console.log('   ADMIN:');
    console.log('   └─ Email: admin@flashmind.com');
    console.log('   └─ Password: admin123');
    console.log('');
    console.log('   SUPER ADMIN:');
    console.log('   └─ Email: superadmin@flashmind.com');
    console.log('   └─ Password: superadmin123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Role seeding failed:', error);
    process.exit(1);
  }
}

seedRoleUsers();
