const pool = require("../config/db");
const bcrypt = require("bcrypt");

class UserManagementModel {

    // ==========================================================
    // Generate Next User Code
    // ==========================================================

    static async generateUserCode() {
        const [rows] = await pool.query(`
            SELECT user_code
            FROM users
            ORDER BY id DESC
            LIMIT 1
        `);

        if (rows.length === 0) {
            return "USR001";
        }

        const lastCode = rows[0].user_code;
        const number = parseInt(lastCode.replace("USR", "")) + 1;

        return `USR${String(number).padStart(3, "0")}`;
    }

    // ==========================================================
    // Get Dashboard Counts
    // ==========================================================

    static async getDashboardCounts() {

        const [[total]] = await pool.query(`
            SELECT COUNT(*) AS totalUsers
            FROM users
            WHERE is_deleted = 0
        `);

        const [[active]] = await pool.query(`
            SELECT COUNT(*) AS activeUsers
            FROM users
            WHERE status='Active'
            AND is_deleted=0
        `);

        const [[disabled]] = await pool.query(`
            SELECT COUNT(*) AS disabledUsers
            FROM users
            WHERE status='Disabled'
            AND is_deleted=0
        `);

        const [[locked]] = await pool.query(`
            SELECT COUNT(*) AS lockedUsers
            FROM users
            WHERE status='Locked'
            AND is_deleted=0
        `);

        const [[admins]] = await pool.query(`
            SELECT COUNT(*) AS administrators
            FROM users
            WHERE role='Administrator'
            AND is_deleted=0
        `);

        const [[resetPending]] = await pool.query(`
            SELECT COUNT(*) AS pendingReset
            FROM users
            WHERE force_password_reset=1
            AND is_deleted=0
        `);

        return {
            totalUsers: total.totalUsers,
            activeUsers: active.activeUsers,
            disabledUsers: disabled.disabledUsers,
            lockedUsers: locked.lockedUsers,
            administrators: admins.administrators,
            pendingReset: resetPending.pendingReset
        };

    }

    // ==========================================================
    // Get All Users
    // ==========================================================

    static async getAllUsers(filters = {}) {

        let sql = `
            SELECT
                id,
                user_code,
                employee_id,
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
                last_login,
                created_by,
                updated_by,
                created_at,
                updated_at
            FROM users
            WHERE is_deleted = 0
        `;

        const values = [];

        if (filters.search) {

            sql += `
                AND
                (
                    employee_name LIKE ?
                    OR username LIKE ?
                    OR email LIKE ?
                    OR employee_id LIKE ?
                )
            `;

            const keyword = `%${filters.search}%`;

            values.push(keyword);
            values.push(keyword);
            values.push(keyword);
            values.push(keyword);

        }

        if (filters.role) {
            sql += ` AND role=? `;
            values.push(filters.role);
        }

        if (filters.status) {
            sql += ` AND status=? `;
            values.push(filters.status);
        }

        if (filters.department) {
            sql += ` AND department=? `;
            values.push(filters.department);
        }

        if (filters.plant) {
            sql += ` AND plant=? `;
            values.push(filters.plant);
        }

        sql += `
            ORDER BY id DESC
        `;

        const [rows] = await pool.query(sql, values);

        return rows;

    }

    // ==========================================================
    // Get User By ID
    // ==========================================================

    static async getUserById(id) {

        const [rows] = await pool.query(`
            SELECT
                *
            FROM users
            WHERE id=?
            AND is_deleted=0
        `,[id]);

        return rows.length ? rows[0] : null;

    }

    // ==========================================================
    // Check Username Exists
    // ==========================================================

    static async usernameExists(username,id=null){

        let sql=`
            SELECT id
            FROM users
            WHERE username=?
            AND is_deleted=0
        `;

        const params=[username];

        if(id){

            sql+=`
                AND id<>?
            `;

            params.push(id);

        }

        const [rows]=await pool.query(sql,params);

        return rows.length>0;

    }

    // ==========================================================
    // Check Email Exists
    // ==========================================================

    static async emailExists(email,id=null){

        let sql=`
            SELECT id
            FROM users
            WHERE email=?
            AND is_deleted=0
        `;

        const params=[email];

        if(id){

            sql+=`
                AND id<>?
            `;

            params.push(id);

        }

        const [rows]=await pool.query(sql,params);

        return rows.length>0;

    }
        // ==========================================================
    // Create User
    // ==========================================================

    static async createUser(userData) {

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const userCode = await this.generateUserCode();

        const [result] = await pool.query(
            `
            INSERT INTO users
            (
                user_code,
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
            )
            VALUES
            (
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            )
        `,
            [
                userCode,
                userData.employee_id,
                userData.employee_name,
                userData.username,
                userData.email,
                userData.phone,
                userData.department,
                userData.plant,
                userData.role,
                hashedPassword,
                userData.status || "Active",
                userData.allow_web ?? true,
                userData.allow_mobile ?? false,
                userData.force_password_reset ?? true,
                userData.created_by,
                userData.updated_by
            ]
        );

        return result.insertId;

    }

    // ==========================================================
    // Create Default Permissions
    // ==========================================================

