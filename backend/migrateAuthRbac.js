const db = require('./config/db');

// ==========================================================
// Canonical module list (23) — must match:
//   - backend/config/sidebarConfig.js
//   - src/pages/RolesPermissions/data.js (MODULES[].label)
// ==========================================================
const MODULES = [
  'Dashboard',
  'Vehicle Master',
  'Trip Master',
  'Fuel',
  'Maintenance',
  'Tyres',
  'Battery',
  'Inventory',
  'Purchase Orders',
  'Vendor',
  'Income & Expense',
  'Operational Payments',
  'Reports',
  'Truck Profit & Loss',
  'Staff Management',
  'Administration',
  'Company Profile',
  'User Management',
  'Roles & Permissions',
  'Audit Logs',
  'Document Vault',
  'System Settings',
  'Backup & Restore',
];

const NONE = { can_view: 0, can_create: 0, can_edit: 0, can_delete: 0, can_approve: 0, can_reject: 0, can_export: 0, can_print: 0 };
const FULL = { can_view: 1, can_create: 1, can_edit: 1, can_delete: 1, can_approve: 1, can_reject: 1, can_export: 1, can_print: 1 };
const VIEW_ONLY = { ...NONE, can_view: 1 };
const VIEW_EXPORT_PRINT = { ...NONE, can_view: 1, can_export: 1, can_print: 1 };
const CREATE_EDIT_VIEW = { ...NONE, can_view: 1, can_create: 1, can_edit: 1 };
const FULL_NO_DELETE = { ...FULL, can_delete: 0 };
const APPROVE_FLOW = { ...NONE, can_view: 1, can_create: 1, can_edit: 1, can_approve: 1, can_reject: 1, can_export: 1, can_print: 1 };

// ==========================================================
// Role definitions + per-module permission matrix
// Any module not listed for a role defaults to NONE.
// ==========================================================
const ROLES = [
  { role_name: 'Admin', department: 'Administration', level: 1 },
  { role_name: 'Operations Manager', department: 'Operations', level: 2 },
  { role_name: 'Finance Manager', department: 'Finance', level: 2 },
  { role_name: 'Maintenance Manager', department: 'Maintenance', level: 2 },
  { role_name: 'Supervisor', department: 'Operations', level: 3 },
  { role_name: 'Driver', department: 'Operations', level: 4 },
];

const ROLE_MATRIX = {
  'Admin': null, // null => FULL on every module

  'Operations Manager': {
    'Dashboard': CREATE_EDIT_VIEW,
    'Vehicle Master': CREATE_EDIT_VIEW,
    'Trip Master': CREATE_EDIT_VIEW,
    'Fuel': CREATE_EDIT_VIEW,
    'Staff Management': CREATE_EDIT_VIEW,
    'Operational Payments': CREATE_EDIT_VIEW,
    'Reports': VIEW_ONLY,
  },

  'Finance Manager': {
    'Income & Expense': APPROVE_FLOW,
    'Vendor': APPROVE_FLOW,
    'Purchase Orders': APPROVE_FLOW,
    'Operational Payments': APPROVE_FLOW,
    'Truck Profit & Loss': VIEW_EXPORT_PRINT,
    'Reports': VIEW_EXPORT_PRINT,
    'Vehicle Master': VIEW_ONLY,
    'Trip Master': VIEW_ONLY,
  },

  'Maintenance Manager': {
    'Maintenance': FULL_NO_DELETE,
    'Tyres': FULL_NO_DELETE,
    'Battery': FULL_NO_DELETE,
    'Inventory': FULL_NO_DELETE,
    'Purchase Orders': CREATE_EDIT_VIEW,
    'Vehicle Master': VIEW_ONLY,
    'Reports': VIEW_ONLY,
  },

  'Supervisor': {
    'Trip Master': CREATE_EDIT_VIEW,
    'Fuel': CREATE_EDIT_VIEW,
    'Staff Management': VIEW_ONLY,
    'Vehicle Master': VIEW_ONLY,
    'Maintenance': VIEW_ONLY,
    'Reports': VIEW_ONLY,
  },

  'Driver': {
    // Future-ready: self-scoped "My Trips / My Vehicle / My Settlement / My Profile"
    // module_names don't exist in the canonical list yet. Nothing granted today.
  },
};

async function columnExists(table, column) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`⏭  ${table}.${column} already exists, skipping`);
    return;
  }
  await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  console.log(`✅ Added column ${table}.${column}`);
}

async function constraintExists(name) {
  const [rows] = await db.query(
    `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = ?`,
    [name]
  );
  return rows.length > 0;
}

