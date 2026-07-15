const RoleModel = require('../models/roleModel');
const UserManagementModel = require('../models/userManagementModel');
const { verifyToken } = require('./authMiddleware');

const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export', 'print'];

// ==========================================================
// Merge user_permissions (override) with role_permissions
// (default). Fails closed: no matching row => not allowed.
// ==========================================================
async function getMergedPermissions(userId, roleId) {
    // If roleId is missing, try to resolve it from the user's role name
    if (!roleId && userId) {
        const [userRow] = await require('../config/db').query(
            `SELECT role_id, role FROM users WHERE id = ?`, [userId]
        );
        if (userRow.length) {
            roleId = userRow[0].role_id;
            if (!roleId && userRow[0].role) {
                const role = await RoleModel.getRoleByName(userRow[0].role);
                roleId = role?.id || null;
            }
        }
    }

    const [userRows, roleRows] = await Promise.all([
        userId ? UserManagementModel.getUserPermissions(userId) : Promise.resolve([]),
        roleId ? RoleModel.getRolePermissions(roleId) : Promise.resolve([]),
    ]);

    const merged = new Map();
    for (const row of roleRows) merged.set(row.module_name, row);
    for (const row of userRows) merged.set(row.module_name, row); // user override wins

    return Array.from(merged.values());
}

async function resolvePermission(userId, roleId, moduleName, action) {
    if (!ACTIONS.includes(action)) return false;

    // Resolve roleId from role name if missing
    if (!roleId && userId) {
        const [userRow] = await require('../config/db').query(
            `SELECT role_id, role FROM users WHERE id = ?`, [userId]
        );
        if (userRow.length) {
            roleId = userRow[0].role_id;
            if (!roleId && userRow[0].role) {
                const role = await RoleModel.getRoleByName(userRow[0].role);
                roleId = role?.id || null;
            }
        }
    }

    const userRows = userId ? await UserManagementModel.getUserPermissions(userId) : [];
    const userRow = userRows.find((r) => r.module_name === moduleName);
    if (userRow) return !!userRow[`can_${action}`];

    if (!roleId) return false;

    const roleRows = await RoleModel.getRolePermissions(roleId);
    const roleRow = roleRows.find((r) => r.module_name === moduleName);
    return roleRow ? !!roleRow[`can_${action}`] : false;
}

function requirePermission(moduleName, action) {
    return async (req, res, next) => {
        try {
            const allowed = await resolvePermission(req.user.id, req.user.role_id, moduleName, action);

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: `You do not have permission to ${action} ${moduleName}.`,
                });
            }

            next();
        } catch (error) {
            console.error('PERMISSION CHECK ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to verify permissions.',
                error: error.message,
            });
        }
    };
}

// Authentication -> Permission -> Execute, in one spreadable array.
function protect(moduleName, action) {
    return [verifyToken, requirePermission(moduleName, action)];
}

// Role-name gate, for the handful of endpoints that aren't a module/action
// permission check (e.g. assigning roles is an Admin-only capability).
function authorizeRole(allowedRoleNames) {
    return (req, res, next) => {
        if (!req.user || !allowedRoleNames.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have sufficient privileges to perform this action.',
            });
        }
        next();
    };
}

module.exports = { getMergedPermissions, resolvePermission, requirePermission, protect, authorizeRole };
