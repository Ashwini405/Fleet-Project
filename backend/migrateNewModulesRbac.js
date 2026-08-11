const db = require('./config/db');

// New modules added after the initial RBAC seed (migrateAuthRbac.js).
// Backfills role_permissions rows for these modules on every existing role
// so the Roles & Permissions UI and permission checks see them immediately.
const NEW_MODULES = ['Fastag', 'Tender Data'];

const NONE = { can_view: 0, can_create: 0, can_edit: 0, can_delete: 0, can_approve: 0, can_reject: 0, can_export: 0, can_print: 0 };
const FULL = { can_view: 1, can_create: 1, can_edit: 1, can_delete: 1, can_approve: 1, can_reject: 1, can_export: 1, can_print: 1 };

async function migrate() {
  try {
    const [roles] = await db.query(`SELECT id, role_name, is_system_role FROM roles`);

    for (const role of roles) {
      // Admin (or any role marked as the full-access system role) gets FULL; everyone else gets NONE by default.
      const perms = role.role_name === 'Admin' ? FULL : NONE;

      for (const moduleName of NEW_MODULES) {
        const [existing] = await db.query(
          `SELECT id FROM role_permissions WHERE role_id = ? AND module_name = ?`,
          [role.id, moduleName]
        );
        if (existing.length > 0) {
          console.log(`⏭  ${role.role_name} already has "${moduleName}", skipping`);
          continue;
        }

        await db.query(
          `INSERT INTO role_permissions
             (role_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_reject, can_export, can_print)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            role.id, moduleName,
            perms.can_view, perms.can_create, perms.can_edit, perms.can_delete,
            perms.can_approve, perms.can_reject, perms.can_export, perms.can_print,
          ]
        );
        console.log(`✅ Added "${moduleName}" permissions for role "${role.role_name}"`);
      }
    }

    console.log('\n🎉 New modules RBAC backfill complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    process.exit(0);
  }
}

migrate();
