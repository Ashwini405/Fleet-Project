// ==========================================================
// 1) Renames legacy module names (see LEGACY_NAMES).
// 2) Vehicle Inspection, Incidents and Warranties used to share the
// "Maintenance" permission. They are now separate modules.
// For every role, copy its Maintenance permissions to each new
// module that the role does not have a row for yet, so nobody
// gains or loses access by the split. Safe to re-run.
//
//   node backend/migrateSplitMaintenanceModules.js
// ==========================================================
const db = require('./config/db');

const NEW_MODULES = ['Vehicle Inspection', 'Incidents', 'Warranties'];

// Older roles were saved with sidebar display names; map them to the
// module_name the app actually checks.
const LEGACY_NAMES = {
    'Fuel Management':       'Fuel',
    'Service & Maintenance': 'Maintenance',
    'Tyres Management':      'Tyres',
    'Parts & Inventory':     'Inventory',
    'Vendor Ledgers':        'Vendor',
    'P&L Reports':           'Reports',
};

(async () => {
    try {
        let renamed = 0;
        for (const [oldName, newName] of Object.entries(LEGACY_NAMES)) {
            // Only rename where the role has no row under the new name yet
            const [result] = await db.query(
                `UPDATE role_permissions rp
                 SET rp.module_name = ?
                 WHERE rp.module_name = ?
                 AND NOT EXISTS (
                     SELECT 1 FROM (SELECT role_id, module_name FROM role_permissions) x
                     WHERE x.role_id = rp.role_id AND x.module_name = ?
                 )`,
                [newName, oldName, newName]
            );
            renamed += result.affectedRows;
        }
        console.log(`✅ Renamed legacy module names: ${renamed} row(s).`);

        const [maintRows] = await db.query(
            `SELECT * FROM role_permissions WHERE module_name = 'Maintenance'`
        );

        let inserted = 0;
        for (const row of maintRows) {
            for (const moduleName of NEW_MODULES) {
                const [exists] = await db.query(
                    `SELECT id FROM role_permissions WHERE role_id = ? AND module_name = ?`,
                    [row.role_id, moduleName]
                );
                if (exists.length) continue;

                await db.query(
                    `INSERT INTO role_permissions
                     (role_id, module_name, can_view, can_create, can_edit, can_delete,
                      can_approve, can_reject, can_export, can_print)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [row.role_id, moduleName, row.can_view, row.can_create, row.can_edit,
                     row.can_delete, row.can_approve, row.can_reject, row.can_export, row.can_print]
                );
                inserted++;
            }
        }

        console.log(`✅ Copied Maintenance permissions to new modules: ${inserted} row(s) inserted.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
})();
