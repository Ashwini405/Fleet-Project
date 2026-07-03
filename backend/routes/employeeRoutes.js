const express = require("express");

const router = express.Router();

const EmployeeController = require("../controllers/employeeController");

// ==========================================================
// Employee Master
// ==========================================================

// Get All Employees
router.get(
    "/",
    EmployeeController.getAllEmployees
);

// Search Employees
router.get(
    "/search",
    EmployeeController.searchEmployees
);

// Employee Dropdown
router.get(
    "/dropdown",
    EmployeeController.getEmployeeDropdown
);

// Department Dropdown
router.get(
    "/departments",
    EmployeeController.getDepartmentList
);

// Plant Dropdown
router.get(
    "/plants",
    EmployeeController.getPlantList
);

// Get Employee By ID
router.get(
    "/:id",
    EmployeeController.getEmployeeById
);

// Create Employee
router.post(
    "/",
    EmployeeController.createEmployee
);

// Update Employee
router.put(
    "/:id",
    EmployeeController.updateEmployee
);

// Update Employee Status
router.patch(
    "/:id/status",
    EmployeeController.updateEmployeeStatus
);

// Delete Employee
router.delete(
    "/:id",
    EmployeeController.deleteEmployee
);

module.exports = router;