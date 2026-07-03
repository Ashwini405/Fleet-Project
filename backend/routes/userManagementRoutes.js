const express = require("express");

const router = express.Router();

const UserManagementController = require("../controllers/userManagementController");

// ==========================================================
// Dashboard
// ==========================================================

router.get(
    "/dashboard",
    UserManagementController.getDashboardCounts
);

// ==========================================================
// Users
// ==========================================================

// Get All Users
router.get(
    "/",
    UserManagementController.getAllUsers
);

// Get User By ID
router.get(
    "/:id",
    UserManagementController.getUserById
);

// Create User
router.post(
    "/",
    UserManagementController.createUser
);

// Update User
router.put(
    "/:id",
    UserManagementController.updateUser
);

// Soft Delete User
router.delete(
    "/:id",
    UserManagementController.deleteUser
);

// Update User Status
router.patch(
    "/:id/status",
    UserManagementController.updateUserStatus
);

// Reset Password
router.post(
    "/:id/reset-password",
    UserManagementController.resetPassword
);

// ==========================================================
// Permissions
// ==========================================================

// Get User Permissions
router.get(
    "/:id/permissions",
    UserManagementController.getUserPermissions
);

// Save User Permissions
router.put(
    "/:id/permissions",
    UserManagementController.saveUserPermissions
);

// Initialize Default Permissions
router.post(
    "/:id/init-permissions",
    UserManagementController.initPermissions
);

// ==========================================================
// Login History
// ==========================================================

// Get Login History
router.get(
    "/:id/login-history",
    UserManagementController.getLoginHistory
);

// ==========================================================
// Audit Logs
// ==========================================================

// Get Audit Logs
router.get(
    "/:id/audit-logs",
    UserManagementController.getAuditLogs
);

module.exports = router;