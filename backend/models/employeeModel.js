const db = require("../config/db");

class EmployeeModel {

    // ==========================================================
    // Get All Employees
    // ==========================================================

    static async getAllEmployees() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    e.*,
                    st.station_name
                FROM employees e
                LEFT JOIN stations st ON e.station_id = st.id
                ORDER BY e.created_at DESC
            `);
            return rows;
        }
        catch (error) {
            throw error;
        }
    }

    // ==========================================================
    // Get Employee By ID
    // ==========================================================

    static async getEmployeeById(id) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    e.*,
                    st.station_name
                FROM employees e
                LEFT JOIN stations st ON e.station_id = st.id
                WHERE e.id = ?
            `, [id]);
            return rows[0];
        }
        catch (error) {
            throw error;
        }
    }

    // ==========================================================
    // Check Employee ID Exists
    // ==========================================================

    static async employeeIdExists(employee_id, excludeId = null) {
        try {
            let sql = `SELECT id FROM employees WHERE employee_id = ?`;
            const params = [employee_id];
            if (excludeId) {
                sql += ` AND id != ?`;
                params.push(excludeId);
            }
            const [rows] = await db.query(sql, params);
            return rows.length > 0;
        }
        catch (error) {
            throw error;
        }
    }

    // ==========================================================
    // Check Email Exists
    // ==========================================================

    static async emailExists(email, excludeId = null) {
        try {
            if (!email) return false;
            let sql = `SELECT id FROM employees WHERE email = ?`;
            const params = [email];
            if (excludeId) {
                sql += ` AND id != ?`;
                params.push(excludeId);
            }
            const [rows] = await db.query(sql, params);
            return rows.length > 0;
        }
        catch (error) {
            throw error;
        }
    }

    // ==========================================================
    // Create Employee
    // ==========================================================

    static async createEmployee(data) {
        try {
            const [result] = await db.query(`
                INSERT INTO employees (
                    employee_id,
                    employee_name,
                    department,
                    plant,
                    email,
                    phone,
                    status,
                    id_card_number,
                    address,
                    station_id,
                    wallet_balance,
                    bank_name,
                    account_number,
                    ifsc_code,
                    notes,
                    profile_photo,
                    id_document,
                    bank_document
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.employee_id || `EMP-${Date.now().toString().slice(-4)}`,
                data.employee_name || data.name,
                data.department || 'Operations',
                data.plant || 'Head Office',
                data.email || `${(data.employee_name || 'emp').toLowerCase().replace(/\s+/g, '.')}${Date.now().toString().slice(-3)}@company.com`,
                data.phone || data.mobile || null,
                data.status || 'Active',
                data.id_card_number || null,
                data.address || null,
                data.station_id || null,
                data.wallet_balance ? Number(data.wallet_balance) : 0,
                data.bank_name || null,
                data.account_number || null,
                data.ifsc_code || null,
                data.notes || null,
                data.profile_photo || null,
                data.id_document || null,
                data.bank_document || null
            ]);

            // If employee_id was not explicitly passed, format it cleanly
            if (!data.employee_id) {
                const empCode = `EMP-${String(result.insertId).padStart(4, '0')}`;
                await db.query(`UPDATE employees SET employee_id = ? WHERE id = ?`, [empCode, result.insertId]);
            }

            return result.insertId;
        }
        catch (error) {
            throw error;
        }
    }


    // ==========================================================
    // Update Employee
    // ==========================================================

    static async updateEmployee(id, employeeData) {
        try {
            const {
                employee_name,
                department,
                plant,
                email,
                phone,
                status,
                id_card_number,
                address,
                station_id,
                bank_name,
                account_number,
                ifsc_code,
                notes,
                profile_photo,
                id_document,
                bank_document
            } = employeeData;

            const [result] = await db.query(
                `
                UPDATE employees
                SET
                    employee_name = COALESCE(?, employee_name),
                    department = COALESCE(?, department),
                    plant = COALESCE(?, plant),
                    email = COALESCE(?, email),
                    phone = COALESCE(?, phone),
                    status = COALESCE(?, status),
                    id_card_number = COALESCE(?, id_card_number),
                    address = COALESCE(?, address),
                    station_id = ?,
                    bank_name = COALESCE(?, bank_name),
                    account_number = COALESCE(?, account_number),
                    ifsc_code = COALESCE(?, ifsc_code),
                    notes = COALESCE(?, notes),
                    profile_photo = COALESCE(?, profile_photo),
                    id_document = COALESCE(?, id_document),
                    bank_document = COALESCE(?, bank_document)
                WHERE id = ?
                `,
                [
                    employee_name || null,
                    department || null,
                    plant || null,
                    email || null,
                    phone || null,
                    status || null,
                    id_card_number || null,
                    address || null,
                    station_id || null,
                    bank_name || null,
                    account_number || null,
                    ifsc_code || null,
                    notes || null,
                    profile_photo || null,
                    id_document || null,
                    bank_document || null,
                    id
                ]
            );

            return result.affectedRows;
        }
        catch (error) {
            throw error;
        }
    }

    // ==========================================================
    // Delete Employee
    // ==========================================================

    static async deleteEmployee(id) {

        try {

            const [result] = await db.query(

                `
                DELETE FROM employees

                WHERE id = ?
                `,

                [id]

            );

            return result.affectedRows;

        }

        catch (error) {

            throw error;

        }

    }

    // ==========================================================
    // Update Employee Status
    // ==========================================================

    static async updateEmployeeStatus(id, status) {

        try {

            const [result] = await db.query(

                `
                UPDATE employees

                SET status = ?

                WHERE id = ?
                `,

                [

                    status,
                    id

                ]

            );

            return result.affectedRows;

        }

        catch (error) {

            throw error;

        }

    }

    // ==========================================================
    // Search Employees
    // ==========================================================

    static async searchEmployees(search) {

        try {

            const keyword = `%${search}%`;

            const [rows] = await db.query(

                `
                SELECT

                    id,
                    employee_id,
                    employee_name,
                    department,
                    plant,
                    email,
                    phone,
                    status

                FROM employees

                WHERE

                    employee_name LIKE ?

                    OR employee_id LIKE ?

                    OR email LIKE ?

                    OR department LIKE ?

                    OR plant LIKE ?

                ORDER BY employee_name ASC
                `,

                [

                    keyword,
                    keyword,
                    keyword,
                    keyword,
                    keyword

                ]

            );

            return rows;

        }

        catch (error) {

            throw error;

        }

    }
        // ==========================================================
    // Get Employees For Dropdown
    // ==========================================================

    static async getEmployeeDropdown() {

        try {

            const [rows] = await db.query(

                `
                SELECT

                    employee_id AS id,
                    employee_name AS name,
                    department AS dept,
                    plant,
                    email,
                    phone

                FROM employees

                WHERE status = 'Active'

                ORDER BY employee_name ASC
                `

            );

            return rows;

        }

        catch (error) {

            throw error;

        }

    }

    // ==========================================================
    // Get Department List
    // ==========================================================

    static async getDepartmentList() {

        try {

            const [rows] = await db.query(

                `
                SELECT DISTINCT

                    department

                FROM employees

                WHERE status = 'Active'

                ORDER BY department ASC
                `

            );

            return rows;

        }

        catch (error) {

            throw error;

        }

    }

    // ==========================================================
    // Get Plant List
    // ==========================================================

    static async getPlantList() {

        try {

            const [rows] = await db.query(

                `
                SELECT DISTINCT

                    plant

                FROM employees

                WHERE status = 'Active'

                ORDER BY plant ASC
                `

            );

            return rows;

        }

        catch (error) {

            throw error;

        }

    }

}

module.exports = EmployeeModel;