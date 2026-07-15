const express = require("express");

const router = express.Router();

const UserManagementController = require("../controllers/userManagementController");
const { protect } = require("../middleware/permissionMiddleware");

// ==========================================================
// Dashboard
// ==========================================================

router.get(
    "/dashboard",
    ...protect("User Management", "view"),
    UserManagementController.getDashboardCounts
);

// ==========================================================
// Users
// ==========================================================

// Get All Users
router.get(
    "/",
    ...protect("User Management", "view"),
    UserManagementController.getAllUsers
);

// Get User By ID
router.get(
    "/:id",
    ...protect("User Management", "view"),
    UserManagementController.getUserById
);

// Create User
router.post(
    "/",
    ...protect("User Management", "create"),
    UserManagementController.createUser
);

// Update User
router.put(
    "/:id",
    ...protect("User Management", "edit"),
    UserManagementController.updateUser
);

// Soft Delete User
router.delete(
    "/:id",
    ...protect("User Management", "delete"),
    UserManagementController.deleteUser
);

// Update User Status
router.patch(
    "/:id/status",
    ...protect("User Management", "edit"),
    UserManagementController.updateUserStatus
);

// Reset Password
router.post(
    "/:id/reset-password",
    ...protect("User Management", "edit"),
    UserManagementController.resetPassword
);

// ==========================================================
// Permissions
// ==========================================================

// Get User Permissions
router.get(
    "/:id/permissions",
    ...protect("User Management", "view"),
    UserManagementController.getUserPermissions
);

// Save User Permissions
router.put(
    "/:id/permissions",
    ...protect("User Management", "edit"),
    UserManagementController.saveUserPermissions
);

// Initialize Default Permissions
router.post(
    "/:id/init-permissions",
    ...protect("User Management", "edit"),
    UserManagementController.initPermissions
);

// ==========================================================
// Login History
// ==========================================================

// Get Login History
router.get(
    "/:id/login-history",
    ...protect("User Management", "view"),
    UserManagementController.getLoginHistory
);

// ==========================================================
// Audit Logs
// ==========================================================

// Get Audit Logs
router.get(
    "/:id/audit-logs",
    ...protect("Audit Logs", "view"),
    UserManagementController.getAuditLogs
);

module.exports = router;
