const db = require("../config/db");

class EmployeeModel {

    // ==========================================================
    // Get All Employees
    // ==========================================================

    static async getAllEmployees() {

        try {

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
                    status,
                    created_at,
                    updated_at

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
    // Get Employee By ID
    // ==========================================================

    static async getEmployeeById(id) {

        try {

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
                    status,
                    created_at,
                    updated_at

                FROM employees

                WHERE id = ?
                `,

                [id]

            );

            return rows[0];

        }

        catch (error) {

            throw error;

        }

    }

    // ==========================================================
    // Check Employee ID Exists
    // ==========================================================

    static async employeeIdExists(employee_id) {

        try {

            const [rows] = await db.query(

                `
                SELECT id

                FROM employees

                WHERE employee_id = ?
                `,

                [employee_id]

            );

            return rows.length > 0;

        }

        catch (error) {

            throw error;

        }

    }

    // ==========================================================
    // Check Email Exists
    // ==========================================================

    static async emailExists(email) {

        try {

            const [rows] = await db.query(

                `
                SELECT id

                FROM employees

                WHERE email = ?
                `,

                [email]

            );

            return rows.length > 0;

        }

        catch (error) {

            throw error;

        }

    }
        // ==========================================================
    // Create Employee
    // ==========================================================

    static async createEmployee(employeeData) {

        try {

            const {

                employee_id,
                employee_name,
                department,
                plant,
                email,
                phone,
                status

            } = employeeData;

            const [result] = await db.query(

                `
                INSERT INTO employees (

                    employee_id,
                    employee_name,
                    department,
                    plant,
                    email,
                    phone,
                    status

                )

                VALUES (?,?,?,?,?,?,?)
                `,

                [

                    employee_id,
                    employee_name,
                    department,
                    plant,
                    email,
                    phone,
                    status

                ]

            );

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
                status

            } = employeeData;

            const [result] = await db.query(

                `
                UPDATE employees

                SET

                    employee_name = ?,
                    department = ?,
                    plant = ?,
                    email = ?,
                    phone = ?,
                    status = ?

                WHERE id = ?
                `,

                [

                    employee_name,
                    department,
                    plant,
                    email,
                    phone,
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