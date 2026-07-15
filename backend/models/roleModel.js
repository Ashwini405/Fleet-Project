const pool = require("../config/db");

class RoleModel {
    // ==========================================================
    // Generate Role Code
    // ==========================================================

    static async generateRoleCode() {
        const [rows] = await pool.query(
            `SELECT COUNT(*) as count FROM roles`
        );
        const count = rows[0].count + 1;
        return `ROLE${String(count).padStart(4, '0')}`;
    }

    // ==========================================================
    // Dashboard Counts
    // ==========================================================

    static async getDashboardCounts() {
        const [total] = await pool.query(
            `SELECT COUNT(*) as total FROM roles`
        );
        const [active] = await pool.query(
            `SELECT COUNT(*) as active FROM roles WHERE status = 'Active'`
        );
        const [inactive] = await pool.query(
            `SELECT COUNT(*) as inactive FROM roles WHERE status = 'Inactive'`
        );
        // ── FIX: Changed 'system' to 'system_roles' ──
        const [system] = await pool.query(
            `SELECT COUNT(*) as system_roles FROM roles WHERE is_system_role = 1`
        );
        const [custom] = await pool.query(
            `SELECT COUNT(*) as custom FROM roles WHERE is_system_role = 0`
        );

        return {
            total: total[0].total,
            active: active[0].active,
            inactive: inactive[0].inactive,
            // ── FIX: Changed system.system to system.system_roles ──
            system: system[0].system_roles,
            custom: custom[0].custom
        };
    }

    // ==========================================================
    // Get All Roles
    // ==========================================================

    static async getAllRoles() {
        const [rows] = await pool.query(
            `
            SELECT
                r.id,
                r.role_code,
                r.role_name,
                r.description,
                r.department,
                r.level,
                r.status,
                r.is_system_role,
                r.color,
                r.icon,
                r.created_by,
                r.updated_by,
                r.created_at,
                r.updated_at,
                (SELECT COUNT(*) FROM users u WHERE u.role = r.role_name AND u.is_deleted = 0) AS users_assigned
            FROM roles r
            ORDER BY r.level ASC, r.role_name ASC
            `
        );
        return rows;
    }

    // ==========================================================
    // Get Role By ID
    // ==========================================================

    static async getRoleById(id) {
        const [rows] = await pool.query(
            `
            SELECT 
                id,
                role_code,
                role_name,
                description,
                department,
                level,
                status,
                is_system_role,
                color,
                icon,
                created_by,
                updated_by,
                created_at,
                updated_at
            FROM roles
            WHERE id = ?
            `,
            [id]
        );
        return rows[0];
    }

    // ==========================================================
    // Check Role Code Exists
    // ==========================================================

    static async roleCodeExists(roleCode) {
        const [rows] = await pool.query(
            `SELECT COUNT(*) as count FROM roles WHERE role_code = ?`,
            [roleCode]
        );
        return rows[0].count > 0;
    }

    // ==========================================================
    // Check Role Name Exists
    // ==========================================================

    static async roleNameExists(roleName, excludeId = null) {
        let query = `SELECT COUNT(*) as count FROM roles WHERE role_name = ?`;
        const params = [roleName];
        
        if (excludeId) {
            query += ` AND id != ?`;
            params.push(excludeId);
        }
        
        const [rows] = await pool.query(query, params);
        return rows[0].count > 0;
    }

    // ==========================================================
    // Create Role
    // ==========================================================

    static async createRole(roleData) {
        const roleCode = await this.generateRoleCode();

        const [result] = await pool.query(
            `
            INSERT INTO roles
            (
                role_code,
                role_name,
                description,
                department,
                level,
                status,
                is_system_role,
                color,
                icon,
                created_by,
                updated_by
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            `,
            [
                roleCode,
                roleData.role_name,
                roleData.description,
                roleData.department,
                roleData.level || 1,
                roleData.status || "Active",
                roleData.is_system_role || 0,
                roleData.color || "#6366F1",
                roleData.icon || "Shield",
                roleData.created_by,
                roleData.updated_by
            ]
        );

        return result.insertId;
    }

    // ==========================================================
    // Update Role
    // ==========================================================

    static async updateRole(id, roleData) {
        await pool.query(
            `
            UPDATE roles
            SET
                role_name = ?,
                description = ?,
                department = ?,
                level = ?,
                status = ?,
                is_system_role = ?,
                color = ?,
                icon = ?,
                updated_by = ?
            WHERE id = ?
            `,
            [
                roleData.role_name,
                roleData.description,
                roleData.department,
                roleData.level,
                roleData.status,
                roleData.is_system_role,
                roleData.color,
                roleData.icon,
                roleData.updated_by,
                id
            ]
        );

        return true;
    }

    // ==========================================================
    // Delete Role
    // ==========================================================

    static async deleteRole(id) {
        await pool.query(
            `
            DELETE FROM roles
            WHERE id = ?
            `,
            [id]
        );

        return true;
    }

    // ==========================================================
    // Update Role Status
    // ==========================================================

    static async updateRoleStatus(id, status) {
        await pool.query(
            `
            UPDATE roles
            SET status = ?
            WHERE id = ?
            `,
            [status, id]
        );

        return true;
    }

    // ==========================================================
    // Get Role By Name
    // ==========================================================

    static async getRoleByName(roleName) {
        const [rows] = await pool.query(
            `
            SELECT *
            FROM roles
            WHERE role_name = ?
            `,
            [roleName]
        );

        return rows[0];
    }

    // ==========================================================
    // Get Role Permissions
    // ==========================================================

