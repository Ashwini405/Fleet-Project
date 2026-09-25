const express = require("express");
const router = express.Router();
const EmployeeController = require("../controllers/employeeController");
const upload = require("../config/multer");

const employeeUpload = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'id_document',   maxCount: 1 },
  { name: 'bank_document', maxCount: 1 },
]);

// ==========================================================
// Employee Master
// ==========================================================

// Get All Employees
router.get("/", EmployeeController.getAllEmployees);

// Search Employees
router.get("/search", EmployeeController.searchEmployees);

// Employee Dropdown
router.get("/dropdown", EmployeeController.getEmployeeDropdown);

// Department Dropdown
router.get("/departments", EmployeeController.getDepartmentList);

// Plant Dropdown
router.get("/plants", EmployeeController.getPlantList);

// Get Employee By ID
router.get("/:id", EmployeeController.getEmployeeById);

// Create Employee (supports multipart form-data)
router.post("/", employeeUpload, EmployeeController.createEmployee);

// Update Employee (supports multipart form-data)
router.put("/:id", employeeUpload, EmployeeController.updateEmployee);

// Update Employee Status
router.patch("/:id/status", EmployeeController.updateEmployeeStatus);

// Delete Employee
router.delete("/:id", EmployeeController.deleteEmployee);

module.exports = router;