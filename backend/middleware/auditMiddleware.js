const UserManagementModel = require('../models/userManagementModel');

// ==========================================================
// Writes an audit_logs row using server-derived identity
// (req.user), never client-supplied req.body fields.
// ==========================================================
async function logAudit(req, { module_name, action, description, old_data = null, new_data = null, user_id = null }) {
    try {
        await UserManagementModel.createAuditLog({
            user_id: user_id ?? req.user?.id ?? null,
            module_name,
            action,
            description,
            old_data: old_data ? JSON.stringify(old_data) : null,
            new_data: new_data ? JSON.stringify(new_data) : null,
            ip_address: req.ip,
            browser: req.headers['user-agent'] || null,
            performed_by: req.user?.username || 'system',
        });
    } catch (error) {
        console.error('AUDIT LOG ERROR:', error);
    }
}

module.exports = { logAudit };