    static async getRolePermissions(roleId) {
        const [rows] = await pool.query(
            `
            SELECT
                id,
                role_id,
                module_name,
                can_view,
                can_create,
                can_edit,
                can_delete,
                can_approve,
                can_export
            FROM role_permissions
            WHERE role_id = ?
            ORDER BY module_name ASC
            `,
            [roleId]
        );

        return rows;
    }

    // ==========================================================
    // Save Role Permissions
    // ==========================================================

    static async saveRolePermissions(roleId, permissions) {
        await pool.query(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);

        for (const permission of permissions) {
            await pool.query(
                `INSERT INTO role_permissions
                (role_id, module_name, can_view, can_create, can_edit, can_delete, can_approve, can_reject, can_export, can_print)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    roleId,
                    permission.module_name,
                    permission.can_view    ? 1 : 0,
                    permission.can_create  ? 1 : 0,
                    permission.can_edit    ? 1 : 0,
                    permission.can_delete  ? 1 : 0,
                    permission.can_approve ? 1 : 0,
                    permission.can_reject  ? 1 : 0,
                    permission.can_export  ? 1 : 0,
                    permission.can_print   ? 1 : 0,
                ]
            );
        }

        return true;
    }

    // ==========================================================
    // Get Assigned Users
    // ==========================================================

    static async getAssignedUsers(roleId) {
        const [role] = await pool.query(
            `
            SELECT role_name
            FROM roles
            WHERE id = ?
            `,
            [roleId]
        );

        if (role.length === 0) {
            return [];
        }

        const roleName = role[0].role_name;

        const [rows] = await pool.query(
            `
            SELECT
                id,
                employee_id,
                employee_name,
                username,
                email,
                phone,
                department,
                plant,
                role,
                status,
                created_at
            FROM users
            WHERE role = ? AND is_deleted = 0
            ORDER BY employee_name ASC
            `,
            [roleName]
        );

        return rows;
    }

    // ==========================================================
    // Get Total Assigned Users
    // ==========================================================

    static async getAssignedUsersCount(roleId) {
        const [role] = await pool.query(
            `
            SELECT role_name
            FROM roles
            WHERE id = ?
            `,
            [roleId]
        );

        if (role.length === 0) {
            return 0;
        }

        const roleName = role[0].role_name;

        const [count] = await pool.query(
            `
            SELECT COUNT(*) as total
            FROM users
            WHERE role = ? AND is_deleted = 0
            `,
            [roleName]
        );

        return count[0].total;
    }

    // ==========================================================
    // Create Audit Log
    // ==========================================================

    static async createAuditLog(data) {
        await pool.query(
            `
            INSERT INTO role_audit_logs
            (
                role_id,
                action,
                description,
                old_data,
                new_data,
                ip_address,
                browser,
                performed_by
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?
            )
            `,
            [
                data.role_id,
                data.action,
                data.description,
                data.old_data || null,
                data.new_data || null,
                data.ip_address || null,
                data.browser || null,
                data.performed_by
            ]
        );

        return true;
    }

    // ==========================================================
    // Get Role Audit Logs
    // ==========================================================

    static async getRoleAuditLogs(roleId) {
        const [rows] = await pool.query(
            `
            SELECT
                id,
                role_id,
                action,
                description,
                old_data,
                new_data,
                ip_address,
                browser,
                performed_by,
                created_at
            FROM role_audit_logs
            WHERE role_id = ?
            ORDER BY created_at DESC
            `,
            [roleId]
        );

        return rows;
    }

    // ==========================================================
    // Duplicate Role
    // ==========================================================

    static async duplicateRole(roleId, createdBy) {
        const role = await this.getRoleById(roleId);

        if (!role) {
            throw new Error("Role not found.");
        }

        const newRoleCode = await this.generateRoleCode();
        // Ensure duplicated role_name is unique (append Copy, Copy (2), ...)
        const baseName = `${role.role_name} Copy`;
        let candidateName = baseName;
        let suffix = 1;
        while (await this.getRoleByName(candidateName)) {
            suffix += 1;
            candidateName = `${baseName} (${suffix})`;
        }

        const [result] = await pool.query(
            `
            INSERT INTO roles
            (
                role_code,
                role_name,
                description,
                department,
                level,
                status,
                is_system_role,
                color,
                icon,
                created_by,
                updated_by
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            `,
            [
                newRoleCode,
                candidateName,
                role.description,
                role.department,
                role.level,
                "Active",
                0,
                role.color,
                role.icon,
                createdBy,
                createdBy
            ]
        );

        const newRoleId = result.insertId;

        const permissions = await this.getRolePermissions(roleId);

        for (const permission of permissions) {
            await pool.query(
                `
                INSERT INTO role_permissions
                (
                    role_id,
                    module_name,
                    can_view,
                    can_create,
                    can_edit,
                    can_delete,
                    can_approve,
                    can_export
                )
                VALUES
                (
                    ?, ?, ?, ?, ?, ?, ?, ?
                )
                `,
                [
                    newRoleId,
                    permission.module_name,
                    permission.can_view,
                    permission.can_create,
                    permission.can_edit,
                    permission.can_delete,
                    permission.can_approve,
                    permission.can_export
                ]
            );
        }

        return newRoleId;
    }

    // ==========================================================
    // Delete Role Permissions
    // ==========================================================

    static async deleteRolePermissions(roleId) {
        await pool.query(
            `
            DELETE FROM role_permissions
            WHERE role_id = ?
            `,
            [roleId]
        );

        return true;
    }

    // ==========================================================
    // Delete Role Audit Logs
    // ==========================================================

    static async deleteRoleAuditLogs(roleId) {
        await pool.query(
            `
            DELETE FROM role_audit_logs
            WHERE role_id = ?
            `,
            [roleId]
        );

        return true;
    }
}

module.exports = RoleModel;