async function migrate() {
  try {
    // ------------------------------------------------------
    // 1. can_reject / can_print on role_permissions + user_permissions
    // ------------------------------------------------------
    for (const table of ['role_permissions', 'user_permissions']) {
      await addColumnIfMissing(table, 'can_reject', 'TINYINT(1) NOT NULL DEFAULT 0');
      await addColumnIfMissing(table, 'can_print', 'TINYINT(1) NOT NULL DEFAULT 0');
    }

    // ------------------------------------------------------
    // 2. users.role_id FK
    // ------------------------------------------------------
    await addColumnIfMissing('users', 'role_id', 'INT NULL AFTER role');

    if (!(await constraintExists('fk_users_role_id'))) {
      await db.query(`
        ALTER TABLE users
        ADD CONSTRAINT fk_users_role_id
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON UPDATE CASCADE ON DELETE SET NULL
      `);
      console.log('✅ Added FK fk_users_role_id');
    } else {
      console.log('⏭  fk_users_role_id already exists, skipping');
    }

    // ------------------------------------------------------
    // 3. Login lockout columns
    // ------------------------------------------------------
    await addColumnIfMissing('users', 'failed_login_attempts', 'INT NOT NULL DEFAULT 0');
    await addColumnIfMissing('users', 'locked_until', 'DATETIME NULL');

    // ------------------------------------------------------
    // 4. refresh_tokens table
    // ------------------------------------------------------
    await db.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        revoked_at DATETIME NULL,
        created_by_ip VARCHAR(64) NULL,
        user_agent VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_refresh_user (user_id),
        INDEX idx_refresh_hash (token_hash)
      )
    `);
    console.log('✅ refresh_tokens table ready');

    // ------------------------------------------------------
    // 5. Seed 6 canonical roles (idempotent)
    // ------------------------------------------------------
    async function nextRoleCode() {
      const [rows] = await db.query(`SELECT role_code FROM roles WHERE role_code LIKE 'ROLE%'`);
      const maxNum = rows.reduce((max, r) => {
        const n = parseInt(String(r.role_code).replace('ROLE', ''), 10);
        return Number.isFinite(n) && n > max ? n : max;
      }, 0);
      return `ROLE${String(maxNum + 1).padStart(4, '0')}`;
    }

    for (const role of ROLES) {
      const [existing] = await db.query(`SELECT id FROM roles WHERE role_name = ?`, [role.role_name]);
      if (existing.length > 0) {
        console.log(`⏭  Role "${role.role_name}" already exists, skipping`);
        continue;
      }
      const roleCode = await nextRoleCode();
      await db.query(
        `INSERT INTO roles
           (role_code, role_name, description, department, level, status, is_system_role, color, icon)
         VALUES (?, ?, ?, ?, ?, 'Active', 1, '#6366F1', 'Shield')`,
        [roleCode, role.role_name, `${role.role_name} (system role)`, role.department, role.level]
      );
      console.log(`✅ Created role "${role.role_name}" (${roleCode})`);
    }

    // ------------------------------------------------------
    // 6. Backfill users.role_id from users.role text match
    // ------------------------------------------------------
    await db.query(`
      UPDATE users u
      JOIN roles r ON r.role_name = u.role
      SET u.role_id = r.id
      WHERE u.role_id IS NULL
    `);
    console.log('✅ Backfilled users.role_id from users.role');

    const [orphans] = await db.query(`
      SELECT DISTINCT role FROM users WHERE role_id IS NULL AND role IS NOT NULL AND is_deleted = 0
    `);
    if (orphans.length > 0) {
      console.warn('⚠️  The following users.role values did not match any roles.role_name and were left unlinked:');
      orphans.forEach(o => console.warn(`   - "${o.role}"`));
    }

    // ------------------------------------------------------
    // 7. Seed role_permissions matrix (23 modules x 6 roles)
    // ------------------------------------------------------
    const [roleRows] = await db.query(`SELECT id, role_name FROM roles WHERE role_name IN (?)`, [ROLES.map(r => r.role_name)]);
    const roleIdByName = Object.fromEntries(roleRows.map(r => [r.role_name, r.id]));

    for (const role of ROLES) {
      const roleId = roleIdByName[role.role_name];
      if (!roleId) continue;

      const [existingPerms] = await db.query(
        `SELECT COUNT(*) AS cnt FROM role_permissions WHERE role_id = ?`,
        [roleId]
      );
      if (existingPerms[0].cnt > 0) {
        console.log(`⏭  role_permissions for "${role.role_name}" already seeded, skipping`);
        continue;
      }

      const roleDef = ROLE_MATRIX[role.role_name];

      for (const moduleName of MODULES) {
        const perms = roleDef === null ? FULL : (roleDef[moduleName] || NONE);

        await db.query(
          `INSERT INTO role_permissions
             (role_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_reject, can_export, can_print)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            roleId, moduleName,
            perms.can_view, perms.can_create, perms.can_edit, perms.can_delete,
            perms.can_approve, perms.can_reject, perms.can_export, perms.can_print,
          ]
        );
      }
      console.log(`✅ Seeded ${MODULES.length} role_permissions rows for "${role.role_name}"`);
    }

    console.log('\n🎉 Auth/RBAC migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    process.exit(0);
  }
}

migrate();
