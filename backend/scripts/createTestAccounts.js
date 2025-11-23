/**
 * Create Test Accounts with Known Passwords
 * For testing RBAC system
 */

require('dotenv').config();
const { User } = require('../models');

async function createTestAccounts() {
  try {
    console.log('🔄 Creating test accounts...\n');

    // Student account
    const [student, studentCreated] = await User.findOrCreate({
      where: { email: 'student@test.com' },
      defaults: {
        username: 'student_user',
        email: 'student@test.com',
        password: 'password123',
        fullName: 'Test Student',
        role: 'student',
        isActive: true
      }
    });
    console.log(studentCreated ? '✅ Created: student@test.com' : '⚠️  Already exists: student@test.com');

    // Teacher account
    const [teacher, teacherCreated] = await User.findOrCreate({
      where: { email: 'teacher@test.com' },
      defaults: {
        username: 'teacher_user',
        email: 'teacher@test.com',
        password: 'password123',
        fullName: 'Test Teacher',
        role: 'teacher',
        isActive: true
      }
    });
    console.log(teacherCreated ? '✅ Created: teacher@test.com' : '⚠️  Already exists: teacher@test.com');

    // Admin account
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@test.com' },
      defaults: {
        username: 'admin_user',
        email: 'admin@test.com',
        password: 'password123',
        fullName: 'Test Admin',
        role: 'admin',
        isActive: true
      }
    });
    console.log(adminCreated ? '✅ Created: admin@test.com' : '⚠️  Already exists: admin@test.com');

    // Super Admin account
    const [superAdmin, superAdminCreated] = await User.findOrCreate({
      where: { email: 'superadmin@test.com' },
      defaults: {
        username: 'superadmin_user',
        email: 'superadmin@test.com',
        password: 'password123',
        fullName: 'Test Super Admin',
        role: 'super_admin',
        isActive: true
      }
    });
    console.log(superAdminCreated ? '✅ Created: superadmin@test.com' : '⚠️  Already exists: superadmin@test.com');

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ Test accounts ready!');
    console.log('═══════════════════════════════════════════\n');
    console.log('📋 LOGIN CREDENTIALS:\n');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ 1. STUDENT (7 permissions)                  │');
    console.log('│    Email: student@test.com                  │');
    console.log('│    Password: password123                    │');
    console.log('└─────────────────────────────────────────────┘\n');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ 2. TEACHER (18 permissions)                 │');
    console.log('│    Email: teacher@test.com                  │');
    console.log('│    Password: password123                    │');
    console.log('└─────────────────────────────────────────────┘\n');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ 3. ADMIN (30 permissions)                   │');
    console.log('│    Email: admin@test.com                    │');
    console.log('│    Password: password123                    │');
    console.log('└─────────────────────────────────────────────┘\n');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ 4. SUPER ADMIN (34 permissions)             │');
    console.log('│    Email: superadmin@test.com               │');
    console.log('│    Password: password123                    │');
    console.log('└─────────────────────────────────────────────┘\n');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│ 5. DEMO SUPER ADMIN (Original)              │');
    console.log('│    Email: demo@flashmind.com                │');
    console.log('│    Password: demo123                        │');
    console.log('└─────────────────────────────────────────────┘\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    process.exit(1);
  }
}

createTestAccounts();
