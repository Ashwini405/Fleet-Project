const pool = require('./config/db');
const UserManagementModel = require('./models/userManagementModel');

const TEST_PASSWORD = 'Test@1234';

const TEST_USERS = [
  { employee_id: 'EMPTEST01', employee_name: 'Test Admin', username: 'admin.test', email: 'admin.test@fleet.local', role: 'Admin' },
  { employee_id: 'EMPTEST02', employee_name: 'Test Operations Manager', username: 'ops.test', email: 'ops.test@fleet.local', role: 'Operations Manager' },
  { employee_id: 'EMPTEST03', employee_name: 'Test Finance Manager', username: 'finance.test', email: 'finance.test@fleet.local', role: 'Finance Manager' },
  { employee_id: 'EMPTEST04', employee_name: 'Test Maintenance Manager', username: 'maint.test', email: 'maint.test@fleet.local', role: 'Maintenance Manager' },
  { employee_id: 'EMPTEST05', employee_name: 'Test Supervisor', username: 'supervisor.test', email: 'supervisor.test@fleet.local', role: 'Supervisor' },
  { employee_id: 'EMPTEST06', employee_name: 'Test Driver', username: 'driver.test', email: 'driver.test@fleet.local', role: 'Driver' },
];

async function seed() {
  try {
    for (const u of TEST_USERS) {
      const exists = await UserManagementModel.usernameExists(u.username);

      const [[role]] = await pool.query(`SELECT id FROM roles WHERE role_name = ?`, [u.role]);
      if (!role) {
        console.warn(`⚠️  Role "${u.role}" not found, skipping ${u.username}`);
        continue;
      }

      let userId;
      if (exists) {
        const [rows] = await pool.query(`SELECT id FROM users WHERE username = ?`, [u.username]);
        userId = rows[0].id;
        await UserManagementModel.resetPassword(userId, TEST_PASSWORD);
        console.log(`⏭  ${u.username} already exists, password reset to known value`);
      } else {
        userId = await UserManagementModel.createUser({
          employee_id: u.employee_id,
          employee_name: u.employee_name,
          username: u.username,
          email: u.email,
          phone: null,
          department: u.role,
          plant: 'Main Plant',
          role: u.role,
          password: TEST_PASSWORD,
          status: 'Active',
          allow_web: true,
          allow_mobile: false,
          force_password_reset: false,
          created_by: 'seed-script',
          updated_by: 'seed-script',
        });
        console.log(`✅ Created user "${u.username}" (${u.role})`);
      }

      await pool.query(`UPDATE users SET role_id = ?, status = 'Active', failed_login_attempts = 0, locked_until = NULL WHERE id = ?`, [role.id, userId]);
    }

    console.log('\n🎉 Test users ready. Password for all: ' + TEST_PASSWORD);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    process.exit(0);
  }
}

seed();