   // ==========================================================
// Create Default Permissions
// ==========================================================

static async createDefaultPermissions(userId) {

    try {

        console.log("====================================");
        console.log("Creating Default Permissions");
        console.log("User ID :", userId);
        console.log("====================================");

        const modules = [

            "Dashboard",
            "Vehicle Master",
            "Station Master",
            "Supervisor Master",
            "Driver Master",
            "Trip Management",
            "Fuel Management",
            "Service Management",
            "Repair Management",
            "Garage Management",
            "Inventory",
            "Incidents",
            "Warranty",
            "Inspection",
            "Tyres",
            "Battery",
            "Income",
            "Expense",
            "Vendor",
            "Showroom",
            "Truck P&L",
            "Reports",
            "Company Profile",
            "User Management"

        ];

        for (const moduleName of modules) {

            console.log("Inserting :", moduleName);

            await pool.query(
                `
                INSERT INTO user_permissions
                (
                    user_id,
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
                    ?, ?, 1,0,0,0,0,0
                )
                `,
                [
                    userId,
                    moduleName
                ]
            );

            console.log(moduleName, "Inserted Successfully");

        }

        console.log("Default Permissions Created Successfully");

        return true;

    } catch (error) {

        console.error("CREATE DEFAULT PERMISSIONS ERROR :", error);

        throw error;

    }

}

    // ==========================================================
    // Update User
    // ==========================================================

    static async updateUser(id, userData) {

        const [result] = await pool.query(
            `
            UPDATE users
            SET
                employee_name=?,
                username=?,
                email=?,
                phone=?,
                department=?,
                plant=?,
                role=?,
                status=?,
                allow_web=?,
                allow_mobile=?,
                force_password_reset=?,
                updated_by=?
            WHERE id=?
            `,
            [
                userData.employee_name,
                userData.username,
                userData.email,
                userData.phone,
                userData.department,
                userData.plant,
                userData.role,
                userData.status,
                userData.allow_web,
                userData.allow_mobile,
                userData.force_password_reset,
                userData.updated_by,
                id
            ]
        );

        return result;

    }

    // ==========================================================
    // Soft Delete User
    // ==========================================================

    static async deleteUser(id, deletedBy) {

        const [result] = await pool.query(
            `
            UPDATE users
            SET
                is_deleted = 1,
                deleted_at = NOW(),
                deleted_by = ?
            WHERE id = ?
            `,
            [
                deletedBy,
                id
            ]
        );

        return result;

    }

    // ==========================================================
    // Update User Status
    // ==========================================================

    static async updateUserStatus(id, status) {

        const [result] = await pool.query(
            `
            UPDATE users
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                id
            ]
        );

        return result;

    }

    // ==========================================================
    // Reset Password
    // ==========================================================

    static async resetPassword(id, password) {

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `
            UPDATE users
            SET
                password = ?,
                force_password_reset = 1
            WHERE id = ?
            `,
            [
                hashedPassword,
                id
            ]
        );

        return result;

    }

    // ==========================================================
    // Insert Audit Log
    // ==========================================================

    static async createAuditLog(data) {

        await pool.query(
            `
            INSERT INTO audit_logs
            (
                user_id,
                module_name,
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
                ?,?,?,?,?,?,?,?,?
            )
            `,
            [
                data.user_id,
                data.module_name,
                data.action,
                data.description,
                data.old_data || null,
                data.new_data || null,
                data.ip_address || null,
                data.browser || null,
                data.performed_by
            ]
        );

    }
        // ==========================================================
    // Get User Permissions
    // ==========================================================

    static async getUserPermissions(userId) {

        const [rows] = await pool.query(
            `
            SELECT
                id,
                user_id,
                module_name,
                can_view,
                can_create,
                can_edit,
                can_delete,
                can_approve,
                can_export
            FROM user_permissions
            WHERE user_id=?
            ORDER BY module_name ASC
            `,
            [userId]
        );

        return rows;

    }

    // ==========================================================
    // Save User Permissions
    // ==========================================================

    static async saveUserPermissions(userId, permissions) {

        await pool.query(
            `
            DELETE FROM user_permissions
            WHERE user_id=?
            `,
            [userId]
        );

        for (const permission of permissions) {

            await pool.query(
                `
                INSERT INTO user_permissions
                (
                    user_id,
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
                    ?,?,?,?,?,?,?,?
                )
                `,
                [
                    userId,
                    permission.module_name,
                    permission.can_view || false,
                    permission.can_create || false,
                    permission.can_edit || false,
                    permission.can_delete || false,
                    permission.can_approve || false,
                    permission.can_export || false
                ]
            );

        }

        return true;

    }

    // ==========================================================
    // Get Login History
    // ==========================================================

    static async getLoginHistory(userId) {

        const [rows] = await pool.query(
            `
            SELECT
                id,
                login_time,
                logout_time,
                ip_address,
                browser,
                device,
                operating_system,
                login_type,
                status,
                remarks,
                created_at
            FROM user_login_history
            WHERE user_id=?
            ORDER BY login_time DESC
            `,
            [userId]
        );

        return rows;

    }

    // ==========================================================
    // Get Audit Logs
    // ==========================================================

    static async getAuditLogs(userId) {

        const [rows] = await pool.query(
            `
            SELECT
                id,
                module_name,
                action,
                description,
                old_data,
                new_data,
                ip_address,
                browser,
                performed_by,
                created_at
            FROM audit_logs
            WHERE user_id=?
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return rows;

    }

}

module.exports = UserManagementModel;