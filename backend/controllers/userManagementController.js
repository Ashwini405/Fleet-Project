const bcrypt = require("bcrypt");
const UserManagementModel = require("../models/userManagementModel");

class UserManagementController {

    // ==========================================================
    // Dashboard Counts
    // ==========================================================

    static async getDashboardCounts(req, res) {

        try {

            const dashboard =
                await UserManagementModel.getDashboardCounts();

            return res.status(200).json({
                success: true,
                message: "Dashboard data fetched successfully.",
                data: dashboard
            });

        } catch (error) {

            console.error("GET DASHBOARD ERROR :", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch dashboard.",
                error: error.message
            });

        }

    }

    // ==========================================================
    // Get All Users
    // ==========================================================

    static async getAllUsers(req, res) {

        try {

            const filters = {

                search: req.query.search || "",

                role: req.query.role || "",

                status: req.query.status || "",

                department: req.query.department || "",

                plant: req.query.plant || ""

            };

            const users =
                await UserManagementModel.getAllUsers(filters);

            return res.status(200).json({

                success: true,

                total: users.length,

                message: "Users fetched successfully.",

                data: users

            });

        }

        catch (error) {

            console.error("GET USERS ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch users.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Get User By ID
    // ==========================================================

    static async getUserById(req, res) {

        try {

            const { id } = req.params;

            const user =
                await UserManagementModel.getUserById(id);

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            return res.status(200).json({

                success: true,

                message: "User fetched successfully.",

                data: user

            });

        }

        catch (error) {

            console.error("GET USER ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch user.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Create User
    // ==========================================================

    static async createUser(req, res) {

        try {

            const {

                employee_id,

                employee_name,

                username,

                email,

                phone,

                department,

                plant,

                role,

                password,

                status,

                allow_web,

                allow_mobile,

                force_password_reset,

                created_by,

                updated_by

            } = req.body;

            // -----------------------------

            if (
                !employee_id ||
                !employee_name ||
                !username ||
                !email ||
                !role ||
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Employee, Username, Email, Role and Password are required."

                });

            }

            // -----------------------------

            const usernameExists =
                await UserManagementModel.usernameExists(username);

            if (usernameExists) {

                return res.status(400).json({

                    success: false,

                    message: "Username already exists."

                });

            }

            // -----------------------------

            const emailExists =
                await UserManagementModel.emailExists(email);

            if (emailExists) {

                return res.status(400).json({

                    success: false,

                    message: "Email already exists."

                });

            }

            // -----------------------------

            const userId =
                await UserManagementModel.createUser({

                    employee_id,

                    employee_name,

                    username,

                    email,

                    phone,

                    department,

                    plant,

                    role,

                    password,

                    status,

                    allow_web,

                    allow_mobile,

                    force_password_reset,

                    created_by,

                    updated_by

                });

            await UserManagementModel.createDefaultPermissions(userId);

            // -----------------------------
            // Audit Log
            // -----------------------------

            await UserManagementModel.createAuditLog({

                user_id: userId,

                module_name: "User Management",

                action: "CREATE",

                description:
                    `User ${username} created successfully.`,

                performed_by: created_by

            });

            // -----------------------------

            return res.status(201).json({

                success: true,

                message: "User created successfully.",

                userId

            });

        }

        catch (error) {

            console.error("CREATE USER ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to create user.",

                error: error.message

            });

        }

    }
        // ==========================================================
    // Update User
    // ==========================================================

    static async updateUser(req, res) {

        try {

            const { id } = req.params;

            const {

                employee_name,
                username,
                email,
                phone,
                department,
                plant,
                role,
                status,
                allow_web,
                allow_mobile,
                force_password_reset,
                updated_by

            } = req.body;

            // ---------------------------------------

            const user =
                await UserManagementModel.getUserById(id);

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            // ---------------------------------------

            const usernameExists =
                await UserManagementModel.usernameExists(
                    username,
                    id
                );

            if (usernameExists) {

                return res.status(400).json({

                    success: false,

                    message: "Username already exists."

                });

            }

            // ---------------------------------------

            const emailExists =
                await UserManagementModel.emailExists(
                    email,
                    id
                );

            if (emailExists) {

                return res.status(400).json({

                    success: false,

                    message: "Email already exists."

                });

            }

            // ---------------------------------------

            await UserManagementModel.updateUser(id, {

                employee_name,

                username,

                email,

                phone,

                department,

                plant,

                role,

                status,

                allow_web,

                allow_mobile,

                force_password_reset,

                updated_by

            });

            // ---------------------------------------
            // Audit Log
            // ---------------------------------------

            await UserManagementModel.createAuditLog({

                user_id: id,

                module_name: "User Management",

                action: "UPDATE",

                description:
                    `User ${username} updated successfully.`,

                performed_by: updated_by

            });

            // ---------------------------------------

            return res.status(200).json({

                success: true,

                message: "User updated successfully."

            });

        }

        catch (error) {

            console.error("UPDATE USER ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to update user.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Soft Delete User
    // ==========================================================

    static async deleteUser(req, res) {

        try {

            const { id } = req.params;

            const { deleted_by } = req.body;

            const user =
                await UserManagementModel.getUserById(id);

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            await UserManagementModel.deleteUser(

                id,

                deleted_by

            );

            // ---------------------------------------
            // Audit Log
            // ---------------------------------------

            await UserManagementModel.createAuditLog({

                user_id: id,

                module_name: "User Management",

                action: "DELETE",

                description:
                    `User ${user.username} deleted.`,

                performed_by: deleted_by

            });

            return res.status(200).json({

                success: true,

                message: "User deleted successfully."

            });

        }

        catch (error) {

            console.error("DELETE USER ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to delete user.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Update User Status
    // ==========================================================

    static async updateUserStatus(req, res) {

        try {

            const { id } = req.params;

            const { status, updated_by } = req.body;

            const user =
                await UserManagementModel.getUserById(id);

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            await UserManagementModel.updateUserStatus(

                id,

                status

            );

            // ---------------------------------------
            // Audit Log
            // ---------------------------------------

            await UserManagementModel.createAuditLog({

                user_id: id,

                module_name: "User Management",

                action: "STATUS UPDATE",

                description:
                    `User status changed to ${status}.`,

                performed_by: updated_by

            });

            return res.status(200).json({

                success: true,

                message: "User status updated successfully."

            });

        }

        catch (error) {

            console.error("STATUS UPDATE ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to update status.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Reset Password
    // ==========================================================

    static async resetPassword(req, res) {

        try {

            const { id } = req.params;

            const {

                password,

                updated_by

            } = req.body;

            if (!password) {

                return res.status(400).json({

                    success: false,

                    message: "Password is required."

                });

            }

            await UserManagementModel.resetPassword(

                id,

                password

            );

            // ---------------------------------------
            // Audit Log
            // ---------------------------------------

            await UserManagementModel.createAuditLog({

                user_id: id,

                module_name: "User Management",

                action: "RESET PASSWORD",

                description:
                    "Password reset successfully.",

                performed_by: updated_by

            });

            return res.status(200).json({

                success: true,

                message:
                    "Password reset successfully."

            });

        }

        catch (error) {

            console.error("RESET PASSWORD ERROR :", error);

            return res.status(500).json({

                success: false,

                message:
                    "Unable to reset password.",

                error: error.message

            });

        }

    }
    // ==========================================================
    // Initialize Default Permissions
    // ==========================================================

    static async initPermissions(req, res) {

        try {

            const { id } = req.params;

            await UserManagementModel.createDefaultPermissions(id);

            return res.status(201).json({
                success: true,
                message: "Default permissions initialized."
            });

        } catch (error) {

            console.error("INIT PERMISSIONS ERROR :", error);

            return res.status(500).json({
                success: false,
                message: "Unable to initialize permissions.",
                error: error.message
            });

        }

    }

    // ==========================================================
    // Get User Permissions
    // ==========================================================

    static async getUserPermissions(req, res) {

        try {

            const { id } = req.params;

            const permissions =
                await UserManagementModel.getUserPermissions(id);

            return res.status(200).json({

                success: true,

                message: "User permissions fetched successfully.",

                data: permissions

            });

        }

        catch (error) {

            console.error("GET USER PERMISSIONS ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch permissions.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Save User Permissions
    // ==========================================================

    static async saveUserPermissions(req, res) {

        try {

            const { id } = req.params;

            const { permissions, updated_by } = req.body;

            if (!Array.isArray(permissions)) {

                return res.status(400).json({

                    success: false,

                    message: "Permissions must be an array."

                });

            }

            await UserManagementModel.saveUserPermissions(

                id,

                permissions

            );

            await UserManagementModel.createAuditLog({

                user_id: id,

                module_name: "User Management",

                action: "UPDATE PERMISSIONS",

                description: "User permissions updated.",

                performed_by: updated_by

            });

            return res.status(200).json({

                success: true,

                message: "Permissions updated successfully."

            });

        }

        catch (error) {

            console.error("SAVE USER PERMISSIONS ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to save permissions.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Get Login History
    // ==========================================================

    static async getLoginHistory(req, res) {

        try {

            const { id } = req.params;

            const history =
                await UserManagementModel.getLoginHistory(id);

            return res.status(200).json({

                success: true,

                message: "Login history fetched successfully.",

                data: history

            });

        }

        catch (error) {

            console.error("GET LOGIN HISTORY ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch login history.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Get Audit Logs
    // ==========================================================

    static async getAuditLogs(req, res) {

        try {

            const { id } = req.params;

            const logs =
                await UserManagementModel.getAuditLogs(id);

            return res.status(200).json({

                success: true,

                message: "Audit logs fetched successfully.",

                data: logs

            });

        }

        catch (error) {

            console.error("GET AUDIT LOGS ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch audit logs.",

                error: error.message

            });

        }

    }

}

module.exports = UserManagementController;