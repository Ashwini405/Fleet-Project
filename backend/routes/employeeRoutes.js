const express = require("express");

const router = express.Router();

const EmployeeController = require("../controllers/employeeController");
const { protect } = require("../middleware/permissionMiddleware");
const { verifyToken } = require("../middleware/authMiddleware");

// ==========================================================
// Employee Master
// ==========================================================

// Get All Employees
router.get(
    "/",
    ...protect("Staff Management", "view"),
    EmployeeController.getAllEmployees
);

// Search Employees
router.get(
    "/search",
    ...protect("Staff Management", "view"),
    EmployeeController.searchEmployees
);

// Employee Dropdown (accessible to anyone with a valid token — needed by User Management)
router.get(
    "/dropdown",
    verifyToken,
    EmployeeController.getEmployeeDropdown
);

// Department Dropdown
router.get(
    "/departments",
    ...protect("Staff Management", "view"),
    EmployeeController.getDepartmentList
);

// Plant Dropdown
router.get(
    "/plants",
    ...protect("Staff Management", "view"),
    EmployeeController.getPlantList
);

// Get Employee By ID
router.get(
    "/:id",
    ...protect("Staff Management", "view"),
    EmployeeController.getEmployeeById
);

// Create Employee
router.post(
    "/",
    ...protect("Staff Management", "create"),
    EmployeeController.createEmployee
);

// Update Employee
router.put(
    "/:id",
    ...protect("Staff Management", "edit"),
    EmployeeController.updateEmployee
);

// Update Employee Status
router.patch(
    "/:id/status",
    ...protect("Staff Management", "edit"),
    EmployeeController.updateEmployeeStatus
);

// Delete Employee
router.delete(
    "/:id",
    ...protect("Staff Management", "delete"),
    EmployeeController.deleteEmployee
);

module.exports = router;