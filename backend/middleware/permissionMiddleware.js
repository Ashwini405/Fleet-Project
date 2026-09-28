const db = require('../config/db');
const RoleModel = require('../models/roleModel');
const { verifyToken } = require('./authMiddleware');

const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export', 'print'];

// ==========================================================
// Permissions come from the user's ROLE only (Roles &
// Permissions page). Per-user overrides in user_permissions are
// ignored so that editing a role always takes effect for every
// user in it. The role is read from the users table on every
// call, so a role change applies without waiting for a new token.
// Fails closed: no role / no matching row => not allowed.
// ==========================================================
async function resolveRoleId(userId, fallbackRoleId) {
    if (!userId) return fallbackRoleId || null;

    const [userRow] = await db.query(
        `SELECT role_id, role FROM users WHERE id = ? AND is_deleted = 0`, [userId]
    );
    if (!userRow.length) return null;

    if (userRow[0].role_id) return userRow[0].role_id;
    if (userRow[0].role) {
        const role = await RoleModel.getRoleByName(userRow[0].role);
        return role?.id || null;
    }
    return null;
}

async function getMergedPermissions(userId, roleId) {
    const resolvedRoleId = await resolveRoleId(userId, roleId);
    if (!resolvedRoleId) return [];
    return RoleModel.getRolePermissions(resolvedRoleId);
}

async function resolvePermission(userId, roleId, moduleName, action) {
    if (!ACTIONS.includes(action)) return false;

    const resolvedRoleId = await resolveRoleId(userId, roleId);
    if (!resolvedRoleId) return false;

    const roleRows = await RoleModel.getRolePermissions(resolvedRoleId);
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
