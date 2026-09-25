const EmployeeModel = require("../models/employeeModel");

class EmployeeController {

    // ==========================================================
    // Get All Employees
    // ==========================================================

    static async getAllEmployees(req, res) {

        try {

            const employees =
                await EmployeeModel.getAllEmployees();

            return res.status(200).json({

                success: true,

                message: "Employees fetched successfully.",

                data: employees

            });

        }

        catch (error) {

            console.error("GET EMPLOYEES ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch employees.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Get Employee By ID
    // ==========================================================

    static async getEmployeeById(req, res) {

        try {

            const { id } = req.params;

            const employee =
                await EmployeeModel.getEmployeeById(id);

            if (!employee) {

                return res.status(404).json({

                    success: false,

                    message: "Employee not found."

                });

            }

            return res.status(200).json({

                success: true,

                message: "Employee fetched successfully.",

                data: employee

            });

        }

        catch (error) {

            console.error("GET EMPLOYEE ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch employee.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Create Employee
    // ==========================================================

    static async createEmployee(req, res) {
        try {
            const data = {
                ...req.body,
                employee_name: req.body.employee_name || req.body.full_name || req.body.name,
                phone: req.body.phone || req.body.mobile,
                profile_photo: req.files?.profile_photo?.[0]?.filename || null,
                id_document:   req.files?.id_document?.[0]?.filename   || null,
                bank_document: req.files?.bank_document?.[0]?.filename || null,
            };

            if (!data.employee_name) {
                return res.status(400).json({
                    success: false,
                    message: "Employee name is required."
                });
            }

            const employeeId = await EmployeeModel.createEmployee(data);

            return res.status(201).json({
                success: true,
                message: "Employee created successfully.",
                employeeId
            });
        }
        catch (error) {
            console.error("CREATE EMPLOYEE ERROR :", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Unable to create employee.",
                error: error.message
            });
        }
    }

        // ==========================================================
    // Update Employee
    // ==========================================================

    static async updateEmployee(req, res) {
        try {
            const { id } = req.params;
            const employee = await EmployeeModel.getEmployeeById(id);
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found."
                });
            }

            const data = {
                employee_name: req.body.employee_name || req.body.full_name || req.body.name,
                department: req.body.department,
                plant: req.body.plant,
                email: req.body.email,
                phone: req.body.phone || req.body.mobile,
                status: req.body.status,
                id_card_number: req.body.id_card_number,
                address: req.body.address,
                station_id: req.body.station_id || null,
                bank_name: req.body.bank_name,
                account_number: req.body.account_number,
                ifsc_code: req.body.ifsc_code,
                notes: req.body.notes,
                profile_photo: req.files?.profile_photo?.[0]?.filename || null,
                id_document: req.files?.id_document?.[0]?.filename || null,
                bank_document: req.files?.bank_document?.[0]?.filename || null,
            };

            await EmployeeModel.updateEmployee(id, data);

            return res.status(200).json({
                success: true,
                message: "Employee updated successfully."
            });
        }
        catch (error) {
            console.error("UPDATE EMPLOYEE ERROR :", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Unable to update employee.",
                error: error.message
            });
        }
    }

    // ==========================================================
    // Delete Employee
    // ==========================================================

    static async deleteEmployee(req, res) {

        try {

            const { id } = req.params;

            const employee =
                await EmployeeModel.getEmployeeById(id);

            if (!employee) {

                return res.status(404).json({

                    success: false,

                    message: "Employee not found."

                });

            }

            await EmployeeModel.deleteEmployee(id);

            return res.status(200).json({

                success: true,

                message: "Employee deleted successfully."

            });

        }

        catch (error) {

            console.error("DELETE EMPLOYEE ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to delete employee.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Update Employee Status
    // ==========================================================

    static async updateEmployeeStatus(req, res) {

        try {

            const { id } = req.params;

            const { status } = req.body;

            const employee =
                await EmployeeModel.getEmployeeById(id);

            if (!employee) {

                return res.status(404).json({

                    success: false,

                    message: "Employee not found."

                });

            }

            await EmployeeModel.updateEmployeeStatus(

                id,

                status

            );

            return res.status(200).json({

                success: true,

                message: "Employee status updated successfully."

            });

        }

        catch (error) {

            console.error("UPDATE EMPLOYEE STATUS ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to update employee status.",

                error: error.message

            });

        }

    }
        // ==========================================================
    // Search Employees
    // ==========================================================

    static async searchEmployees(req, res) {

        try {

            const { search } = req.query;

            const employees =
                await EmployeeModel.searchEmployees(search || "");

            return res.status(200).json({

                success: true,

                message: "Employees fetched successfully.",

                data: employees

            });

        }

        catch (error) {

            console.error("SEARCH EMPLOYEE ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to search employees.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Employee Dropdown
    // ==========================================================

    static async getEmployeeDropdown(req, res) {

        try {

            const employees =
                await EmployeeModel.getEmployeeDropdown();

            return res.status(200).json({

                success: true,

                message: "Employee dropdown fetched successfully.",

                data: employees

            });

        }

        catch (error) {

            console.error("GET EMPLOYEE DROPDOWN ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch employee dropdown.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Department Dropdown
    // ==========================================================

    static async getDepartmentList(req, res) {

        try {

            const departments =
                await EmployeeModel.getDepartmentList();

            return res.status(200).json({

                success: true,

                message: "Departments fetched successfully.",

                data: departments

            });

        }

        catch (error) {

            console.error("GET DEPARTMENTS ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch departments.",

                error: error.message

            });

        }

    }

    // ==========================================================
    // Plant Dropdown
    // ==========================================================

    static async getPlantList(req, res) {

        try {

            const plants =
                await EmployeeModel.getPlantList();

            return res.status(200).json({

                success: true,

                message: "Plants fetched successfully.",

                data: plants

            });

        }

        catch (error) {

            console.error("GET PLANTS ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch plants.",

                error: error.message

            });

        }

    }

}

module.exports = EmployeeController;