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

            const {

                employee_id,
                employee_name,
                department,
                plant,
                email,
                phone,
                status

            } = req.body;

            if (!employee_id || !employee_name || !department || !plant || !email) {

                return res.status(400).json({

                    success: false,

                    message: "Required fields are missing."

                });

            }

            const employeeExists =
                await EmployeeModel.employeeIdExists(employee_id);

            if (employeeExists) {

                return res.status(400).json({

                    success: false,

                    message: "Employee ID already exists."

                });

            }

            const emailExists =
                await EmployeeModel.emailExists(email);

            if (emailExists) {

                return res.status(400).json({

                    success: false,

                    message: "Email already exists."

                });

            }

            const employeeId =
                await EmployeeModel.createEmployee({

                    employee_id,
                    employee_name,
                    department,
                    plant,
                    email,
                    phone,
                    status

                });

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

                message: "Unable to create employee.",

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

            const {

                employee_name,
                department,
                plant,
                email,
                phone,
                status

            } = req.body;

            const employee =
                await EmployeeModel.getEmployeeById(id);

            if (!employee) {

                return res.status(404).json({

                    success: false,

                    message: "Employee not found."

                });

            }

            await EmployeeModel.updateEmployee(

                id,

                {

                    employee_name,
                    department,
                    plant,
                    email,
                    phone,
                    status

                }

            );

            return res.status(200).json({

                success: true,

                message: "Employee updated successfully."

            });

        }

        catch (error) {

            console.error("UPDATE EMPLOYEE ERROR :", error);

            return res.status(500).json({

                success: false,

                message: "Unable to update employee.",

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