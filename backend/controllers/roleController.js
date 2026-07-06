const RoleModel = require('../models/roleModel');

class RoleController {
    // ==========================================================
    // Dashboard Counts
    // ==========================================================

    static async getDashboardCounts(req, res) {
        try {
            const counts = await RoleModel.getDashboardCounts();

            return res.status(200).json({
                success: true,
                message: "Dashboard counts fetched successfully.",
                data: counts
            });
        } catch (error) {
            console.error("DASHBOARD COUNTS ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to fetch dashboard counts.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Get All Roles
    // ==========================================================

    static async getAllRoles(req, res) {
        try {
            const roles = await RoleModel.getAllRoles();

            return res.status(200).json({
                success: true,
                message: "Roles fetched successfully.",
                data: roles
            });
        } catch (error) {
            console.error("GET ALL ROLES ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to fetch roles.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Get Role By ID
    // ==========================================================

    static async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const role = await RoleModel.getRoleById(id);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Role fetched successfully.",
                data: role
            });
        } catch (error) {
            console.error("GET ROLE BY ID ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to fetch role.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Create Role
    // ==========================================================

    static async createRole(req, res) {
        try {
            const {
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
            } = req.body;

            // Check if role name already exists
            const exists = await RoleModel.roleNameExists(role_name);
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "Role name already exists."
                });
            }

            const roleId = await RoleModel.createRole({
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
            });

            // Create audit log
            await RoleModel.createAuditLog({
                role_id: roleId,
                action: "CREATE",
                description: `Role ${role_name} created successfully.`,
                performed_by: created_by
            });

            return res.status(201).json({
                success: true,
                message: "Role created successfully.",
                roleId: roleId
            });
        } catch (error) {
            console.error("CREATE ROLE ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to create role.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Update Role
    // ==========================================================

    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const {
                role_name,
                description,
                department,
                level,
                status,
                is_system_role,
                color,
                icon,
                updated_by
            } = req.body;

            const role = await RoleModel.getRoleById(id);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }

            // Check if role name already exists (excluding current role)
            const exists = await RoleModel.roleNameExists(role_name, id);
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "Role name already exists."
                });
            }

            await RoleModel.updateRole(id, {
                role_name,
                description,
                department,
                level,
                status,
                is_system_role,
                color,
                icon,
                updated_by
            });

            // Create audit log
            await RoleModel.createAuditLog({
                role_id: id,
                action: "UPDATE",
                description: `Role ${role_name} updated successfully.`,
                old_data: JSON.stringify(role),
                new_data: JSON.stringify(req.body),
                performed_by: updated_by
            });

            return res.status(200).json({
                success: true,
                message: "Role updated successfully."
            });
        } catch (error) {
            console.error("UPDATE ROLE ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to update role.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Delete Role
    // ==========================================================

    static async deleteRole(req, res) {
        try {
            const { id } = req.params;
            const { deleted_by } = req.body;

            const role = await RoleModel.getRoleById(id);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }

            // Check if role has assigned users
            const userCount = await RoleModel.getAssignedUsersCount(id);
            if (userCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete role. ${userCount} user(s) are assigned to this role.`
                });
            }

            // Create audit log BEFORE deleting the role to avoid foreign-key errors
            await RoleModel.createAuditLog({
                role_id: id,
                action: "DELETE",
                description: `Role ${role.role_name} deleted.`,
                performed_by: deleted_by
            });

            // Delete permissions and audit logs (audit logs may be cascaded by DB)
            await RoleModel.deleteRolePermissions(id);
            await RoleModel.deleteRoleAuditLogs(id);
            await RoleModel.deleteRole(id);

            return res.status(200).json({
                success: true,
                message: "Role deleted successfully."
            });
        } catch (error) {
            console.error("DELETE ROLE ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to delete role.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Update Role Status
    // ==========================================================

    static async updateRoleStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, updated_by } = req.body;

            const role = await RoleModel.getRoleById(id);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }

            await RoleModel.updateRoleStatus(id, status);

            await RoleModel.createAuditLog({
                role_id: id,
                action: "STATUS UPDATE",
                description: `Role status changed to ${status}.`,
                performed_by: updated_by
            });

            return res.status(200).json({
                success: true,
                message: "Role status updated successfully."
            });
        } catch (error) {
            console.error("STATUS UPDATE ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to update role status.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Get Role Permissions
    // ==========================================================

    static async getRolePermissions(req, res) {
        try {
            const { id } = req.params;
            const permissions = await RoleModel.getRolePermissions(id);

            return res.status(200).json({
                success: true,
                message: "Role permissions fetched successfully.",
                data: permissions
            });
        } catch (error) {
            console.error("GET ROLE PERMISSIONS ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to fetch role permissions.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Save Role Permissions
    // ==========================================================

    static async saveRolePermissions(req, res) {
        try {
            const { id } = req.params;
            const { permissions, updated_by } = req.body;

            if (!Array.isArray(permissions)) {
                return res.status(400).json({
                    success: false,
                    message: "Permissions must be an array."
                });
            }

            // Check if role exists
            const role = await RoleModel.getRoleById(id);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }

            await RoleModel.saveRolePermissions(id, permissions);

            await RoleModel.createAuditLog({
                role_id: id,
                action: "UPDATE PERMISSIONS",
                description: "Role permissions updated.",
                performed_by: updated_by
            });

            return res.status(200).json({
                success: true,
                message: "Role permissions updated successfully."
            });
        } catch (error) {
            console.error("SAVE ROLE PERMISSIONS ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to save role permissions.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Get Assigned Users
    // ==========================================================

    static async getAssignedUsers(req, res) {
        try {
            const { id } = req.params;
            const users = await RoleModel.getAssignedUsers(id);

            return res.status(200).json({
                success: true,
                message: "Assigned users fetched successfully.",
                data: users
            });
        } catch (error) {
            console.error("GET ASSIGNED USERS ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to fetch assigned users.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Get Role Audit Logs
    // ==========================================================

    static async getRoleAuditLogs(req, res) {
        try {
            const { id } = req.params;
            const logs = await RoleModel.getRoleAuditLogs(id);

            return res.status(200).json({
                success: true,
                message: "Role audit logs fetched successfully.",
                data: logs
            });
        } catch (error) {
            console.error("GET ROLE AUDIT LOGS ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to fetch role audit logs.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Duplicate Role
    // ==========================================================

    static async duplicateRole(req, res) {
        try {
            const { id } = req.params;
            const { created_by } = req.body;

            const role = await RoleModel.getRoleById(id);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: "Role not found."
                });
            }

            const newRoleId = await RoleModel.duplicateRole(id, created_by);

            await RoleModel.createAuditLog({
                role_id: newRoleId,
                action: "DUPLICATE",
                description: `Role duplicated from ${role.role_name}.`,
                performed_by: created_by
            });

            return res.status(201).json({
                success: true,
                message: "Role duplicated successfully.",
                roleId: newRoleId
            });
        } catch (error) {
            console.error("DUPLICATE ROLE ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to duplicate role.",
                error: error.message
            });
        }
    }
}

module.exports = RoleController;